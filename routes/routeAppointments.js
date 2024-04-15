// Initialize express router
const express = require('express');
const router = express.Router();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.use('/appointments/:id', (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'DELETE') {
        const appointmentId = req.params.id;
        const participants = db.prepare('SELECT participants.id FROM participants INNER JOIN appointment_participants ON participants.id = appointment_participants.participant_id WHERE appointment_participants.appointment_id = ?').all(appointmentId);

        participants.forEach(participant => {
            // Insert a notification into the notifications table
            const notificationText = `The appointment with ID ${appointmentId} has been updated.`;
            db.prepare('INSERT INTO notifications (participant_id, text) VALUES (?, ?)').run(participant.id, notificationText);
        });
    }

    // Call the next middleware function
    next();
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
    const { title, date, time} = req.body;

    // Update the appointment
    const info = db.prepare('UPDATE schedule SET title = ?, date = ?, time = ? WHERE id = ?').run(title, date, time, appointmentId);
    //
    // // Handle participants
    // user_participants.forEach(participant => {
    //     // Insert the participant into the participants table
    //     const participantInfo = db.prepare('INSERT OR IGNORE INTO participants (name) VALUES (?)').run(participant);
    //
    //     // Insert a row into the appointment_participants table
    //     db.prepare('INSERT OR IGNORE INTO appointment_participants (appointment_id, participant_id) VALUES (?, ?)').run(appointmentId, participantInfo.lastInsertRowid);
    // });

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

router.post('/appointments/:id/response', (req, res) => {
    const appointmentId = req.params.id;
    const participantId = req.session.userId; // Assuming the participant ID is stored in the session
    const { response } = req.body; // The response should be 'approved' or 'rejected'

    // Check if the participant has already responded to the appointment
    const existingResponse = db.prepare('SELECT * FROM appointment_responses WHERE appointment_id = ? AND participant_id = ?').get(appointmentId, participantId);

    if (existingResponse) {
        // Update the existing response
        db.prepare('UPDATE appointment_responses SET response = ? WHERE appointment_id = ? AND participant_id = ?').run(response, appointmentId, participantId);
    } else {
        // Insert a new response
        db.prepare('INSERT INTO appointment_responses (appointment_id, participant_id, response) VALUES (?, ?, ?)').run(appointmentId, participantId, response);
    }
    const creator = db.prepare('SELECT user_creator FROM schedule WHERE id = ?').get(appointmentId);
    const notificationText = `Participant ${participantId} has ${response} the appointment with ID ${appointmentId}.`;
    db.prepare('INSERT INTO notifications (participant_id, text) VALUES (?, ?)').run(creator.user_creator, notificationText);


    res.json({ success: 'Response recorded successfully.' });
});

module.exports = router;