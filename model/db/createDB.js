const path = require('path');
const Database = require('better-sqlite3');

// Define the path to the database file
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Create a new SQLite database at the defined path
const db = new Database(dbPath);
// drop tables
db.exec('DROP TABLE IF EXISTS users');
db.exec('DROP TABLE IF EXISTS schedule');
db.exec('DROP TABLE IF EXISTS messages');
// Create a `users` table with appropriate columns
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);
// Create a `schedule` table with appropriate columns
db.exec(`
    CREATE TABLE IF NOT EXISTS schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        user_creator TEXT NOT NULL,
        user_participants TEXT NOT NULL
    )
`);
// Create a "messages" table with appropriate columns
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        user_creator TEXT NOT NULL,
        user_receiver TEXT NOT NULL
    )
`);

console.log('Database and users table created successfully');