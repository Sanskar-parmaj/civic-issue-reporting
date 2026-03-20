/**
 * Trie - Prefix Tree Implementation
 * Usage: Duplicate issue detection via text similarity matching on issue titles.
 * All titles are normalized (lowercase, tokenized) before insertion.
 */
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.issueId = null; // store issue_id at end node
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /** Normalize a title into lowercase word tokens */
  _normalize(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(Boolean);
  }

  /**
   * Insert an issue title into the Trie.
   * Each "word" token is a level; entire title path is stored.
   */
  insert(title, issueId) {
    const words = this._normalize(title);
    let node = this.root;
    for (const word of words) {
      for (const char of word) {
        if (!node.children[char]) node.children[char] = new TrieNode();
        node = node.children[char];
      }
      // Add word separator node
      if (!node.children['_']) node.children['_'] = new TrieNode();
      node = node.children['_'];
    }
    node.isEnd = true;
    node.issueId = issueId;
  }

  /**
   * Search if an exact title exists.
   * Returns issueId if found, null otherwise.
   */
  search(title) {
    const words = this._normalize(title);
    let node = this.root;
    for (const word of words) {
      for (const char of word) {
        if (!node.children[char]) return null;
        node = node.children[char];
      }
      if (!node.children['_']) return null;
      node = node.children['_'];
    }
    return node.isEnd ? node.issueId : null;
  }

  /**
   * Check if a similar title exists (prefix match — at least 60% word overlap).
   * Returns { similar: boolean, issueId: number|null, matchScore: number }
   */
  checkSimilarity(title, allTitles) {
    const inputWords = new Set(this._normalize(title));
    let bestScore = 0;
    let bestIssueId = null;

    for (const { title: existingTitle, issueId } of allTitles) {
      const existingWords = new Set(this._normalize(existingTitle));
      const intersection = [...inputWords].filter(w => existingWords.has(w)).length;
      const union = new Set([...inputWords, ...existingWords]).size;
      const score = union === 0 ? 0 : intersection / union; // Jaccard similarity
      if (score > bestScore) {
        bestScore = score;
        bestIssueId = issueId;
      }
    }
    return { similar: bestScore >= 0.6, issueId: bestIssueId, matchScore: bestScore };
  }

  /** Remove a title from the Trie */
  delete(title) {
    const words = this._normalize(title);
    this._deleteHelper(this.root, words, 0, 0);
  }

  _deleteHelper(node, words, wordIdx, charIdx) {
    if (wordIdx === words.length) {
      if (node.isEnd) { node.isEnd = false; node.issueId = null; }
      return Object.keys(node.children).length === 0;
    }
    const word = words[wordIdx];
    if (charIdx === word.length) {
      const child = node.children['_'];
      if (!child) return false;
      const shouldDelete = this._deleteHelper(child, words, wordIdx + 1, 0);
      if (shouldDelete) delete node.children['_'];
      return !node.isEnd && Object.keys(node.children).length === 0;
    }
    const char = word[charIdx];
    const child = node.children[char];
    if (!child) return false;
    const shouldDelete = this._deleteHelper(child, words, wordIdx, charIdx + 1);
    if (shouldDelete) delete node.children[char];
    return !node.isEnd && Object.keys(node.children).length === 0;
  }
}

module.exports = Trie;
