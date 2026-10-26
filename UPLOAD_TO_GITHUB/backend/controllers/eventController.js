const db = require('../config/db');

// In-memory fallback dataset (matching abstract) if MySQL is not running
let memoryEvents = [
    { event_id: 1, organization_id: 1, venue_id: 3, created_by: 3, approved_by: 1, event_name: 'CodeBash 2026', description: 'Departmental competitive programming and algorithm hackathon on HackerRank.', event_date: '2026-10-25', max_participants: 100, approval_status: 'Approved', event_status: 'Upcoming' },
    { event_id: 2, organization_id: 1, venue_id: 4, created_by: 4, approved_by: 1, event_name: 'Design & UI/UX Sprint', description: 'Hands-on UI/UX product design sprint with Figma prototyping and design systems.', event_date: '2026-09-15', max_participants: 50, approval_status: 'Approved', event_status: 'Completed' },
    { event_id: 3, organization_id: 1, venue_id: 2, created_by: 5, approved_by: 1, event_name: 'Brand & Marketing Summit', description: 'Interactive session on brand positioning, student outreach, and content creation.', event_date: '2026-11-05', max_participants: 80, approval_status: 'Approved', event_status: 'Upcoming' },
    { event_id: 4, organization_id: 4, venue_id: 1, created_by: 3, approved_by: 1, event_name: 'E-Summit: Shark Tank SPIT', description: 'Annual entrepreneurship pitch competition before angel investors and alumni.', event_date: '2026-11-20', max_participants: 250, approval_status: 'Approved', event_status: 'Upcoming' },
    { event_id: 5, organization_id: 5, venue_id: 5, created_by: 6, approved_by: 1, event_name: 'Tarang: Cultural Showcase', description: 'Intra-college cultural extravaganza featuring music, dance, and theater.', event_date: '2026-09-22', max_participants: 400, approval_status: 'Approved', event_status: 'Completed' },
    { event_id: 6, organization_id: 6, venue_id: 5, created_by: 5, approved_by: null, event_name: 'Agility Cup: Football League', description: 'Inter-department 7v7 football championship league matches on college ground.', event_date: '2026-12-02', max_participants: 150, approval_status: 'Pending', event_status: 'Upcoming' },
    { event_id: 7, organization_id: 2, venue_id: 1, created_by: 5, approved_by: 1, event_name: 'The S.P.I.T. Hackathon 2026', description: 'Premier 24-hour national offline hackathon across Web3, AI/ML, and FinTech domains.', event_date: '2026-12-14', max_participants: 300, approval_status: 'Approved', event_status: 'Upcoming' },
    { event_id: 8, organization_id: 2, venue_id: 3, created_by: 5, approved_by: 2, event_name: 'unSQLved: Query & Schema Debugging', description: 'High-speed relational database debugging challenge solving complex SQL queries and 3NF anomalies.', event_date: '2026-10-10', max_participants: 100, approval_status: 'Approved', event_status: 'Completed' },
    { event_id: 9, organization_id: 3, venue_id: 1, created_by: 4, approved_by: 1, event_name: 'HackFusion 2026: Hybrid Hackathon', description: 'Flagship 24-hour hybrid hackathon co-hosted by IEEE Bombay Section with real-world industry tracks.', event_date: '2026-11-12', max_participants: 250, approval_status: 'Approved', event_status: 'Upcoming' },
    { event_id: 10, organization_id: 3, venue_id: 2, created_by: 3, approved_by: 2, event_name: 'Aeravat: AI & Deep Learning Summit', description: 'Specialized symposium on Large Language Models, vision transformers, and clinical diagnostic AI.', event_date: '2026-11-28', max_participants: 120, approval_status: 'Approved', event_status: 'Upcoming' },
    { event_id: 11, organization_id: 4, venue_id: 2, created_by: 4, approved_by: 2, event_name: 'Avalanche: Crisis Management Challenge', description: 'High-intensity corporate PR and boardroom simulation testing strategic adaptation under market panic.', event_date: '2026-10-05', max_participants: 75, approval_status: 'Approved', event_status: 'Completed' },
    { event_id: 12, organization_id: 5, venue_id: 1, created_by: 6, approved_by: 1, event_name: 'Oculus: Sargam Inter-College Singing', description: 'Flagship intra- and inter-collegiate solo and band singing showdown under the annual Oculus festival.', event_date: '2026-10-18', max_participants: 320, approval_status: 'Approved', event_status: 'Completed' },
    { event_id: 13, organization_id: 6, venue_id: 5, created_by: 5, approved_by: 1, event_name: 'SPoorthi: Inter-Collegiate Cricket Cup', description: 'Premier 8-team inter-engineering box cricket championship on the college grounds with live scoring.', event_date: '2026-12-18', max_participants: 200, approval_status: 'Approved', event_status: 'Upcoming' },
    { event_id: 14, organization_id: 6, venue_id: 5, created_by: 3, approved_by: null, event_name: 'SPIT Marathon: Run for Mental Health', description: 'Annual 5K and 10K campus marathon traversing Juhu-Andheri to raise awareness for student well-being.', event_date: '2026-12-28', max_participants: 350, approval_status: 'Pending', event_status: 'Upcoming' },
    { event_id: 15, organization_id: 2, venue_id: 4, created_by: 4, approved_by: 2, event_name: 'Pixel Perfect: UI/UX Design Sprint', description: 'Rapid 4-hour Figma design battle building interactive mobile prototypes and design tokens.', event_date: '2026-09-28', max_participants: 50, approval_status: 'Approved', event_status: 'Completed' }
];

exports.getAllEvents = async (req, res) => {
    if (db.isLive()) {
        try {
            const sql = `
                SELECT 
                    e.*,
                    o.org_name,
                    v.venue_name,
                    v.capacity AS venue_capacity,
                    u.full_name AS created_by_name,
                    appr.full_name AS approved_by_name,
                    COUNT(r.registration_id) AS registered_count
                FROM events e
                JOIN organizations o ON e.organization_id = o.organization_id
                JOIN venues v ON e.venue_id = v.venue_id
                JOIN users u ON e.created_by = u.user_id
                LEFT JOIN users appr ON e.approved_by = appr.user_id
                LEFT JOIN registrations r ON e.event_id = r.event_id AND r.participation_status != 'Cancelled'
                GROUP BY e.event_id
                ORDER BY e.event_date ASC
            `;
            const rows = await db.query(sql);
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error in getAllEvents:', err.message);
        }
    }

    // Fallback
    res.json({ success: true, source: 'memory', data: memoryEvents });
};

exports.getUpcomingApprovedEvents = async (req, res) => {
    if (db.isLive()) {
        try {
            const rows = await db.query('SELECT * FROM vw_approved_upcoming_events');
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error fetching vw_approved_upcoming_events:', err.message);
        }
    }

    const filtered = memoryEvents.filter(e => e.approval_status === 'Approved' && e.event_status === 'Upcoming');
    res.json({ success: true, source: 'memory', data: filtered });
};

exports.proposeEvent = async (req, res) => {
    const { organization_id, venue_id, created_by, event_name, description, event_date, max_participants } = req.body;

    if (!organization_id || !venue_id || !created_by || !event_name || !event_date || !max_participants) {
        return res.status(400).json({ success: false, message: 'Missing required event fields.' });
    }

    if (db.isLive()) {
        try {
            const sql = `
                INSERT INTO events 
                (organization_id, venue_id, created_by, approved_by, event_name, description, event_date, max_participants, approval_status, event_status)
                VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'Pending', 'Upcoming')
            `;
            const result = await db.query(sql, [
                organization_id,
                venue_id,
                created_by,
                event_name,
                description || '',
                event_date,
                max_participants
            ]);

            return res.status(201).json({
                success: true,
                message: 'Event proposed successfully. Pending faculty advisor review.',
                event_id: result.insertId
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const newId = memoryEvents.length > 0 ? Math.max(...memoryEvents.map(e => e.event_id)) + 1 : 1;
    const newEvent = {
        event_id: newId,
        organization_id: Number(organization_id),
        venue_id: Number(venue_id),
        created_by: Number(created_by),
        approved_by: null,
        event_name,
        description: description || '',
        event_date,
        max_participants: Number(max_participants),
        approval_status: 'Pending',
        event_status: 'Upcoming'
    };
    memoryEvents.push(newEvent);

    res.status(201).json({ success: true, message: 'Event proposed successfully (memory).', event_id: newId });
};

exports.approveEvent = async (req, res) => {
    const eventId = Number(req.params.id);
    const { approver_id } = req.body;

    if (!approver_id) {
        return res.status(400).json({ success: false, message: 'Approver user ID is required.' });
    }

    if (db.isLive()) {
        try {
            // Call stored procedure sp_approve_event_proposal
            const callSql = 'CALL sp_approve_event_proposal(?, ?, @statusCode, @statusMsg)';
            await db.query(callSql, [eventId, approver_id]);

            const [output] = await db.query('SELECT @statusCode AS statusCode, @statusMsg AS statusMsg');
            const { statusCode, statusMsg } = output;

            if (statusCode !== 200) {
                return res.status(statusCode || 400).json({ success: false, message: statusMsg });
            }

            return res.json({ success: true, message: statusMsg });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const ev = memoryEvents.find(e => e.event_id === eventId);
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Conflict check simulation
    const clash = memoryEvents.find(other => 
        other.event_id !== eventId &&
        other.venue_id === ev.venue_id &&
        other.event_date === ev.event_date &&
        other.approval_status === 'Approved' &&
        other.event_status !== 'Cancelled'
    );

    if (clash) {
        return res.status(409).json({
            success: false,
            message: `Venue Conflict: Another approved event ("${clash.event_name}") is already booked on this date.`
        });
    }

    ev.approval_status = 'Approved';
    ev.approved_by = approver_id;
    res.json({ success: true, message: 'Event approved successfully.' });
};

exports.rejectEvent = async (req, res) => {
    const eventId = Number(req.params.id);

    if (db.isLive()) {
        try {
            await db.query("UPDATE events SET approval_status = 'Rejected' WHERE event_id = ?", [eventId]);
            return res.json({ success: true, message: 'Event rejected.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const ev = memoryEvents.find(e => e.event_id === eventId);
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found.' });
    ev.approval_status = 'Rejected';
    res.json({ success: true, message: 'Event rejected.' });
};

exports.deleteEvent = async (req, res) => {
    const eventId = Number(req.params.id);
    const reqId = (req.body && req.body.requester_id) || req.headers['x-user-id'] || req.query.requester_id;

    let ev = null;
    if (db.isLive()) {
        try {
            const [row] = await db.query('SELECT * FROM events WHERE event_id = ?', [eventId]);
            ev = row;
        } catch (e) {}
    } else {
        ev = memoryEvents.find(e => e.event_id === eventId);
    }

    if (!ev) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (reqId) {
        const uid = Number(reqId);
        const userController = require('./userController');
        const clubController = require('./clubController');
        const user = userController.getMemoryUser ? userController.getMemoryUser(uid) : null;
        const memberships = clubController.getMemoryMemberships ? clubController.getMemoryMemberships() : [];

        const isLeadOfClub = memberships.some(m => m.user_id === uid && m.organization_id === ev.organization_id && (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson'));
        const isSupervisor = (user && (user.role_name === 'Administrator' || user.role_name === 'Faculty'));
        const isAuthorOfPending = (ev.created_by === uid && ev.approval_status === 'Pending');

        if (!isSupervisor && !isLeadOfClub && !isAuthorOfPending) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied (403): You cannot delete an event that does not belong to your committee.'
            });
        }
    }

    if (db.isLive()) {
        try {
            const callSql = 'CALL sp_delete_event(?, @statusCode, @statusMsg)';
            await db.query(callSql, [eventId]);

            const [output] = await db.query('SELECT @statusCode AS statusCode, @statusMsg AS statusMsg');
            const { statusCode, statusMsg } = output;

            if (statusCode !== 200) {
                return res.status(statusCode || 400).json({ success: false, message: statusMsg });
            }

            return res.json({ success: true, message: statusMsg });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const idx = memoryEvents.findIndex(e => e.event_id === eventId);
    if (idx !== -1) memoryEvents.splice(idx, 1);
    res.json({ success: true, message: 'Event deleted successfully.' });
};

exports.updateEvent = async (req, res) => {
    const eventId = Number(req.params.id);
    const { event_name, description, event_date, max_participants, venue_id, event_status } = req.body;

    if (db.isLive()) {
        try {
            const sql = `
                UPDATE events 
                SET event_name = COALESCE(?, event_name),
                    description = COALESCE(?, description),
                    event_date = COALESCE(?, event_date),
                    max_participants = COALESCE(?, max_participants),
                    venue_id = COALESCE(?, venue_id),
                    event_status = COALESCE(?, event_status)
                WHERE event_id = ?
            `;
            await db.query(sql, [event_name, description, event_date, max_participants, venue_id, event_status, eventId]);
            return res.json({ success: true, message: 'Event updated successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const ev = memoryEvents.find(e => e.event_id === eventId);
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event_name) ev.event_name = event_name;
    if (description) ev.description = description;
    if (event_date) ev.event_date = event_date;
    if (max_participants) ev.max_participants = Number(max_participants);
    if (venue_id) ev.venue_id = Number(venue_id);
    if (event_status) ev.event_status = event_status;

    res.json({ success: true, message: 'Event updated successfully.', event: ev });
};
