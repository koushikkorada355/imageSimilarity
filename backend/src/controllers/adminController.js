const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Product = require('../models/Product');
const ProductEmbedding = require('../models/ProductEmbedding');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

const extractEmbedding = async (imagePath) => {
  try {
    const form = new FormData();
    
    // Determine content type based on file extension
    const ext = path.extname(imagePath).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    const contentType = contentTypeMap[ext] || 'image/jpeg';
    
    // Create readable stream for file
    const fileStream = fs.createReadStream(imagePath);
    form.append('file', fileStream, { 
      filename: path.basename(imagePath), 
      contentType 
    });

    // Use axios with form-data for reliable multipart upload
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
    console.error('Embedding extraction error:', errorMessage);
    throw new Error(`Failed to extract embedding: ${errorMessage}`);
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, description, price } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'name, category, and price are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    const imagePath = req.file.path;
    const imageRelPath = 'uploads/' + req.file.filename;

    const product = await Product.create({
      name,
      category,
      description,
      price,
      imageUrl: imageRelPath
    });

    const embedding = await extractEmbedding(imagePath);

    await ProductEmbedding.create({
      product_id: product.id,
      embedding
    });

    res.status(201).json({
      message: 'Product created with embedding',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price } = req.body;

    const existing = await Product.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let imageRelPath = existing.imageUrl;

    if (req.file) {
      const imagePath = req.file.path;
      imageRelPath = 'uploads/' + req.file.filename;

      const embedding = await extractEmbedding(imagePath);

      const existingEmbedding = await ProductEmbedding.getByProductId(id);
      if (existingEmbedding) {
        await ProductEmbedding.update(id, { embedding });
      } else {
        await ProductEmbedding.create({ product_id: id, embedding });
      }
    }

    const product = await Product.update(id, {
      name: name || existing.name,
      category: category || existing.category,
      description: description || existing.description,
      price: price || existing.price,
      imageUrl: imageRelPath
    });

    res.json({
      message: 'Product updated',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Product.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated embedding first
    await ProductEmbedding.delete(id);

    // Then delete the product
    await Product.delete(id);

    res.json({
      message: 'Product and embedding deleted',
      data: existing
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createProduct, updateProduct, deleteProduct, extractEmbedding };
