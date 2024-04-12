const express = require('express');
const path = require("path");
const router = express.Router();
const dbPath = path.resolve(__dirname,'..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user && user.password === password) {
        // Passwords match
        // Create a session for the user
        req.session.userId = user.id;
        res.status(200).redirect(`/user/${user.id}`);
    } else {
        // Passwords do not match or user does not exist
        res.status(401).send('Login failed');
    }
});



module.exports = router;