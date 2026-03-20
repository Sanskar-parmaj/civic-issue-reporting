/**
 * Stack - LIFO Stack
 * Usage: User activity timeline — each action (report, vote, comment) is pushed.
 * Display shows most recent actions first (pop order).
 */
class Stack {
  constructor(maxSize = 50) {
    this.items = [];
    this.maxSize = maxSize; // cap timeline to last N actions
  }

  /** Push an activity event onto the stack */
  push(item) {
    if (this.items.length >= this.maxSize) {
      this.items.shift(); // Remove oldest if at capacity (sliding window)
    }
    this.items.push(item);
    return this;
  }

  /** Remove and return the most recent activity */
  pop() {
    return this.items.pop() || null;
  }

  /** Peek at the most recent activity without removing */
  peek() {
    return this.items.length > 0 ? this.items[this.items.length - 1] : null;
  }

  /** Return all items newest-first (for timeline display) */
  getTimeline() {
    return [...this.items].reverse();
  }

  get size() { return this.items.length; }
  isEmpty() { return this.items.length === 0; }
  clear() { this.items = []; }

  /**
   * Build a user activity timeline from mixed event arrays.
   * Each event should have { type, description, created_at, ... }
   */
  static buildTimeline(events) {
    const stack = new Stack(50);
    // Sort events chronologically before pushing so stack order is correct
    const sorted = [...events].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    for (const event of sorted) stack.push(event);
    return stack.getTimeline(); // Returns newest first
  }
}

module.exports = Stack;
