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
db.exec('DROP TABLE IF EXISTS notifications');
db.exec('DROP TABLE IF EXISTS appointment_participants');
db.exec('DROP TABLE IF EXISTS participants');
db.exec('DROP TABLE IF EXISTS appointment_responses');
db.exec('DROP TABLE IF EXISTS notification_responses');
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
        user_creator TEXT NOT NULL
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

db.exec(`CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    appointment_id INTEGER,
    user_id INTEGER,
    message TEXT,
    unread BOOLEAN
)`);

db.exec(`CREATE TABLE appointment_participants (
    appointment_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY(appointment_id, user_id)
)`);

db.exec(`
CREATE TABLE appointment_responses (
    appointment_id INTEGER,
    participant_id INTEGER,
    response TEXT,
    FOREIGN KEY(appointment_id) REFERENCES schedule(id),
    FOREIGN KEY(participant_id) REFERENCES participants(id)
)`);

db.exec(`Create table participants (
    id INTEGER PRIMARY KEY,
    name TEXT
)`);

db.exec(`create table notification_responses (
    id serial primary key,
    user_id integer references users(id),
    response text,
    created_at timestamp default current_timestamp
);`);



console.log('Database and users table created successfully');