const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.get('/:user_id', authMiddleware, getNotifications);
router.put('/read/:id', authMiddleware, markAsRead);

module.exports = router;
