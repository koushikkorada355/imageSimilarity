require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/database');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const ProductEmbedding = require('./src/models/ProductEmbedding');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully.');

    await ProductEmbedding.initializePgvector();

    await User.initializeTable();
    await Product.initializeTable();
    await ProductEmbedding.initializeTable();
    
    await ProductEmbedding.createIndex();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
