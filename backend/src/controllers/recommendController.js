const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const pool = require('../config/database');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

const extractEmbedding = async (imagePath) => {
  try {
    const form = new FormData();
    
    // Create a readable stream from the file
    const fileStream = fs.createReadStream(imagePath);
    form.append('file', fileStream, { filename: path.basename(imagePath) });

    // Use axios with form data for reliable multipart upload
    const response = await axios.post(`${FASTAPI_URL}/extract`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (!response.data || !response.data.embedding) {
      throw new Error('Invalid response from FastAPI: missing embedding');
    }

    return response.data.embedding;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
    throw new Error(`Failed to extract embedding: ${errorMessage}`);
  }
};

const recommend = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imagePath = req.file.path;

    // Extract embedding from image using FastAPI
    const embedding = await extractEmbedding(imagePath);

    // Raw SQL query to find similar products using pgvector
    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.category,
        p.imageurl,
        p.description,
        1 - (pe.embedding <=> $1::vector) as similarity
      FROM products p
      INNER JOIN product_embeddings pe ON p.id = pe.product_id
      ORDER BY pe.embedding <=> $1::vector ASC
      LIMIT 2;
    `;

    const result = await pool.query(query, [
      JSON.stringify(embedding)
    ]);

    const similarProducts = result.rows;
    
    if (similarProducts.length === 0) {
      return res.json({ message: 'No similar products found', data: [] });
    }

    res.json({
      message: 'Similar products found',
      data: similarProducts
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { recommend };
