const db = require('../config/db');

let memoryAnnouncements = [
    { announcement_id: 1, organization_id: 1, created_by: 3, title: 'CodeBash 2026: Team Registrations Open', description: 'Registrations live on HackerRank! Teams of 2 to 3 before Oct 22.', posted_at: '2026-10-18' },
    { announcement_id: 2, organization_id: 1, created_by: 4, title: 'ACSES Creatives & Design Submissions', description: 'Call for banner artwork, event posters, and teaser video edits.', posted_at: '2026-09-05' },
    { announcement_id: 3, organization_id: 1, created_by: 5, title: 'ACSES Marketing & Sponsorship Drive', description: 'Applications invited for student marketing associates for annual symposium.', posted_at: '2026-10-22' },
    { announcement_id: 4, organization_id: 4, created_by: 3, title: 'Shark Tank SPIT: Pitch Deck Deadline', description: 'Submit 5-slide startup pitch deck by Nov 15 for investor pitches.', posted_at: '2026-10-24' },
    { announcement_id: 5, organization_id: 5, created_by: 6, title: 'Auditions for Mudra Dance Squad', description: 'Auditions for the annual intra-college dance troupe this Friday in Quadrangle.', posted_at: '2026-09-12' },
    { announcement_id: 6, organization_id: 6, created_by: 5, title: 'Agility Cup: Fixture Schedule Released', description: 'Inter-department cricket and football draws published on sports noticeboard.', posted_at: '2026-10-25' }
];

exports.getAllAnnouncements = async (req, res) => {
    if (db.isLive()) {
        try {
            const sql = `
                SELECT 
                    a.announcement_id,
                    a.organization_id,
                    a.title,
                    a.description,
                    a.posted_at,
                    o.org_name,
                    u.full_name AS poster_name
                FROM announcements a
                JOIN organizations o ON a.organization_id = o.organization_id
                JOIN users u ON a.created_by = u.user_id
                ORDER BY a.posted_at DESC, a.announcement_id DESC
            `;
            const rows = await db.query(sql);
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error in getAllAnnouncements:', err.message);
        }
    }

    res.json({ success: true, source: 'memory', data: memoryAnnouncements });
};

exports.postAnnouncement = async (req, res) => {
    const { organization_id, created_by, title, description } = req.body;

    if (!organization_id || !created_by || !title || !description) {
        return res.status(400).json({ success: false, message: 'All announcement fields are required.' });
    }

    if (db.isLive()) {
        try {
            const sql = `
                INSERT INTO announcements (organization_id, created_by, title, description)
                VALUES (?, ?, ?, ?)
            `;
            const result = await db.query(sql, [organization_id, created_by, title, description]);
            return res.status(201).json({ success: true, message: 'Announcement posted.', announcement_id: result.insertId });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    const newId = memoryAnnouncements.length > 0 ? Math.max(...memoryAnnouncements.map(a => a.announcement_id)) + 1 : 1;
    memoryAnnouncements.unshift({
        announcement_id: newId,
        organization_id: Number(organization_id),
        created_by: Number(created_by),
        title,
        description,
        posted_at: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ success: true, message: 'Announcement posted (memory).' });
};

async function canUserDeleteAnnouncement(requesterId, announcement) {
    if (!requesterId || !announcement) return false;
    const uid = Number(requesterId);

    // Author can ALWAYS delete their own announcement
    if (announcement.created_by === uid) return true;

    if (db.isLive()) {
        try {
            const [u] = await db.query('SELECT u.user_id, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [uid]);
            if (u && (u.role_name === 'Administrator' || u.role_name === 'Faculty')) return true;

            const [cp] = await db.query(`
                SELECT COUNT(*) as cnt FROM memberships 
                WHERE user_id = ? AND organization_id = ? AND member_role IN ('Chairperson', 'Vice Chairperson')
            `, [uid, announcement.organization_id]);
            return (cp && cp.cnt > 0);
        } catch (e) {
            console.error('Error in MySQL canUserDeleteAnnouncement:', e.message);
        }
    }

    const userController = require('./userController');
    const clubController = require('./clubController');
    const u = userController.getMemoryUser ? userController.getMemoryUser(uid) : null;
    if (u && (u.role_name === 'Administrator' || u.role_name === 'Faculty')) return true;

    const memberships = clubController.getMemoryMemberships ? clubController.getMemoryMemberships() : [];
    return memberships.some(m => 
        m.user_id === uid && 
        m.organization_id === announcement.organization_id && 
        (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson')
    );
}

exports.deleteAnnouncement = async (req, res) => {
    const id = Number(req.params.id);
    const reqId = (req.body && req.body.requester_id) || req.headers['x-user-id'] || req.query.requester_id;

    if (!reqId) {
        return res.status(401).json({ success: false, message: 'Authentication required: requester_id missing.' });
    }

    let announcement = null;
    if (db.isLive()) {
        try {
            const [row] = await db.query('SELECT * FROM announcements WHERE announcement_id = ?', [id]);
            announcement = row;
        } catch (e) {}
    } else {
        announcement = memoryAnnouncements.find(a => a.announcement_id === id);
    }

    if (!announcement) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const authorized = await canUserDeleteAnnouncement(reqId, announcement);
    if (!authorized) {
        return res.status(403).json({
            success: false,
            message: 'Access Denied (403): You cannot delete an announcement that was not created by you or does not belong to your committee.'
        });
    }

    if (db.isLive()) {
        try {
            const callSql = 'CALL sp_delete_announcement(?, ?, @statusCode, @statusMsg)';
            await db.query(callSql, [Number(reqId), id]);
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

    const idx = memoryAnnouncements.findIndex(a => a.announcement_id === id);
    if (idx !== -1) memoryAnnouncements.splice(idx, 1);
    res.json({ success: true, message: 'Announcement deleted successfully (memory).' });
};
