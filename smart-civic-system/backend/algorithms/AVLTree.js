/**
 * AVL Tree - Self-Balancing Binary Search Tree
 * Usage: Sorted issue listing by created_at timestamp or priority score.
 * Enables O(log n) insertions and in-order traversal for sorted display.
 */
class AVLNode {
  constructor(key, data) {
    this.key = key;   // numeric sort key (timestamp or priority)
    this.data = data; // issue object
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  _height(node) { return node ? node.height : 0; }
  _balance(node) { return node ? this._height(node.left) - this._height(node.right) : 0; }
  _updateHeight(node) {
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
  }

  _rotateRight(y) {
    const x = y.left, T2 = x.right;
    x.right = y; y.left = T2;
    this._updateHeight(y); this._updateHeight(x);
    return x;
  }

  _rotateLeft(x) {
    const y = x.right, T2 = y.left;
    y.left = x; x.right = T2;
    this._updateHeight(x); this._updateHeight(y);
    return y;
  }

  _rebalance(node) {
    this._updateHeight(node);
    const bf = this._balance(node);
    if (bf > 1) {
      if (this._balance(node.left) < 0) node.left = this._rotateLeft(node.left);
      return this._rotateRight(node);
    }
    if (bf < -1) {
      if (this._balance(node.right) > 0) node.right = this._rotateRight(node.right);
      return this._rotateLeft(node);
    }
    return node;
  }

  _insert(node, key, data) {
    if (!node) return new AVLNode(key, data);
    if (key <= node.key) node.left = this._insert(node.left, key, data);
    else node.right = this._insert(node.right, key, data);
    return this._rebalance(node);
  }

  /** Insert an issue with a sortable key (e.g., Date.now() or priority score) */
  insert(key, data) {
    this.root = this._insert(this.root, key, data);
  }

  /** In-order traversal → returns issues sorted ascending by key */
  inOrder(node = this.root, result = []) {
    if (!node) return result;
    this.inOrder(node.left, result);
    result.push(node.data);
    this.inOrder(node.right, result);
    return result;
  }

  /** Get all issues sorted by key descending (newest/highest-priority first) */
  getSortedDescending() {
    return this.inOrder().reverse();
  }

  /**
   * Build an AVL tree from issue array sorted by created_at (timestamps).
   * Returns issues in descending chronological order.
   */
  static buildFromIssues(issues, keyFn = (i) => new Date(i.created_at).getTime()) {
    const tree = new AVLTree();
    for (const issue of issues) tree.insert(keyFn(issue), issue);
    return tree.getSortedDescending();
  }
}

module.exports = AVLTree;
