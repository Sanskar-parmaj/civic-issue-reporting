const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { addComment, getComments, getNotifications, markNotificationsRead } = require('../controllers/commentController');

// GET/DELETE /api/issues/notifications — must be before /:id routes to avoid conflict
router.get('/notifications', authMiddleware, getNotifications);
router.delete('/notifications', authMiddleware, markNotificationsRead);

// POST /api/issues/:id/comments
router.post('/:id/comments', authMiddleware, addComment);
// GET /api/issues/:id/comments
router.get('/:id/comments', getComments);

module.exports = router;
