const db = require('../config/db');

let memoryOrgs = [
    { organization_id: 1, org_name: 'ACSES', description: 'Association of Computer Science & Engineering Students', faculty_advisor_id: 2 },
    { organization_id: 2, org_name: 'CSI', description: 'Computer Society of India - SPIT Student Chapter', faculty_advisor_id: 2 },
    { organization_id: 3, org_name: 'IEEE', description: 'IEEE SPIT Student Branch - Technical and research society', faculty_advisor_id: 2 },
    { organization_id: 4, org_name: 'E-Cell', description: 'Entrepreneurship Cell SPIT - Startup incubation hub', faculty_advisor_id: 2 },
    { organization_id: 5, org_name: 'Mudra (cultural)', description: 'Mudra - Cultural Committee overseeing performing arts', faculty_advisor_id: 2 },
    { organization_id: 6, org_name: 'Sports committee', description: 'SPIT Sports Committee - Organizing sports tournaments', faculty_advisor_id: 2 }
];

let memoryMemberships = [
    { membership_id: 1, organization_id: 1, user_id: 3, member_role: 'Chairperson' },
    { membership_id: 2, organization_id: 1, user_id: 9, member_role: 'Vice Chairperson' },
    { membership_id: 3, organization_id: 1, user_id: 4, member_role: 'Creatives Head' },
    { membership_id: 4, organization_id: 1, user_id: 6, member_role: 'Secretary' },
    { membership_id: 5, organization_id: 2, user_id: 5, member_role: 'Chairperson' },
    { membership_id: 6, organization_id: 2, user_id: 10, member_role: 'Vice Chairperson' },
    { membership_id: 7, organization_id: 4, user_id: 4, member_role: 'Finance Secretary' },
    { membership_id: 8, organization_id: 2, user_id: 11, member_role: 'Subcommittee Member' }
];

let memoryVenues = [
    { venue_id: 1, venue_name: 'SPIT Auditorium', capacity: 350 },
    { venue_id: 2, venue_name: 'Seminar Hall 008', capacity: 150 },
    { venue_id: 3, venue_name: 'Central Computing Facility (CCF)', capacity: 120 },
    { venue_id: 4, venue_name: 'Computer Lab 202', capacity: 60 },
    { venue_id: 5, venue_name: 'College Quadrangle', capacity: 500 }
];

exports.getAllClubs = async (req, res) => {
    if (db.isLive()) {
        try {
            const sql = `
                SELECT 
                    o.organization_id,
                    o.org_name,
                    o.description,
                    fa.full_name AS faculty_advisor,
                    fa.email AS advisor_email,
                    COUNT(DISTINCT m.membership_id) AS total_members,
                    COUNT(DISTINCT e.event_id) AS total_events
                FROM organizations o
                LEFT JOIN users fa ON o.faculty_advisor_id = fa.user_id
                LEFT JOIN memberships m ON o.organization_id = m.organization_id
                LEFT JOIN events e ON o.organization_id = e.organization_id
                GROUP BY o.organization_id
                ORDER BY o.organization_id ASC
            `;
            const rows = await db.query(sql);
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error in getAllClubs:', err.message);
        }
    }

    res.json({ success: true, source: 'memory', data: memoryOrgs });
};

exports.getClubLeadershipDirectory = async (req, res) => {
    if (db.isLive()) {
        try {
            const rows = await db.query('SELECT * FROM vw_club_leadership_directory');
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error fetching vw_club_leadership_directory:', err.message);
        }
    }

    res.json({ success: true, source: 'memory', message: 'Use Live MySQL for complete view joins.' });
};

exports.addMembership = async (req, res) => {
    const { organization_id, user_id, member_role } = req.body;
    if (!organization_id || !user_id || !member_role) {
        return res.status(400).json({ success: false, message: 'Organization, user, and role are required.' });
    }

    if (db.isLive()) {
        try {
            const callSql = 'CALL sp_add_club_membership(?, ?, ?, @statusCode, @statusMsg)';
            await db.query(callSql, [Number(organization_id), Number(user_id), member_role.trim()]);
            const [output] = await db.query('SELECT @statusCode AS statusCode, @statusMsg AS statusMsg');
            const { statusCode, statusMsg } = output;
            if (statusCode !== 201 && statusCode !== 200) {
                return res.status(statusCode || 400).json({ success: false, message: statusMsg });
            }
            return res.status(201).json({ success: true, message: statusMsg });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // In-memory mode
    const orgId = Number(organization_id);
    const uId = Number(user_id);
    const exists = memoryMemberships.some(m => m.organization_id === orgId && m.user_id === uId);
    if (exists) {
        return res.status(409).json({ success: false, message: 'User already holds a leadership portfolio in this club.' });
    }

    const newId = memoryMemberships.length > 0 ? Math.max(...memoryMemberships.map(m => m.membership_id)) + 1 : 1;
    const newMembership = {
        membership_id: newId,
        organization_id: orgId,
        user_id: uId,
        member_role: member_role.trim()
    };
    memoryMemberships.push(newMembership);

    res.status(201).json({ success: true, message: 'Committee membership assigned successfully.', membership: newMembership });
};

exports.removeMembership = async (req, res) => {
    const id = Number(req.params.id);

    if (db.isLive()) {
        try {
            const callSql = 'CALL sp_remove_club_membership(?, @statusCode, @statusMsg)';
            await db.query(callSql, [id]);
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

    const idx = memoryMemberships.findIndex(m => m.membership_id === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Membership not found.' });
    }
    memoryMemberships.splice(idx, 1);
    res.json({ success: true, message: 'Committee membership revoked successfully.' });
};

exports.getAllVenues = async (req, res) => {
    if (db.isLive()) {
        try {
            const rows = await db.query('SELECT * FROM venues ORDER BY capacity DESC');
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error fetching venues:', err.message);
        }
    }

    res.json({ success: true, source: 'memory', data: memoryVenues });
};

exports.getMemoryMemberships = () => memoryMemberships;
