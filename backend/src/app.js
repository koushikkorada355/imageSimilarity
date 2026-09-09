const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendRoutes = require('./routes/recommendRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/recommend', recommendRoutes);

module.exports = app;
