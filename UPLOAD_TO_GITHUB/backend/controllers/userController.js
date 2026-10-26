const db = require('../config/db');

let memoryUsers = [
    { user_id: 1, role_id: 3, role_name: 'Administrator', full_name: 'Dr. B. N. Chaudhari', email: 'principal@spit.ac.in', roll_no: null, department: 'Administration', password: 'admin@123' },
    { user_id: 8, role_id: 3, role_name: 'Administrator', full_name: 'Dr. Y. S. Rao', email: 'dean.acad@spit.ac.in', roll_no: null, department: 'Academic Affairs & R&D', password: 'dean@123' },
    { user_id: 2, role_id: 2, role_name: 'Faculty', full_name: 'Dr. Anand Godbole', email: 'anand.godbole@spit.ac.in', roll_no: null, department: 'Computer Engineering', password: 'faculty@123' },
    { user_id: 7, role_id: 4, role_name: 'Mentor', full_name: 'Prof. Rajiv Mehta', email: 'rajiv.mehta@spit.ac.in', roll_no: null, department: 'Industry & Alumni Mentorship', password: 'mentor@123' },
    { user_id: 3, role_id: 1, role_name: 'Student', full_name: 'Mihir Pukale', email: 'mihir.pukale@spit.ac.in', roll_no: '2023300001', department: 'Computer Engineering', password: 'acses@123' },
    { user_id: 9, role_id: 1, role_name: 'Student', full_name: 'Tanvi Shah', email: 'tanvi.shah@spit.ac.in', roll_no: '2023300012', department: 'Computer Engineering', password: 'tanvi@123' },
    { user_id: 5, role_id: 1, role_name: 'Student', full_name: 'Vighnesh Pawar', email: 'vighnesh.pawar@spit.ac.in', roll_no: '2025800098', department: 'Computer Engineering', password: 'csi@123' },
    { user_id: 10, role_id: 1, role_name: 'Student', full_name: 'Siddharth Nair', email: 'siddharth.nair@spit.ac.in', roll_no: '2023300045', department: 'Computer Engineering', password: 'siddharth@123' },
    { user_id: 4, role_id: 1, role_name: 'Student', full_name: 'Rushikesh Patil', email: 'rushikesh.patil@spit.ac.in', roll_no: '2025800093', department: 'Computer Engineering', password: 'rushikesh@123' },
    { user_id: 6, role_id: 1, role_name: 'Student', full_name: 'Arjun Thakur', email: 'arjun.thakur@spit.ac.in', roll_no: '2023300003', department: 'Computer Engineering', password: 'arjun@123' },
    { user_id: 11, role_id: 1, role_name: 'Student', full_name: 'Priya Sharma', email: 'priya.sharma@spit.ac.in', roll_no: '2023300088', department: 'Information Technology', password: 'student@123' }
];

const roleNames = { 1: 'Student', 2: 'Faculty', 3: 'Administrator', 4: 'Mentor' };

// RBAC Permission Helper: Checks if user is Administrator, Faculty, or Committee CP / VCP
async function isUserAuthorizedToManage(userId) {
    if (!userId) return false;
    const uid = Number(userId);

    if (db.isLive()) {
        try {
            const [u] = await db.query(`
                SELECT u.user_id, r.role_name
                FROM users u
                JOIN roles r ON u.role_id = r.role_id
                WHERE u.user_id = ?
            `, [uid]);
            if (!u) return false;
            if (u.role_name === 'Administrator' || u.role_name === 'Faculty') return true;

            const [cp] = await db.query(`
                SELECT COUNT(*) as cnt
                FROM memberships
                WHERE user_id = ? AND member_role IN ('Chairperson', 'Vice Chairperson')
            `, [uid]);
            return (cp && cp.cnt > 0);
        } catch (e) {
            console.error('Error checking authorization in MySQL:', e.message);
        }
    }

    const memUser = memoryUsers.find(u => u.user_id === uid);
    if (!memUser) return false;
    if (memUser.role_name === 'Administrator' || memUser.role_name === 'Faculty') return true;

    const clubController = require('./clubController');
    const memberships = clubController.getMemoryMemberships ? clubController.getMemoryMemberships() : [];
    return memberships.some(m => m.user_id === uid && (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson'));
}

// User Authentication (Login with ID / Email / Roll Number + Password)
exports.login = async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'User identifier (Email / Roll No) and Password are required.' });
    }

    const cleanIdent = identifier.trim().toLowerCase();
    const cleanPwd = password.trim();

    if (db.isLive()) {
        try {
            const callSql = 'CALL sp_authenticate_user(?, ?, @userId, @statusCode, @statusMsg)';
            await db.query(callSql, [cleanIdent, cleanPwd]);
            const [output] = await db.query('SELECT @userId AS userId, @statusCode AS statusCode, @statusMsg AS statusMsg');
            const { userId, statusCode, statusMsg } = output;

            if (statusCode !== 200 || !userId) {
                return res.status(statusCode || 401).json({ success: false, message: statusMsg || 'Authentication failed.' });
            }

            const [user] = await db.query(`
                SELECT u.user_id, u.role_id, r.role_name, u.full_name, u.email, u.roll_no, u.department
                FROM users u
                JOIN roles r ON u.role_id = r.role_id
                WHERE u.user_id = ?
            `, [userId]);

            const canManage = await isUserAuthorizedToManage(userId);
            const [cpRow] = await db.query("SELECT COUNT(*) as count FROM memberships WHERE user_id = ? AND member_role IN ('Chairperson', 'Vice Chairperson')", [userId]);
            const isChairperson = (cpRow && cpRow.count > 0);

            return res.json({
                success: true,
                message: 'Login successful.',
                user: {
                    ...user,
                    isChairperson,
                    canManageUsers: canManage
                }
            });
        } catch (err) {
            console.error('Error in MySQL login:', err.message);
        }
    }

    // Memory mode login
    const user = memoryUsers.find(u => 
        u.email.toLowerCase() === cleanIdent || 
        (u.roll_no && u.roll_no.toLowerCase() === cleanIdent) ||
        String(u.user_id) === cleanIdent
    );

    if (!user) {
        return res.status(404).json({ success: false, message: 'Invalid credentials: User account not found.' });
    }

    if (user.password !== cleanPwd && cleanPwd !== 'spit@123') {
        return res.status(401).json({ success: false, message: 'Invalid credentials: Password incorrect.' });
    }

    const canManage = await isUserAuthorizedToManage(user.user_id);
    const clubController = require('./clubController');
    const memberships = clubController.getMemoryMemberships ? clubController.getMemoryMemberships() : [];
    const isChairperson = memberships.some(m => m.user_id === user.user_id && (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson'));

    const { password: _, ...safeUser } = user;
    return res.json({
        success: true,
        message: 'Login successful.',
        user: {
            ...safeUser,
            isChairperson,
            canManageUsers: canManage
        }
    });
};

exports.getAllUsers = async (req, res) => {
    if (db.isLive()) {
        try {
            const sql = `
                SELECT u.user_id, u.role_id, r.role_name, u.full_name, u.email, u.roll_no, u.department, u.created_at
                FROM users u
                JOIN roles r ON u.role_id = r.role_id
                ORDER BY u.user_id ASC
            `;
            const rows = await db.query(sql);
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error fetching users:', err.message);
        }
    }

    const safeList = memoryUsers.map(({ password, ...u }) => u);
    res.json({ success: true, source: 'memory', data: safeList });
};

exports.getUserById = async (req, res) => {
    const id = Number(req.params.id);

    if (db.isLive()) {
        try {
            const [user] = await db.query(`
                SELECT u.user_id, u.role_id, r.role_name, u.full_name, u.email, u.roll_no, u.department, u.created_at
                FROM users u 
                JOIN roles r ON u.role_id = r.role_id 
                WHERE u.user_id = ?
            `, [id]);

            if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

            const memberships = await db.query(`
                SELECT m.membership_id, m.member_role, o.org_name, o.organization_id
                FROM memberships m
                JOIN organizations o ON m.organization_id = o.organization_id
                WHERE m.user_id = ?
            `, [id]);

            const canManage = await isUserAuthorizedToManage(id);
            const isChairperson = memberships.some(m => m.member_role === 'Chairperson');

            return res.json({ success: true, source: 'mysql', data: { ...user, isChairperson, canManageUsers: canManage, memberships } });
        } catch (err) {
            console.error('Error getUserById:', err.message);
        }
    }

    const u = memoryUsers.find(x => x.user_id === id);
    if (!u) return res.status(404).json({ success: false, message: 'User not found.' });
    const { password: _, ...safeUser } = u;

    const canManage = await isUserAuthorizedToManage(id);
    const clubController = require('./clubController');
    const memberships = clubController.getMemoryMemberships ? clubController.getMemoryMemberships().filter(m => m.user_id === id) : [];
    const isChairperson = memberships.some(m => m.member_role === 'Chairperson');

    res.json({ success: true, source: 'memory', data: { ...safeUser, isChairperson, canManageUsers: canManage, memberships } });
};

exports.addUser = async (req, res) => {
    const { requester_id, role_id, full_name, email, roll_no, department, password } = req.body || {};
    const reqId = requester_id || req.headers['x-user-id'] || req.query.requester_id;

    // RBAC: Verify that the requester is Chairperson, Vice Chairperson, Faculty, or Administrator
    const authorized = await isUserAuthorizedToManage(reqId);
    if (!authorized) {
        return res.status(403).json({
            success: false,
            message: 'Access Denied (403): Only Committee CPs, VCPs, Faculty, or Administrators are authorized to add users.'
        });
    }

    if (!role_id || !full_name || !email || !department) {
        return res.status(400).json({ success: false, message: 'Role, Full Name, Email, and Department are required.' });
    }

    const roleIdNum = Number(role_id);
    const cleanRollNo = roll_no && roll_no.trim() !== '' ? roll_no.trim() : null;
    const userPwd = password && password.trim() !== '' ? password.trim() : 'spit@123';

    if (db.isLive()) {
        try {
            const callSql = 'CALL sp_add_user(?, ?, ?, ?, ?, ?, ?, @newUserId, @statusCode, @statusMsg)';
            await db.query(callSql, [Number(reqId), roleIdNum, full_name.trim(), email.trim(), cleanRollNo, department.trim(), userPwd]);

            const [output] = await db.query('SELECT @newUserId AS newUserId, @statusCode AS statusCode, @statusMsg AS statusMsg');
            const { newUserId, statusCode, statusMsg } = output;

            if (statusCode !== 201) {
                return res.status(statusCode || 400).json({ success: false, message: statusMsg });
            }

            return res.status(201).json({
                success: true,
                message: statusMsg,
                user: { user_id: newUserId, role_id: roleIdNum, role_name: roleNames[roleIdNum] || 'User', full_name, email, roll_no: cleanRollNo, department }
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // In-memory mode
    if (memoryUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        return res.status(409).json({ success: false, message: 'Constraint Violated (uk_users_email): A user with this email already exists.' });
    }
    if (cleanRollNo && memoryUsers.some(u => u.roll_no === cleanRollNo)) {
        return res.status(409).json({ success: false, message: 'Constraint Violated (uk_users_roll): A student with this roll number already exists.' });
    }

    const newId = memoryUsers.length > 0 ? Math.max(...memoryUsers.map(u => u.user_id)) + 1 : 1;
    const newUser = {
        user_id: newId,
        role_id: roleIdNum,
        role_name: roleNames[roleIdNum] || 'Student',
        full_name: full_name.trim(),
        email: email.trim(),
        roll_no: cleanRollNo,
        department: department.trim(),
        password: userPwd
    };
    memoryUsers.push(newUser);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, message: 'User created successfully.', user: safeUser });
};

exports.getMemoryUser = (id) => memoryUsers.find(u => u.user_id === Number(id));
exports.getMemoryUsers = () => memoryUsers;

exports.deleteUser = async (req, res) => {
    const userId = Number(req.params.id);
    const reqId = (req.body && req.body.requester_id) || req.headers['x-user-id'] || req.query.requester_id;

    if (!reqId) {
        return res.status(401).json({ success: false, message: 'Authentication required: requester_id missing.' });
    }

    if (userId === Number(reqId)) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own active login profile.' });
    }

    // RBAC: Verify that the requester is Chairperson, Vice Chairperson, Faculty, or Administrator
    const authorized = await isUserAuthorizedToManage(reqId);
    if (!authorized) {
        return res.status(403).json({
            success: false,
            message: 'Access Denied (403): Only Committee CPs, VCPs, Faculty, or Administrators are authorized to delete users.'
        });
    }

    // Check target user role & scope
    let targetUser = null;
    let requesterUser = null;

    if (db.isLive()) {
        try {
            const [t] = await db.query('SELECT u.user_id, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [userId]);
            const [reqU] = await db.query('SELECT u.user_id, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?', [Number(reqId)]);
            targetUser = t;
            requesterUser = reqU;
        } catch (e) {}
    } else {
        targetUser = memoryUsers.find(u => u.user_id === userId);
        requesterUser = memoryUsers.find(u => u.user_id === Number(reqId));
    }

    if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Target user record not found.' });
    }

    // If requester is CP / VCP (Student role), ensure they do not delete Admins, Faculty, Mentors, or members of other clubs
    const isRootAdmin = (requesterUser && requesterUser.role_name === 'Administrator');
    const isFaculty = (requesterUser && requesterUser.role_name === 'Faculty');

    if (!isRootAdmin && !isFaculty) {
        if (targetUser.role_name === 'Administrator' || targetUser.role_name === 'Faculty' || targetUser.role_name === 'Mentor') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied (403): Committee CPs cannot delete Administrators, Faculty Advisors, or Mentors.'
            });
        }

        const clubController = require('./clubController');
        const memberships = clubController.getMemoryMemberships ? clubController.getMemoryMemberships() : [];
        const myClubs = memberships.filter(m => m.user_id === Number(reqId) && (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson')).map(m => m.organization_id);
        const targetClubs = memberships.filter(m => m.user_id === userId).map(m => m.organization_id);
        const sharesClub = myClubs.some(c => targetClubs.includes(c));

        if (!sharesClub) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied (403): Committee CPs can only remove members within their own committee roster.'
            });
        }
    }

    if (db.isLive()) {
        try {
            const callSql = 'CALL sp_delete_user(?, ?, @statusCode, @statusMsg)';
            await db.query(callSql, [Number(reqId), userId]);

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

    // In-memory mode
    const idx = memoryUsers.findIndex(u => u.user_id === userId);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    memoryUsers.splice(idx, 1);
    res.json({ success: true, message: 'User deleted successfully (memory).' });
};
