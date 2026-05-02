const pool = require('../config/db');
const HashMap = require('../algorithms/HashMap');
const Queue = require('../algorithms/Queue');

const startDailyJob = () => {
  // Run every 1 day: 24 * 60 * 60 * 1000
  const intervalTime = 24 * 60 * 60 * 1000;
  
  setInterval(async () => {
    try {
      console.log('Running Smart Escalation Job...');
      // Low -> 5 weeks, Medium -> 3 weeks, High -> 2 weeks, Critical -> 1 week
      const severityDaysMap = new HashMap();
      severityDaysMap.set('low', 35);
      severityDaysMap.set('medium', 21);
      severityDaysMap.set('high', 14);
      severityDaysMap.set('critical', 7);

      // Fetch unresolved, non-escalated issues
      const result = await pool.query("SELECT * FROM Issues WHERE status != 'resolved' AND escalated = false");
      const issues = result.rows;

      const now = new Date();
      let escalatedCount = 0;

      for (const issue of issues) {
        const deadlineDays = severityDaysMap.get(issue.severity);
        if (!deadlineDays) continue;

        const createdDate = new Date(issue.created_at);
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > deadlineDays) {
          // Escalate
          await pool.query("UPDATE Issues SET escalated = true WHERE issue_id = $1", [issue.issue_id]);
          
          // Notify Admin
          const adminQuery = await pool.query("SELECT user_id FROM Users WHERE role = 'admin'");
          const queue = new Queue();
          
          for (const admin of adminQuery.rows) {
            queue.enqueue({
              user_id: admin.user_id,
              message: `Issue Escalated: "${issue.title}" has exceeded its resolution deadline (${deadlineDays} days).`,
            });
          }

          while (!queue.isEmpty()) {
            const notif = queue.dequeue();
            await pool.query(
              "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
              [notif.user_id, notif.message]
            );
          }
          escalatedCount++;
        }
      }
      if (escalatedCount > 0) {
        console.log(`Escalation Job Complete: Escalated ${escalatedCount} issues.`);
      }
    } catch (err) {
      console.error('Error in escalation job:', err);
    }
  }, intervalTime);
};

module.exports = { startDailyJob };
