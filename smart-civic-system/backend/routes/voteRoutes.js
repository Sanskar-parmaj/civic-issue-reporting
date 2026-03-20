const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { voteOnIssue, getVoteCount, hasUserVoted } = require('../controllers/voteController');

router.post('/:id/vote', authMiddleware, voteOnIssue);
router.get('/:id/votes', getVoteCount);
router.get('/:id/has-voted', authMiddleware, hasUserVoted);

module.exports = router;
