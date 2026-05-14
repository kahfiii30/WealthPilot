const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

let dbPromise;

async function initDB() {
  try {
    // Open SQLite database (creates file if not exists)
    const db = await open({
      filename: './wealthpilot.db',
      driver: sqlite3.Database
    });

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default user if not exists
    const user = await db.get('SELECT * FROM users WHERE email = ?', ['kulbetfiii@gmail.com']);
    if (!user) {
      const hashedPassword = await bcrypt.hash('Bihara2005', 10);
      await db.run('INSERT INTO users (email, password) VALUES (?, ?)', ['kulbetfiii@gmail.com', hashedPassword]);
      console.log('Default user created: kulbetfiii@gmail.com');
    }

    console.log('SQLite Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}

// Initialize immediately
dbPromise = initDB();

module.exports = {
  getDb: () => dbPromise
};
