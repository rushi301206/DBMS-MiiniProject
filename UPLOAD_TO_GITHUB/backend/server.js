const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA navigation
app.use((req, res) => {
    // If request starts with /api, return 404 JSON
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
async function startServer() {
    await db.initDB();

    app.listen(PORT, () => {
        console.log('================================================================');
        console.log('🏛️  SPIT College Events Management Backend');
        console.log(`🚀 Server running on: http://localhost:${PORT}`);
        console.log(`🌐 Full Application UI: http://localhost:${PORT}`);
        console.log(`📡 REST API Endpoints: http://localhost:${PORT}/api/events`);
        console.log(`🗄️  Database Status: ${db.isLive() ? 'Live MySQL 8.0' : 'In-Memory Abstract Mode'}`);
        console.log('================================================================');
    });
}

startServer();
