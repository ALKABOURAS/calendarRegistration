const express = require('express');
const path = require("path");
const router = express.Router();
const dbPath = path.resolve(__dirname,'..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (user) {
        const count = db.prepare(`
    SELECT COUNT(*) as total 
    FROM schedule 
    WHERE user_creator = ? OR user_participants = ?
`).get(user.username, user.username);
        const userCreatorAppointments = db.prepare('SELECT * FROM schedule WHERE user_creator = ?').all(user.username);
        const userParticipantAppointments = db.prepare('SELECT * FROM schedule WHERE user_participants = ?').all(user.username);
        res.render('userProfile', {
            css:'userPage',
            user: user,
            total: count.total,
            creatorAppointments: userCreatorAppointments,
            participantAppointments: userParticipantAppointments
        });
    } else {
        res.status(404).send('User not found');
    }
});

module.exports = router;