// Initialize express router
const express = require('express');
const router = express.Router();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.get('/appointments', (req, res) => {
    const appointments = db.prepare('SELECT schedule.*, GROUP_CONCAT(participants.name) as participants FROM schedule LEFT JOIN appointment_participants ON schedule.id = appointment_participants.appointment_id LEFT JOIN participants ON appointment_participants.participant_id = participants.id GROUP BY schedule.id').all();
    res.render('appointments', { appointments: appointments });
});

router.get('/appointments/edit/:id', (req, res) => {
    const appointmentId = req.params.id;
    const appointment = db.prepare('SELECT * FROM schedule WHERE id = ?').get(appointmentId);
    const participants = db.prepare('SELECT participants.name FROM participants INNER JOIN appointment_participants ON participants.id = appointment_participants.participant_id WHERE appointment_participants.appointment_id = ?').all(appointmentId);
    if (appointment) {
        res.render('editAppointment', { appointment: appointment, participants: participants });
    } else {
        res.status(404).send('Appointment not found');
    }
});

router.delete('/appointments/:id', (req, res) => {
    const appointmentId = req.params.id;
    const transaction = db.transaction(() => {
        // Delete any rows in other tables that reference this appointment_id
        // Replace 'other_table' and 'appointment_id_column_in_other_table' with your actual table and column names
        db.prepare('DELETE FROM appointment_participants WHERE appointment_id = ?').run(appointmentId);
        db.prepare('DELETE FROM participants WHERE id NOT IN (SELECT participant_id FROM appointment_participants)').run();

        // Then delete the appointment from the schedule and appointment_participants tables
        const info = db.prepare('DELETE FROM schedule WHERE id = ?').run(appointmentId);
        db.prepare('DELETE FROM appointment_participants WHERE appointment_id = ?').run(appointmentId);
        return info.changes;
    });

    const changes = transaction();
    if (changes > 0) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});
// routes/routeAppointments.js
router.put('/appointments/:id', (req, res) => {
    const appointmentId = req.params.id;
    const { title, date, time, user_participants } = req.body;

    // Update the appointment
    const info = db.prepare('UPDATE schedule SET title = ?, date = ?, time = ? WHERE id = ?').run(title, date, time, appointmentId);

    // Handle participants
    user_participants.forEach(participant => {
        // Insert the participant into the participants table
        const participantInfo = db.prepare('INSERT OR IGNORE INTO participants (name) VALUES (?)').run(participant);

        // Insert a row into the appointment_participants table
        db.prepare('INSERT OR IGNORE INTO appointment_participants (appointment_id, participant_id) VALUES (?, ?)').run(appointmentId, participantInfo.lastInsertRowid);
    });

    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

router.post('/appointments/close', (req, res) => {
    const { title, date, time, user_participants, user_creator } = req.body;

    // Insert the appointment into the schedule table
    const info = db.prepare('INSERT INTO schedule (title, date, time, user_creator) VALUES (?, ?, ?, ?)').run(title, date, time, user_creator);

    // Handle participants
    user_participants.forEach(participant => {
        // Insert the participant into the participants table
        const participantInfo = db.prepare('INSERT OR IGNORE INTO participants (name) VALUES (?)').run(participant);

        // Insert a row into the appointment_participants table
        db.prepare('INSERT OR IGNORE INTO appointment_participants (appointment_id, participant_id) VALUES (?, ?)').run(info.lastInsertRowid, participantInfo.lastInsertRowid);
    });

    if (info.changes > 0) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

module.exports = router;