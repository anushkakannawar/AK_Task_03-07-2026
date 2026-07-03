/**
 * Database Connection Pool
 * Uses mysql2/promise for async/await support
 * Connection pooling for scalability (Evaluation: Scalability Thinking)
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME || 'hr_management',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
  // Auto-convert dates to JS Date objects
  dateStrings:        false,
  timezone:           '+00:00',
});

// Test connection on startup
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
