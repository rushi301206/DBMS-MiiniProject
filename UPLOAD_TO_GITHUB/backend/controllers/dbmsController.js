const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const TABLES = ['roles', 'users', 'organizations', 'venues', 'memberships', 'events', 'registrations', 'feedback', 'announcements'];

exports.getStatus = (req, res) => {
    res.json({
        success: true,
        database: db.dbConfig.database,
        host: db.dbConfig.host,
        port: db.dbConfig.port,
        isLive: db.isLive(),
        mode: db.isLive() ? 'Live MySQL 8.0' : 'In-Memory Abstract Seed Mode'
    });
};

exports.getTableCounts = async (req, res) => {
    if (db.isLive()) {
        try {
            const sql = TABLES.map(t => `SELECT '${t}' AS table_name, COUNT(*) AS total_rows FROM ${t}`).join(' UNION ALL ');
            const rows = await db.query(sql);
            return res.json({ success: true, source: 'mysql', data: rows });
        } catch (err) {
            console.error('Error fetching table counts:', err.message);
        }
    }

    // Default abstract counts
    const fallback = [
        { table_name: 'roles', total_rows: 3 },
        { table_name: 'users', total_rows: 6 },
        { table_name: 'organizations', total_rows: 6 },
        { table_name: 'venues', total_rows: 5 },
        { table_name: 'memberships', total_rows: 6 },
        { table_name: 'events', total_rows: 6 },
        { table_name: 'registrations', total_rows: 6 },
        { table_name: 'feedback', total_rows: 5 },
        { table_name: 'announcements', total_rows: 6 }
    ];
    res.json({ success: true, source: 'memory', data: fallback });
};

exports.getTableData = async (req, res) => {
    const tableName = req.params.name;
    if (!TABLES.includes(tableName)) {
        return res.status(400).json({ success: false, message: 'Invalid table name.' });
    }

    if (db.isLive()) {
        try {
            const rows = await db.query(`SELECT * FROM ${tableName} LIMIT 100`);
            return res.json({ success: true, source: 'mysql', table: tableName, data: rows });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    res.json({ success: true, source: 'memory', table: tableName, message: 'Live MySQL is not connected. Configure backend/.env to query live table data.' });
};

exports.executeCustomQuery = async (req, res) => {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ success: false, message: 'SQL query string required.' });
    }

    const trimmed = sql.trim().toLowerCase();
    // Allow SELECT queries for safety
    if (!trimmed.startsWith('select') && !trimmed.startsWith('show') && !trimmed.startsWith('desc')) {
        return res.status(403).json({ success: false, message: 'Only SELECT, SHOW, and DESC queries are permitted through the viva query console.' });
    }

    if (!db.isLive()) {
        return res.status(503).json({ success: false, message: 'Live MySQL connection is required to run ad-hoc SQL queries.' });
    }

    try {
        const rows = await db.query(sql);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.resetDatabase = async (req, res) => {
    if (!db.isLive()) {
        return res.json({ success: true, message: 'In-memory state reset.' });
    }

    try {
        const sqlFilePath = path.join(__dirname, '..', '..', 'college_clubs_event_management.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        await db.query(sql);
        res.json({ success: true, message: 'MySQL database successfully re-initialized with 3NF schema and abstract seed data.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
