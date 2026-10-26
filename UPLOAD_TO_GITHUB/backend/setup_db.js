/**
 * Setup Script to execute college_clubs_event_management.sql onto MySQL Server
 * Run with: node setup_db.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runSetup() {
    console.log('🔄 Initializing SPIT DBMS Database Setup...');

    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: Number(process.env.DB_PORT) || 3306,
        multipleStatements: true
    };

    let connection;
    try {
        console.log(`📡 Connecting to MySQL server at ${connectionConfig.host}:${connectionConfig.port} as '${connectionConfig.user}'...`);
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Connected to MySQL server.');

        const sqlFilePath = path.join(__dirname, '..', 'college_clubs_event_management.sql');
        if (!fs.existsSync(sqlFilePath)) {
            throw new Error(`SQL file not found at: ${sqlFilePath}`);
        }

        console.log(`📖 Reading SQL script from: ${sqlFilePath}`);
        let sql = fs.readFileSync(sqlFilePath, 'utf8');

        // Note: multipleStatements allows executing multi-statement scripts
        console.log('⚡ Executing database initialization, 3NF tables, views, triggers, and sample data...');
        await connection.query(sql);

        console.log('🎉 Database setup completed successfully!');
        console.log('🗄️ Database: college_event_management is now live and populated with 9 tables.');
    } catch (err) {
        console.error('❌ Database setup failed:', err.message);
        console.log('\n💡 If you received an "Access denied" error, please check:');
        console.log('   1. Open backend/.env');
        console.log('   2. Set DB_PASSWORD to your MySQL root password');
        console.log('   3. Run "node setup_db.js" again.');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runSetup();
