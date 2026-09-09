const pool = require('./src/config/database');
const path = require('path');
const fs = require('fs');

const seedProducts = async () => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sampleProducts = [
      {
        name: 'Wireless Headphones',
        price: 79.99,
        category: 'electronics',
        description: 'High-quality wireless headphones with noise cancellation',
        imageUrl: 'https://via.placeholder.com/300?text=Wireless+Headphones'
      },
      {
        name: 'Running Shoes',
        price: 129.99,
        category: 'footwear',
        description: 'Comfortable running shoes with cushioned sole',
        imageUrl: 'https://via.placeholder.com/300?text=Running+Shoes'
      },
      {
        name: 'Smartphone Case',
        price: 24.99,
        category: 'electronics',
        description: 'Protective phone case with shock absorption',
        imageUrl: 'https://via.placeholder.com/300?text=Phone+Case'
      },
      {
        name: 'Water Bottle',
        price: 34.99,
        category: 'outdoors',
        description: 'Insulated water bottle keeps drinks cold for 24 hours',
        imageUrl: 'https://via.placeholder.com/300?text=Water+Bottle'
      },
      {
        name: 'Blue Backpack',
        price: 69.99,
        category: 'bags',
        description: 'Durable travel backpack with multiple compartments',
        imageUrl: 'https://via.placeholder.com/300?text=Blue+Backpack'
      },
      {
        name: 'Wireless Earbuds',
        price: 119.99,
        category: 'electronics',
        description: 'True wireless earbuds with 30-hour battery life',
        imageUrl: 'https://via.placeholder.com/300?text=Wireless+Earbuds'
      }
    ];

    for (const product of sampleProducts) {
      const query = `
        INSERT INTO products (name, price, category, description, imageurl)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;
      await pool.query(query, [
        product.name,
        product.price,
        product.category,
        product.description,
        product.imageUrl
      ]);
    }

    console.log('Sample products seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();
