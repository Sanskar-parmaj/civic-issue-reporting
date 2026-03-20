const pool = require('../config/db');
const LinkedList = require('../algorithms/LinkedList');
const Queue = require('../algorithms/Queue');

// Notification store (in-memory, keyed by user_id)
const notificationQueues = {};

const getOrCreateQueue = (userId) => {
  if (!notificationQueues[userId]) notificationQueues[userId] = new Queue();
  return notificationQueues[userId];
};

const addComment = async (req, res) => {
  const { id } = req.params; // issue_id
  const { comment } = req.body;
  const userId = req.user.user_id;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Comments (issue_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING comment_id, issue_id, user_id, comment, created_at`,
      [id, userId, comment.trim()]
    );
    const newComment = result.rows[0];

    // Notify issue reporter via Queue
    const issueResult = await pool.query('SELECT created_by, title FROM Issues WHERE issue_id=$1', [id]);
    if (issueResult.rows.length > 0) {
      const { created_by, title } = issueResult.rows[0];
      if (created_by && created_by !== userId) {
        const q = getOrCreateQueue(created_by);
        q.enqueue({
          type: 'comment',
          issueId: id,
          issueTitle: title,
          message: `New comment on your issue "${title}"`,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    }

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Server error adding comment' });
  }
};

const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.comment_id, c.issue_id, c.comment, c.created_at,
              u.name as author_name, u.role as author_role
       FROM Comments c JOIN Users u ON c.user_id = u.user_id
       WHERE c.issue_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );
    // Build LinkedList then return as array (chronological order)
    const list = LinkedList.fromArray(result.rows);
    res.json(list.toArray());
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Server error fetching comments' });
  }
};

// Get user's notifications (from Queue)
const getNotifications = (req, res) => {
  const userId = req.user.user_id;
  const q = getOrCreateQueue(userId);
  res.json(q.peekAll());
};

// Mark all notifications as read (dequeue)
const markNotificationsRead = (req, res) => {
  const userId = req.user.user_id;
  const q = getOrCreateQueue(userId);
  const consumed = q.dequeueAll();
  res.json({ cleared: consumed.length });
};

module.exports = { addComment, getComments, getNotifications, markNotificationsRead };
