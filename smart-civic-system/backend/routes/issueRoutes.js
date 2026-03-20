const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
  checkDuplicate, createIssue, getAllIssues, getIssueById,
  updateIssueStatus, getIssuesByUser, searchByRadius, getHeatmapData, getTopPriorityIssues
} = require('../controllers/issueController');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// Public routes
router.get('/', getAllIssues);
router.get('/radius', searchByRadius);
router.get('/heatmap', getHeatmapData);
router.get('/top-priority', getTopPriorityIssues);
router.get('/:id', getIssueById);

// Citizen routes (auth required)
router.post('/check-duplicate', authMiddleware, checkDuplicate);
router.post('/', authMiddleware, upload.single('image'), createIssue);
router.get('/user/:userId', authMiddleware, getIssuesByUser);

// Admin routes
router.patch('/:id/status', authMiddleware, adminMiddleware, upload.single('proof_image'), updateIssueStatus);

module.exports = router;
