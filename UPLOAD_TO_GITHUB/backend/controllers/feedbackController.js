const db = require('../config/db');

let memoryFeedback = [
    { feedback_id: 1, registration_id: 1, rating: 5, comments: 'Great hands-on design sprint! Figma prototyping was explained thoroughly.' },
    { feedback_id: 2, registration_id: 2, rating: 5, comments: 'Exceptional creative branding session. Marketing materials insights were practical.' },
    { feedback_id: 3, registration_id: 3, rating: 4, comments: 'Very insightful technical workshop organized by ACSES.' },
    { feedback_id: 4, registration_id: 4, rating: 5, comments: 'Tarang was electrifying! Stellar musical battles and great lighting.' },
    { feedback_id: 5, registration_id: 5, rating: 5, comments: 'Flawless event coordination and vibrant performances by the cultural squad.' }
];

exports.getAllFeedback = async (req, res) => {
    if (db.isLive()) {
        try {
            const sql = `
                SELECT 
                    f.feedback_id,
                    f.registration_id,
                    f.rating,
                    f.comments,
                    f.submitted_at,
                    e.event_name,
                    u.full_name AS student_name,
                    u.department
                FROM feedback f
                JOIN registrations r ON f.registration_id = r.registration_id
                JOIN events e ON r.event_id = e.event_id
                JOIN users u ON r.user_id = u.user_id
                ORDER BY f.feedback_id DESC
            `;
            const rows = await db.query(sql);
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error in getAllFeedback:', err.message);
        }
    }

    res.json({ success: true, source: 'memory', data: memoryFeedback });
};

exports.getFeedbackAnalytics = async (req, res) => {
    if (db.isLive()) {
        try {
            const rows = await db.query('SELECT * FROM vw_event_feedback_analytics');
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error fetching vw_event_feedback_analytics:', err.message);
        }
    }

    res.json({ success: true, source: 'memory', data: memoryFeedback });
};

exports.submitFeedback = async (req, res) => {
    const { registration_id, rating, comments } = req.body;

    if (!registration_id || !rating) {
        return res.status(400).json({ success: false, message: 'registration_id and rating are required.' });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (db.isLive()) {
        try {
            // Call stored procedure sp_submit_feedback
            const callSql = 'CALL sp_submit_feedback(?, ?, ?, @statusCode, @statusMsg)';
            await db.query(callSql, [registration_id, rating, comments || null]);

            const [output] = await db.query('SELECT @statusCode AS statusCode, @statusMsg AS statusMsg');
            const { statusCode, statusMsg } = output;

            if (statusCode !== 200) {
                return res.status(statusCode || 400).json({ success: false, message: statusMsg });
            }

            return res.status(201).json({ success: true, message: statusMsg });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const newId = memoryFeedback.length > 0 ? Math.max(...memoryFeedback.map(f => f.feedback_id)) + 1 : 1;
    memoryFeedback.push({
        feedback_id: newId,
        registration_id: Number(registration_id),
        rating: Number(rating),
        comments: comments || ''
    });

    res.status(201).json({ success: true, message: 'Feedback submitted successfully.' });
};

exports.deleteFeedback = async (req, res) => {
    const id = Number(req.params.id);

    if (db.isLive()) {
        try {
            await db.query('DELETE FROM feedback WHERE feedback_id = ?', [id]);
            return res.json({ success: true, message: 'Feedback entry deleted successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const idx = memoryFeedback.findIndex(f => f.feedback_id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Feedback entry not found.' });
    memoryFeedback.splice(idx, 1);
    res.json({ success: true, message: 'Feedback entry deleted successfully.' });
};
