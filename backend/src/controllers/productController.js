const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.getByCategory(req.params.category);
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllProducts, getProductById, getProductsByCategory };
