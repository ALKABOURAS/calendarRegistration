const express = require('express');
const path = require("path");
const router = express.Router();
const dbPath = path.resolve(__dirname,'..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.get('/messages', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    const userId = req.session.userId; // Assuming the userId is stored in the session
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const messages = db.prepare('SELECT * FROM messages WHERE receiver_id = ?').all(userId);
    const unreadCount = db.prepare('SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND unread = 1').get(userId);
    res.render('messages', { messages: messages, user: user, unreadCount: unreadCount.count(), css: 'messages'}); });

router.post('/messages/send', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    const { sender_id, receiver_username, content } = req.body;
    const receiver = db.prepare('SELECT * FROM users WHERE username = ?').get(receiver_username);

    if (!receiver) {
        return res.status(400).json({ error: 'The receiver does not exist.' });
    }

    const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, message, unread) VALUES (?, ?, ?, 1)');
    stmt.run(sender_id, receiver.id, content);

    res.json({ success: 'Message sent successfully.' });
});

router.post('/messages/delete/:id', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
    stmt.run(req.params.id);

    res.redirect('/messages');
});

router.post('/messages/read/:id', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    const stmt = db.prepare('UPDATE messages SET unread = 0 WHERE id = ?');
    stmt.run(req.params.id);

    res.redirect('/messages');
});

router.post('/messages/unread/:id', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    const stmt = db.prepare('UPDATE messages SET unread = 1 WHERE id = ?');
    stmt.run(req.params.id);

    res.redirect('/messages');
});

module.exports = router;