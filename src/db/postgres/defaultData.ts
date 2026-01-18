import { getPostgresClient, resetPostgresDatabase } from './client';

/**
 * PostgreSQL schema definition
 */
const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INT,
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);
`;

/**
 * Seed data for users table (10 rows)
 */
const USERS_DATA = [
  { name: 'Alice Johnson', email: 'alice@example.com', age: 28, city: 'New York' },
  { name: 'Bob Smith', email: 'bob@example.com', age: 35, city: 'Los Angeles' },
  { name: 'Carol Williams', email: 'carol@example.com', age: 42, city: 'Chicago' },
  { name: 'David Brown', email: 'david@example.com', age: 31, city: 'Houston' },
  { name: 'Eva Martinez', email: 'eva@example.com', age: 26, city: 'Phoenix' },
  { name: 'Frank Lee', email: 'frank@example.com', age: 39, city: 'Philadelphia' },
  { name: 'Grace Kim', email: 'grace@example.com', age: 33, city: 'San Antonio' },
  { name: 'Henry Davis', email: 'henry@example.com', age: 45, city: 'San Diego' },
  { name: 'Ivy Chen', email: 'ivy@example.com', age: 29, city: 'Dallas' },
  { name: 'Jack Wilson', email: 'jack@example.com', age: 37, city: 'San Jose' },
];

/**
 * Seed data for products table (15 rows)
 */
const PRODUCTS_DATA = [
  { name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 150 },
  { name: 'USB-C Cable', category: 'Electronics', price: 12.99, stock: 300 },
  { name: 'Laptop Stand', category: 'Accessories', price: 49.99, stock: 75 },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock: 50 },
  { name: 'HD Monitor', category: 'Electronics', price: 199.99, stock: 30 },
  { name: 'Webcam 1080p', category: 'Electronics', price: 59.99, stock: 80 },
  { name: 'Desk Lamp', category: 'Furniture', price: 34.99, stock: 120 },
  { name: 'Office Chair', category: 'Furniture', price: 149.99, stock: 25 },
  { name: 'Notebook Pack', category: 'Stationery', price: 8.99, stock: 500 },
  { name: 'Pen Set', category: 'Stationery', price: 14.99, stock: 200 },
  { name: 'Wireless Headphones', category: 'Electronics', price: 79.99, stock: 60 },
  { name: 'Phone Stand', category: 'Accessories', price: 19.99, stock: 180 },
  { name: 'Coffee Mug', category: 'Accessories', price: 9.99, stock: 250 },
  { name: 'External SSD 1TB', category: 'Electronics', price: 129.99, stock: 40 },
  { name: 'Desk Organizer', category: 'Accessories', price: 24.99, stock: 100 },
];

/**
 * Seed data for orders table (20 rows)
 */
const ORDERS_DATA = [
  { user_id: 1, total: 239.97, status: 'completed' },
  { user_id: 2, total: 149.99, status: 'completed' },
  { user_id: 3, total: 59.98, status: 'pending' },
  { user_id: 4, total: 89.99, status: 'shipped' },
  { user_id: 5, total: 199.99, status: 'completed' },
  { user_id: 1, total: 34.99, status: 'completed' },
  { user_id: 6, total: 179.98, status: 'pending' },
  { user_id: 7, total: 59.99, status: 'shipped' },
  { user_id: 8, total: 299.98, status: 'completed' },
  { user_id: 9, total: 12.99, status: 'pending' },
  { user_id: 2, total: 49.99, status: 'shipped' },
  { user_id: 10, total: 89.99, status: 'completed' },
  { user_id: 3, total: 199.99, status: 'pending' },
  { user_id: 4, total: 79.99, status: 'shipped' },
  { user_id: 5, total: 24.99, status: 'completed' },
  { user_id: 1, total: 129.99, status: 'pending' },
  { user_id: 6, total: 59.98, status: 'shipped' },
  { user_id: 7, total: 149.99, status: 'completed' },
  { user_id: 8, total: 34.99, status: 'pending' },
  { user_id: 9, total: 89.99, status: 'completed' },
];

/**
 * Seed data for order_items table (30 rows)
 */
const ORDER_ITEMS_DATA = [
  { order_id: 1, product_id: 4, quantity: 1, price: 89.99 },
  { order_id: 1, product_id: 5, quantity: 1, price: 149.99 },
  { order_id: 2, product_id: 8, quantity: 1, price: 149.99 },
  { order_id: 3, product_id: 1, quantity: 2, price: 29.99 },
  { order_id: 4, product_id: 4, quantity: 1, price: 89.99 },
  { order_id: 5, product_id: 5, quantity: 1, price: 199.99 },
  { order_id: 6, product_id: 7, quantity: 1, price: 34.99 },
  { order_id: 7, product_id: 11, quantity: 1, price: 79.99 },
  { order_id: 7, product_id: 14, quantity: 1, price: 99.99 },
  { order_id: 8, product_id: 6, quantity: 1, price: 59.99 },
  { order_id: 9, product_id: 5, quantity: 1, price: 199.99 },
  { order_id: 9, product_id: 14, quantity: 1, price: 99.99 },
  { order_id: 10, product_id: 2, quantity: 1, price: 12.99 },
  { order_id: 11, product_id: 3, quantity: 1, price: 49.99 },
  { order_id: 12, product_id: 4, quantity: 1, price: 89.99 },
  { order_id: 13, product_id: 5, quantity: 1, price: 199.99 },
  { order_id: 14, product_id: 11, quantity: 1, price: 79.99 },
  { order_id: 15, product_id: 15, quantity: 1, price: 24.99 },
  { order_id: 16, product_id: 14, quantity: 1, price: 129.99 },
  { order_id: 17, product_id: 1, quantity: 2, price: 29.99 },
  { order_id: 18, product_id: 8, quantity: 1, price: 149.99 },
  { order_id: 19, product_id: 7, quantity: 1, price: 34.99 },
  { order_id: 20, product_id: 4, quantity: 1, price: 89.99 },
  { order_id: 1, product_id: 2, quantity: 2, price: 12.99 },
  { order_id: 3, product_id: 13, quantity: 2, price: 9.99 },
  { order_id: 6, product_id: 9, quantity: 1, price: 8.99 },
  { order_id: 11, product_id: 10, quantity: 1, price: 14.99 },
  { order_id: 15, product_id: 12, quantity: 1, price: 19.99 },
  { order_id: 17, product_id: 2, quantity: 1, price: 12.99 },
  { order_id: 19, product_id: 7, quantity: 1, price: 34.99 },
];

/**
 * Check if default data already exists
 * Verifies all required tables exist and have data
 */
async function hasDefaultData(): Promise<boolean> {
  try {
    const client = await getPostgresClient();

    // Check if all required tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'products', 'orders', 'order_items');
    `);

    if (tablesResult.rows.length < 4) {
      return false; // Not all tables exist
    }

    // Verify each table has at least one row
    for (const table of ['users', 'products', 'orders', 'order_items']) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${table};`);
      const count = parseInt((countResult.rows[0] as { count: string }).count, 10);
      if (count === 0) {
        return false; // Table exists but is empty
      }
    }

    return true; // All tables exist with data
  } catch {
    return false;
  }
}

/**
 * Load default PostgreSQL data
 * @returns true if data was loaded, false if it already existed
 */
export async function loadDefaultPostgresData(): Promise<boolean> {
  try {
    // Check if data already exists
    const hasData = await hasDefaultData();
    if (hasData) {
      return false;
    }

    const client = await getPostgresClient();

    // Create schema using exec() for multiple statements
    await client.exec(SCHEMA_SQL);

    // Insert users
    for (const user of USERS_DATA) {
      await client.query(
        'INSERT INTO users (name, email, age, city) VALUES ($1, $2, $3, $4)',
        [user.name, user.email, user.age, user.city]
      );
    }

    // Insert products
    for (const product of PRODUCTS_DATA) {
      await client.query(
        'INSERT INTO products (name, category, price, stock) VALUES ($1, $2, $3, $4)',
        [product.name, product.category, product.price, product.stock]
      );
    }

    // Insert orders
    for (const order of ORDERS_DATA) {
      await client.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
        [order.user_id, order.total, order.status]
      );
    }

    // Insert order items
    for (const item of ORDER_ITEMS_DATA) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [item.order_id, item.product_id, item.quantity, item.price]
      );
    }

    return true;
  } catch (error) {
    console.error('Failed to load default PostgreSQL data:', error);
    throw error;
  }
}

/**
 * Reset PostgreSQL data to defaults
 * Clears all data and reloads default schema and data
 */
export async function resetPostgresData(): Promise<void> {
  try {
    // Reset the database
    await resetPostgresDatabase();

    // Reload default data
    await loadDefaultPostgresData();
  } catch (error) {
    console.error('Failed to reset PostgreSQL data:', error);
    throw error;
  }
}
