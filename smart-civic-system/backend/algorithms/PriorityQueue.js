/**
 * PriorityQueue - Max-Heap Implementation
 * Usage: Rank civic issues by priority = severity + votes
 * Severity scale: low=1, medium=2, high=3, critical=4
 */
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  _severityValue(severity) {
    const map = { low: 1, medium: 2, high: 3, critical: 4 };
    return map[severity] || 0;
  }

  _priority(item) {
    let score = this._severityValue(item.severity) + (item.votes || 0);
    if (item.escalated) {
      score += 10;
    }
    return score;
  }

  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i)   { return 2 * i + 1; }
  _right(i)  { return 2 * i + 2; }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  _heapifyUp(i) {
    while (i > 0) {
      const p = this._parent(i);
      if (this._priority(this.heap[p]) < this._priority(this.heap[i])) {
        this._swap(i, p);
        i = p;
      } else break;
    }
  }

  _heapifyDown(i) {
    const n = this.heap.length;
    while (true) {
      let largest = i;
      const l = this._left(i), r = this._right(i);
      if (l < n && this._priority(this.heap[l]) > this._priority(this.heap[largest])) largest = l;
      if (r < n && this._priority(this.heap[r]) > this._priority(this.heap[largest])) largest = r;
      if (largest !== i) { this._swap(i, largest); i = largest; }
      else break;
    }
  }

  /** Insert an issue into the priority queue */
  insert(issue) {
    this.heap.push(issue);
    this._heapifyUp(this.heap.length - 1);
  }

  /** Remove and return the highest-priority issue */
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._heapifyDown(0);
    return max;
  }

  /** Peek at the highest-priority issue without removing */
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /** Build a sorted list of all issues by priority (high → low) */
  getSortedIssues(issues) {
    issues.forEach(issue => this.insert(issue));
    const sorted = [];
    while (this.heap.length > 0) sorted.push(this.extractMax());
    return sorted;
  }

  get size() { return this.heap.length; }
  isEmpty()  { return this.heap.length === 0; }
}

module.exports = PriorityQueue;
