/**
 * Queue - FIFO Queue
 * Usage: Notification processing — notifications are enqueued on issue events
 * and dequeued for delivery to users (resolved, updated, nearby issue reported).
 */
class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  /** Enqueue a notification */
  enqueue(item) {
    this.items[this.tail] = item;
    this.tail++;
    return this;
  }

  /** Dequeue and return the next notification (FIFO) */
  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  /** Peek at the next notification without removing it */
  peek() {
    return this.isEmpty() ? null : this.items[this.head];
  }

  /** Dequeue all notifications for a specific user */
  dequeueAll() {
    const result = [];
    while (!this.isEmpty()) result.push(this.dequeue());
    return result;
  }

  /** Return all pending items without consuming them */
  peekAll() {
    return Object.values(this.items);
  }

  get size() { return this.tail - this.head; }
  isEmpty() { return this.head === this.tail; }
  clear() { this.items = {}; this.head = 0; this.tail = 0; }

  /**
   * Build notifications for an issue update event.
   * Creates a per-user queue entry for each affected user.
   */
  static buildNotifications(type, issue, affectedUserIds) {
    const queue = new Queue();
    for (const userId of affectedUserIds) {
      queue.enqueue({
        type,                     // 'resolved' | 'updated' | 'nearby'
        userId,
        issueId: issue.issue_id,
        issueTitle: issue.title,
        message: Queue._message(type, issue.title),
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    return queue;
  }

  static _message(type, title) {
    if (type === 'resolved') return `Resolved: ${title}`;
    if (type === 'updated') return `Updated: ${title}`;
    if (type === 'new') return `New Issue: ${title}`;
    return title;
  }
}

module.exports = Queue;
