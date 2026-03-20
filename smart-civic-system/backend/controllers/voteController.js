const pool = require('../config/db');
const HashMap = require('../algorithms/HashMap');

// In-memory vote cache (per server session) to prevent immediate re-voting
const voteCache = new HashMap();

const voteOnIssue = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  // HashMap: check in-memory cache first
  const cacheKey = `${id}_${userId}`;
  if (voteCache.has(cacheKey)) {
    return res.status(409).json({ error: 'You have already voted on this issue (cached)' });
  }

  try {
    // DB-level duplicate prevention (UNIQUE constraint on Votes table)
    const existing = await pool.query(
      'SELECT vote_id FROM Votes WHERE issue_id=$1 AND user_id=$2',
      [id, userId]
    );
    if (existing.rows.length > 0) {
      voteCache.set(cacheKey, true); // warm the cache
      return res.status(409).json({ error: 'You have already voted on this issue' });
    }

    await pool.query('INSERT INTO Votes (issue_id, user_id) VALUES ($1, $2)', [id, userId]);
    const updated = await pool.query(
      'UPDATE Issues SET votes = votes + 1 WHERE issue_id=$1 RETURNING votes, issue_id',
      [id]
    );

    // Update HashMap cache
    voteCache.set(cacheKey, true);

    res.json({
      message: 'Vote registered successfully',
      votes: updated.rows[0].votes,
      issue_id: updated.rows[0].issue_id
    });
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ error: 'You have already voted on this issue' });
    }
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Server error during voting' });
  }
};

const getVoteCount = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT votes FROM Issues WHERE issue_id=$1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
    res.json({ issue_id: parseInt(id), votes: result.rows[0].votes });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const hasUserVoted = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  try {
    const result = await pool.query(
      'SELECT vote_id FROM Votes WHERE issue_id=$1 AND user_id=$2',
      [id, userId]
    );
    res.json({ hasVoted: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { voteOnIssue, getVoteCount, hasUserVoted };
