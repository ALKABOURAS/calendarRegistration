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
db.exec(`create table messages
         (
             id          INTEGER
                 primary key autoincrement,
             message     TEXT not null,
             sender_id   TEXT not null,
             receiver_id TEXT not null,
             unread      INTEGER default 1
         );

        create table messages_dg_tmp
        (
            id          INTEGER
                primary key autoincrement,
            message     TEXT not null,
            creator_id  TEXT not null,
            receiver_id TEXT not null,
            unread      INTEGER default 1
        );

        create table participants
        (
            id   INTEGER
                primary key,
            name TEXT not null
        );

        create table notifications
        (
            id             INTEGER
                primary key autoincrement,
            participant_id INTEGER
                references participants,
            text           TEXT,
            created_at     TIMESTAMP default CURRENT_TIMESTAMP,
            user_id        INTEGER
        );

        create table schedule
        (
            id           INTEGER
                primary key autoincrement,
            title        TEXT not null,
            date         TEXT not null,
            time         TEXT not null,
            user_creator TEXT not null,
            length       INTEGER
        );

        create table appointment_participants
        (
            appointment_id INTEGER
                references schedule,
            participant_id INTEGER
                references participants,
            primary key (appointment_id, participant_id)
        );

        create table appointment_responses
        (
            appointment_id INTEGER
                references schedule,
            participant_id INTEGER
                references participants,
            response       TEXT
        );

        create table users
        (
            id       INTEGER
                primary key autoincrement,
            username TEXT not null
                unique,
            password TEXT not null
        );

    `

);




console.log('Database and users table created successfully');