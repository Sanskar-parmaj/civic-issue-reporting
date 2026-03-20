/**
 * LinkedList - Doubly Linked List
 * Usage: Comment chain ordering — each new comment is appended to the list.
 * Supports O(1) append, O(n) traversal, and deletion by commentId.
 */
class ListNode {
  constructor(data) {
    this.data = data; // comment object { comment_id, user_id, comment, created_at, ... }
    this.prev = null;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /** Append a comment to the end of the list (chronological order) */
  append(data) {
    const node = new ListNode(data);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
    return node;
  }

  /** Prepend a comment to the front */
  prepend(data) {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.length++;
    return node;
  }

  /** Delete a node by comment_id */
  deleteById(commentId) {
    let current = this.head;
    while (current) {
      if (current.data.comment_id === commentId) {
        if (current.prev) current.prev.next = current.next;
        else this.head = current.next;
        if (current.next) current.next.prev = current.prev;
        else this.tail = current.prev;
        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  /** Return all comments as an array (oldest → newest) */
  toArray() {
    const result = [];
    let current = this.head;
    while (current) { result.push(current.data); current = current.next; }
    return result;
  }

  /** Return all comments newest → oldest */
  toArrayReverse() {
    const result = [];
    let current = this.tail;
    while (current) { result.push(current.data); current = current.prev; }
    return result;
  }

  /** Build a LinkedList from an array of comment objects */
  static fromArray(comments) {
    const list = new LinkedList();
    for (const c of comments) list.append(c);
    return list;
  }
}

module.exports = LinkedList;
