const pool = require('../config/db');
const Trie = require('../algorithms/Trie');
const { QuadTree } = require('../algorithms/QuadTree');
const PriorityQueue = require('../algorithms/PriorityQueue');
const AVLTree = require('../algorithms/AVLTree');
const HashMap = require('../algorithms/HashMap');

const severityValues = { low: 1, medium: 2, high: 3, critical: 4 };

// Check for duplicate issues before submission
const checkDuplicate = async (req, res) => {
  const { title, latitude, longitude } = req.body;
  try {
    const issuesResult = await pool.query('SELECT issue_id, title, latitude, longitude FROM Issues');
    const issues = issuesResult.rows;

    // Trie: text similarity check
    const trie = new Trie();
    trie.insert(title, null); // placeholder
    const titleList = issues.map(i => ({ title: i.title, issueId: i.issue_id }));
    const textSimilarity = trie.checkSimilarity(title, titleList);

    // QuadTree: spatial similarity check (within 100m)
    const qt = QuadTree.build(issues);
    const nearbyIssues = qt.queryRadius(parseFloat(latitude), parseFloat(longitude), 0.1);

    if (textSimilarity.similar || nearbyIssues.length > 0) {
      const dupeId = textSimilarity.issueId || (nearbyIssues[0]?.data?.issue_id);
      return res.json({
        isDuplicate: true,
        message: 'A similar issue already exists nearby.',
        existingIssueId: dupeId,
        textScore: textSimilarity.matchScore,
        nearbyCount: nearbyIssues.length
      });
    }

    res.json({ isDuplicate: false });
  } catch (err) {
    console.error('Duplicate check error:', err);
    res.status(500).json({ error: 'Could not check for duplicates' });
  }
};

// Create a new issue
const createIssue = async (req, res) => {
  const { title, description, category, severity, latitude, longitude } = req.body;
  const image = req.file ? req.file.filename : null;
  const created_by = req.user.user_id;

  if (!title || !category || !severity || !latitude || !longitude) {
    return res.status(400).json({ error: 'Title, category, severity, and location are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Issues (title, description, category, severity, status, image, latitude, longitude, votes, created_by)
       VALUES ($1,$2,$3,$4,'reported',$5,$6,$7,0,$8) RETURNING *`,
      [title, description, category, severity, image, latitude, longitude, created_by]
    );
    // Log initial history entry
    await pool.query(
      'INSERT INTO IssueHistory (issue_id, status, updated_by) VALUES ($1, $2, $3)',
      [result.rows[0].issue_id, 'reported', created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ error: 'Server error creating issue' });
  }
};

// Get all issues — sorted by priority using PriorityQueue; grouped by status
const getAllIssues = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, u.name as reporter_name
      FROM Issues i LEFT JOIN Users u ON i.created_by = u.user_id
      ORDER BY i.created_at DESC
    `);
    const issues = result.rows;

    // Use PriorityQueue to sort by priority = severity + votes
    const pq = new PriorityQueue();
    const sorted = pq.getSortedIssues([...issues]);

    // Build category stats with HashMap
    const categoryStats = HashMap.buildCategoryStats(issues);
    const statusStats = HashMap.buildStatusStats(issues);

    res.json({ issues: sorted, categoryStats, statusStats, total: issues.length });
  } catch (err) {
    console.error('Get all issues error:', err);
    res.status(500).json({ error: 'Server error fetching issues' });
  }
};

// Get a single issue by ID
const getIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as reporter_name
       FROM Issues i LEFT JOIN Users u ON i.created_by = u.user_id
       WHERE i.issue_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
    const history = await pool.query(
      `SELECT h.*, u.name as updated_by_name
       FROM IssueHistory h LEFT JOIN Users u ON h.updated_by = u.user_id
       WHERE h.issue_id = $1 ORDER BY h.created_at ASC`,
      [id]
    );
    res.json({ ...result.rows[0], history: history.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update issue status (admin only)
const updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status, proof_description } = req.body;
  const validStatuses = ['reported', 'in-progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const proof_image = req.file ? req.file.filename : null;
  try {
    let query, params;
    if (proof_image) {
      query = 'UPDATE Issues SET status=$1, proof_image=$2, proof_description=$3 WHERE issue_id=$4 RETURNING *';
      params = [status, proof_image, proof_description || null, id];
    } else {
      query = 'UPDATE Issues SET status=$1 WHERE issue_id=$2 RETURNING *';
      params = [status, id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Issue not found' });
    await pool.query(
      'INSERT INTO IssueHistory (issue_id, status, updated_by) VALUES ($1, $2, $3)',
      [id, status, req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update issue error:', err);
    res.status(500).json({ error: 'Server error updating issue' });
  }
};

// Get issues by user (for user dashboard)
const getIssuesByUser = async (req, res) => {
  const userId = req.params.userId || req.user.user_id;
  try {
    const result = await pool.query(
      'SELECT * FROM Issues WHERE created_by=$1 ORDER BY created_at DESC',
      [userId]
    );
    // Use AVL Tree to sort by created_at
    const sorted = AVLTree.buildFromIssues(result.rows);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Radius search using QuadTree
const searchByRadius = async (req, res) => {
  const { lat, lng, radius } = req.query; // radius in km
  if (!lat || !lng || !radius) {
    return res.status(400).json({ error: 'lat, lng, and radius are required' });
  }
  try {
    const result = await pool.query('SELECT * FROM Issues');
    const qt = QuadTree.build(result.rows);
    const nearby = qt.queryRadius(parseFloat(lat), parseFloat(lng), parseFloat(radius));
    res.json(nearby.map(p => p.data));
  } catch (err) {
    res.status(500).json({ error: 'Server error during radius search' });
  }
};

// Get heatmap data using RTree
const getHeatmapData = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const { RTree } = require('../algorithms/RTree');
    const result = await pool.query('SELECT latitude, longitude, issue_id FROM Issues');
    
    let targetIssues = result.rows;

    // Filter issues if radius search is active
    if (lat && lng && radius) {
      const { QuadTree } = require('../algorithms/QuadTree');
      const qt = QuadTree.build(targetIssues);
      const nearby = qt.queryRadius(parseFloat(lat), parseFloat(lng), parseFloat(radius));
      targetIssues = nearby.map(p => p.data);
    }

    const tree = RTree.build(targetIssues);
    const heatmap = tree.generateHeatmap(targetIssues);
    res.json(heatmap);
  } catch (err) {
    res.status(500).json({ error: 'Server error generating heatmap' });
  }
};

// Get top issues by priority (admin dashboard)
const getTopPriorityIssues = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Issues ORDER BY created_at DESC');
    const pq = new PriorityQueue();
    const sorted = pq.getSortedIssues(result.rows);
    res.json(sorted.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  checkDuplicate, createIssue, getAllIssues, getIssueById,
  updateIssueStatus, getIssuesByUser, searchByRadius, getHeatmapData, getTopPriorityIssues
};
