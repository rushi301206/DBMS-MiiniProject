const db = require('../config/db');

let memoryRegistrations = [
    { registration_id: 1, event_id: 2, user_id: 3, participation_status: 'Attended', registered_at: '2026-09-10' },
    { registration_id: 2, event_id: 2, user_id: 5, participation_status: 'Attended', registered_at: '2026-09-11' },
    { registration_id: 3, event_id: 2, user_id: 6, participation_status: 'Attended', registered_at: '2026-09-12' },
    { registration_id: 4, event_id: 5, user_id: 3, participation_status: 'Attended', registered_at: '2026-09-18' },
    { registration_id: 5, event_id: 5, user_id: 4, participation_status: 'Attended', registered_at: '2026-09-19' },
    { registration_id: 6, event_id: 1, user_id: 5, participation_status: 'Registered', registered_at: '2026-10-20' }
];

exports.getRegistrations = async (req, res) => {
    const { user_id, event_id } = req.query;

    if (db.isLive()) {
        try {
            let sql = `
                SELECT 
                    r.registration_id,
                    r.event_id,
                    r.user_id,
                    r.participation_status,
                    r.registered_at,
                    e.event_name,
                    e.event_date,
                    o.org_name,
                    v.venue_name,
                    u.full_name AS student_name,
                    u.roll_no,
                    u.department,
                    f.rating AS feedback_rating,
                    f.comments AS feedback_comments
                FROM registrations r
                JOIN events e ON r.event_id = e.event_id
                JOIN organizations o ON e.organization_id = o.organization_id
                JOIN venues v ON e.venue_id = v.venue_id
                JOIN users u ON r.user_id = u.user_id
                LEFT JOIN feedback f ON r.registration_id = f.registration_id
                WHERE 1=1
            `;
            const params = [];
            if (user_id) {
                sql += ' AND r.user_id = ?';
                params.push(user_id);
            }
            if (event_id) {
                sql += ' AND r.event_id = ?';
                params.push(event_id);
            }
            sql += ' ORDER BY r.registration_id DESC';

            const rows = await db.query(sql, params);
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error in getRegistrations:', err.message);
        }
    }

    let result = [...memoryRegistrations];
    if (user_id) result = result.filter(r => r.user_id === Number(user_id));
    if (event_id) result = result.filter(r => r.event_id === Number(event_id));
    res.json({ success: true, source: 'memory', data: result });
};

exports.registerForEvent = async (req, res) => {
    const { event_id, user_id } = req.body;

    if (!event_id || !user_id) {
        return res.status(400).json({ success: false, message: 'event_id and user_id are required.' });
    }

    if (db.isLive()) {
        try {
            // Call stored procedure sp_register_for_event
            const callSql = 'CALL sp_register_for_event(?, ?, @statusCode, @statusMsg)';
            await db.query(callSql, [event_id, user_id]);

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

    // In-memory registration
    const existing = memoryRegistrations.find(r => r.event_id === Number(event_id) && r.user_id === Number(user_id));
    if (existing && existing.participation_status !== 'Cancelled') {
        return res.status(409).json({ success: false, message: 'Already registered for this event.' });
    }

    const newId = memoryRegistrations.length > 0 ? Math.max(...memoryRegistrations.map(r => r.registration_id)) + 1 : 1;
    memoryRegistrations.push({
        registration_id: newId,
        event_id: Number(event_id),
        user_id: Number(user_id),
        participation_status: 'Registered',
        registered_at: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ success: true, message: 'Registration successful.' });
};

exports.cancelRegistration = async (req, res) => {
    const regId = Number(req.params.id);

    if (db.isLive()) {
        try {
            await db.query("UPDATE registrations SET participation_status = 'Cancelled' WHERE registration_id = ?", [regId]);
            return res.json({ success: true, message: 'Registration cancelled.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const reg = memoryRegistrations.find(r => r.registration_id === regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    reg.participation_status = 'Cancelled';
    res.json({ success: true, message: 'Registration cancelled.' });
};

exports.markAttendance = async (req, res) => {
    const regId = Number(req.params.id);
    const { status } = req.body; // 'Attended' or 'Absent'

    if (!['Attended', 'Absent', 'Registered'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (db.isLive()) {
        try {
            await db.query("UPDATE registrations SET participation_status = ? WHERE registration_id = ?", [status, regId]);
            return res.json({ success: true, message: `Attendance marked as ${status}.` });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const reg = memoryRegistrations.find(r => r.registration_id === regId);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    reg.participation_status = status;
    res.json({ success: true, message: `Attendance marked as ${status}.` });
};
