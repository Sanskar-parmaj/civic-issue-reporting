/**
 * HashMap - Chained Hash Map
 * Usage:
 *  1. Vote deduplication: issue_id → Set of voter user_ids
 *  2. Category counts for admin statistics
 *  3. Caching issue vote counts
 */
class HashMap {
  constructor(size = 1024) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
    this.count = 0;
  }

  _hash(key) {
    const str = String(key);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit int
    }
    return Math.abs(hash) % this.size;
  }

  set(key, value) {
    const idx = this._hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.find(([k]) => k === key);
    if (existing) { existing[1] = value; }
    else { bucket.push([key, value]); this.count++; }
  }

  get(key) {
    const idx = this._hash(key);
    const entry = this.buckets[idx].find(([k]) => k === key);
    return entry ? entry[1] : undefined;
  }

  has(key) { return this.get(key) !== undefined; }

  delete(key) {
    const idx = this._hash(key);
    const bucket = this.buckets[idx];
    const i = bucket.findIndex(([k]) => k === key);
    if (i !== -1) { bucket.splice(i, 1); this.count--; return true; }
    return false;
  }

  keys() { return this.buckets.flat().map(([k]) => k); }
  values() { return this.buckets.flat().map(([, v]) => v); }
  entries() { return this.buckets.flat(); }

  /** Increment a numeric value (for counting) */
  increment(key, by = 1) {
    this.set(key, (this.get(key) || 0) + by);
  }

  /** Add to a Set stored at key (for voter sets) */
  addToSet(key, item) {
    if (!this.has(key)) this.set(key, new Set());
    this.get(key).add(item);
  }

  hasInSet(key, item) {
    return this.has(key) && this.get(key).has(item);
  }

  /** Build a category → count map from issues array */
  static buildCategoryStats(issues) {
    const map = new HashMap();
    for (const issue of issues) map.increment(issue.category);
    return Object.fromEntries(map.entries());
  }

  /** Build a status → count map */
  static buildStatusStats(issues) {
    const map = new HashMap();
    for (const issue of issues) map.increment(issue.status);
    return Object.fromEntries(map.entries());
  }
}

module.exports = HashMap;
