const express = require('express');
const path = require("path");
const router = express.Router();
const dbPath = path.resolve(__dirname,'..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.get('/user/:id', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    const userId = req.params.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (user) {
        const userCreatorAppointments = db.prepare(`
        SELECT schedule.*, GROUP_CONCAT(participants.name) as participants
        FROM schedule
        LEFT JOIN appointment_participants ON schedule.id = appointment_participants.appointment_id
        LEFT JOIN participants ON appointment_participants.participant_id = participants.id
        WHERE schedule.user_creator = ?
        GROUP BY schedule.id
    `).all(user.username);

        const userParticipantAppointments = db.prepare(`
        SELECT schedule.*, GROUP_CONCAT(participants.name) as participants
        FROM schedule
        INNER JOIN appointment_participants ON schedule.id = appointment_participants.appointment_id
        INNER JOIN participants ON appointment_participants.participant_id = participants.id
        WHERE participants.name = ?
        GROUP BY schedule.id
    `).all(user.username);

        res.render('userProfile', {
            css:'userPage',
            user: user,
            creatorAppointments: userCreatorAppointments,
            participantAppointments: userParticipantAppointments
        });
    } else {
        res.status(404).send('User not found');
    }
});

module.exports = router;