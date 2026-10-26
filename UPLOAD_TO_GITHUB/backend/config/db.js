const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_event_management',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};

let pool = null;
let isConnected = false;

async function initDB() {
    try {
        pool = mysql.createPool(dbConfig);
        // Test connection
        const connection = await pool.getConnection();
        console.log(`✅ [MySQL 8.0] Connected successfully to database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
        connection.release();
        isConnected = true;
    } catch (err) {
        console.warn(`⚠️ [MySQL] Could not connect to live MySQL Server (${err.message}).`);
        console.warn(`💡 Tip: Update backend/.env with your MySQL root password. Running in Memory/Mock fallback mode.`);
        isConnected = false;
    }
}

// Resilient query wrapper
async function query(sql, params = []) {
    if (isConnected && pool) {
        try {
            const [rows] = await pool.query(sql, params);
            return rows;
        } catch (err) {
            console.error('MySQL Query Error:', err.message);
            throw err;
        }
    } else {
        // Live MySQL not connected
        throw new Error('MySQL connection offline. Please check backend/.env');
    }
}

module.exports = {
    initDB,
    query,
    getPool: () => pool,
    isLive: () => isConnected,
    dbConfig
};
