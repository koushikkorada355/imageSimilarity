const pool = require('../config/database');

const schema = {
  tableName: 'products',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    name: 'TEXT NOT NULL',
    category: 'TEXT NOT NULL',
    description: 'TEXT',
    price: 'NUMERIC NOT NULL',
    imageurl: 'TEXT',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  }
};

class Product {
  static async initializeTable() {
    const columns = Object.entries(schema.columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
    
    const query = `
      CREATE TABLE IF NOT EXISTS ${schema.tableName} (
        ${columns}
      );
    `;
    
    try {
      await pool.query(query);
      
      // Migrate from image_path to imageUrl if needed
      const checkColumnQuery = `
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image_path';
      `;
      const result = await pool.query(checkColumnQuery);
      
      if (result.rows.length > 0) {
        // Column exists, need to migrate
        try {
          await pool.query('ALTER TABLE products RENAME COLUMN image_path TO imageUrl;');
          console.log('Migrated image_path to imageUrl');
        } catch (error) {
          console.warn('Migration not needed or already done');
        }
      }
      
      console.log(`Table '${schema.tableName}' initialized successfully.`);
    } catch (error) {
      throw new Error(`Error initializing table: ${error.message}`);
    }
  }

  static async create(data) {
    const query = `
      INSERT INTO products (name, category, description, price, imageurl)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [
        data.name,
        data.category,
        data.description,
        data.price,
        data.imageUrl
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  static async getAll() {
    const query = 'SELECT * FROM products ORDER BY created_at DESC;';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  static async getById(id) {
    const query = 'SELECT * FROM products WHERE id = $1;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  static async getByCategory(category) {
    const query = 'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC;';
    try {
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE products
      SET name = $1, category = $2, description = $3, price = $4, imageurl = $5
      WHERE id = $6
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [
        data.name,
        data.category,
        data.description,
        data.price,
        data.imageUrl,
        id
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }
}

module.exports = Product;
module.exports.schema = schema;
