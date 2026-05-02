const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const voteRoutes = require('./routes/voteRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Seed default admin and run migrations
const pool = require('./config/db');
const bcrypt = require('bcryptjs');
(async () => {
  try {
    const res = await pool.query("SELECT * FROM Users WHERE role = 'admin'");
    if (res.rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 12);
      await pool.query(
        "INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ['System Admin', 'admin@civicsmart.com', hashed, 'admin']
      );
      console.log('✅ Default Admin seeded. Email: admin@civicsmart.com / Password: admin123');
    }

    // Auto-migrate tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT,
        message TEXT,
        issue_id INT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE Issues ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;
    `);

    await pool.query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS issue_id INT;
    `);

  } catch (err) {
    console.error('Error during init:', err);
  }
})();

// Start Escalation Job
const escalationService = require('./services/escalationService');
escalationService.startDailyJob();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// /api/auth — authentication
app.use('/api/auth', authRoutes);
// /api/issues — all issue CRUD, voting, comments/notifications share issue prefix
app.use('/api/issues', issueRoutes);
app.use('/api/issues', voteRoutes);
app.use('/api/issues', commentRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// 404 Handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
