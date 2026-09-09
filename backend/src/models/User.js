const pool = require('../config/database');

const schema = {
  tableName: 'users',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    name: 'TEXT NOT NULL',
    email: 'TEXT UNIQUE NOT NULL',
    password_hash: 'TEXT NOT NULL',
    role: "VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user'))",
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  }
};

class User {
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
      console.log(`Table '${schema.tableName}' initialized successfully.`);
    } catch (error) {
      throw new Error(`Error initializing table: ${error.message}`);
    }
  }

  static async create(data) {
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at;
    `;
    try {
      const result = await pool.query(query, [data.name, data.email, data.password_hash, data.role || 'user']);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async getAll() {
    const query = 'SELECT id, name, email, role, created_at FROM users;';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  static async getById(id) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  static async getByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1;';
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  }

  static async update(id, data) {
    const query = `
      UPDATE users
      SET name = $1, email = $2, role = $3
      WHERE id = $4
      RETURNING id, name, email, role, created_at;
    `;
    try {
      const result = await pool.query(query, [data.name, data.email, data.role, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, name, email;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}

module.exports = User;
module.exports.schema = schema;
