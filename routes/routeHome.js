const express = require('express');
const path = require("path");
const router = express.Router();
const dbPath = path.resolve(__dirname,'..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.get('/', (req, res) => {
    const userId = req.session.userId;
    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
    res.render('index', {title: 'Home', user: user});
});
module.exports = router;