// Initialize express router
const express = require('express');
const router = express.Router();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.get('/appointments/edit/:id', (req, res) => {
    const appointmentId = req.params.id;
    const appointment = db.prepare('SELECT * FROM schedule WHERE id = ?').get(appointmentId);
    if (appointment) {
        res.render('editAppointment', { appointment: appointment });
    } else {
        res.status(404).send('Appointment not found');
    }
});

router.delete('/appointments/:id', (req, res) => {
    const appointmentId = req.params.id;
    const info = db.prepare('DELETE FROM schedule WHERE id = ?').run(appointmentId);
    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});


// routes/routeAppointments.js
router.put('/appointments/:id', (req, res) => {
    const appointmentId = req.params.id;
    const { title, date, time, user_participants } = req.body;
    const info = db.prepare('UPDATE schedule SET title = ?, date = ?, time = ?, user_participants = ? WHERE id = ?').run(title, date, time, user_participants, appointmentId);
    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// routes/routeAppointments.js
router.post('/appointments/close', (req, res) => {
    const { title, date, time, user_participants, user_creator } = req.body; // Extract user_creator
    const info = db.prepare('INSERT INTO schedule (title, date, time, user_participants, user_creator) VALUES (?, ?, ?, ?, ?)').run(title, date, time, user_participants, user_creator); // Include user_creator in the query
    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

module.exports = router;