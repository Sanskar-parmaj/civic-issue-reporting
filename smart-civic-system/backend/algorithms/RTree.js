/**
 * R-Tree - Minimum Bounding Rectangle Spatial Index
 * Usage: Heatmap density calculation — group issues into spatial cells
 * and compute density per region.
 */

class MBR {
  constructor(minLat, minLng, maxLat, maxLng) {
    this.minLat = minLat; this.minLng = minLng;
    this.maxLat = maxLat; this.maxLng = maxLng;
  }
  area() {
    return (this.maxLat - this.minLat) * (this.maxLng - this.minLng);
  }
  enlarge(other) {
    return new MBR(
      Math.min(this.minLat, other.minLat),
      Math.min(this.minLng, other.minLng),
      Math.max(this.maxLat, other.maxLat),
      Math.max(this.maxLng, other.maxLng)
    );
  }
  intersects(other) {
    return !(
      other.minLat > this.maxLat || other.maxLat < this.minLat ||
      other.minLng > this.maxLng || other.maxLng < this.minLng
    );
  }
  contains(lat, lng) {
    return lat >= this.minLat && lat <= this.maxLat && lng >= this.minLng && lng <= this.maxLng;
  }
}

class RTreeNode {
  constructor(isLeaf = true) {
    this.isLeaf = isLeaf;
    this.mbr = null;
    this.children = []; // RTreeNode[] or { mbr, data }[]
  }
}

class RTree {
  constructor(maxEntries = 9) {
    this.maxEntries = maxEntries;
    this.root = new RTreeNode(true);
  }

  /** Insert a point (lat, lng) with associated data */
  insert(lat, lng, data) {
    const entry = { mbr: new MBR(lat, lng, lat, lng), data };
    this._insert(this.root, entry, 0);
    if (this.root.children.length > this.maxEntries) {
      const newRoot = new RTreeNode(false);
      newRoot.children.push(this.root);
      this._split(newRoot, 0);
      this.root = newRoot;
      this._updateMBR(this.root);
    }
  }

  _insert(node, entry, depth) {
    if (node.isLeaf) {
      node.children.push(entry);
      node.mbr = node.mbr ? node.mbr.enlarge(entry.mbr) : entry.mbr;
    } else {
      let best = node.children[0];
      let bestGrowth = Infinity;
      for (const child of node.children) {
        const growth = child.mbr.enlarge(entry.mbr).area() - child.mbr.area();
        if (growth < bestGrowth) { bestGrowth = growth; best = child; }
      }
      this._insert(best, entry, depth + 1);
      node.mbr = node.mbr ? node.mbr.enlarge(entry.mbr) : entry.mbr;
      if (best.children.length > this.maxEntries) this._split(node, node.children.indexOf(best));
    }
  }

  _split(parent, idx) {
    const node = parent.children[idx];
    const half = Math.ceil(node.children.length / 2);
    const newNode = new RTreeNode(node.isLeaf);
    newNode.children = node.children.splice(half);
    this._updateMBR(node);
    this._updateMBR(newNode);
    parent.children.push(newNode);
  }

  _updateMBR(node) {
    if (node.children.length === 0) { node.mbr = null; return; }
    node.mbr = node.children.reduce((acc, c) => acc ? acc.enlarge(c.mbr) : c.mbr, null);
  }

  /** Query all entries within a bounding box */
  query(minLat, minLng, maxLat, maxLng) {
    const range = new MBR(minLat, minLng, maxLat, maxLng);
    const results = [];
    this._search(this.root, range, results);
    return results;
  }

  _search(node, range, results) {
    if (!node.mbr || !range.intersects(node.mbr)) return;
    if (node.isLeaf) {
      for (const entry of node.children) {
        if (range.intersects(entry.mbr)) results.push(entry.data);
      }
    } else {
      for (const child of node.children) this._search(child, range, results);
    }
  }

  /**
   * Generate a heatmap grid.
   * Divides the world into `gridSize x gridSize` cells and counts issues per cell.
   * Returns array of { lat, lng, count } for cells with count > 0.
   */
  generateHeatmap(issues, gridSize = 20) {
    if (issues.length === 0) return [];
    const lats = issues.map(i => parseFloat(i.latitude));
    const lngs = issues.map(i => parseFloat(i.longitude));
    const minLat = Math.min(...lats) - 0.01;
    const maxLat = Math.max(...lats) + 0.01;
    const minLng = Math.min(...lngs) - 0.01;
    const maxLng = Math.max(...lngs) + 0.01;
    const latStep = (maxLat - minLat) / gridSize;
    const lngStep = (maxLng - minLng) / gridSize;
    const heatmap = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cMinLat = minLat + r * latStep;
        const cMaxLat = cMinLat + latStep;
        const cMinLng = minLng + c * lngStep;
        const cMaxLng = cMinLng + lngStep;
        const count = this.query(cMinLat, cMinLng, cMaxLat, cMaxLng).length;
        if (count > 0) {
          heatmap.push({ lat: (cMinLat + cMaxLat) / 2, lng: (cMinLng + cMaxLng) / 2, count });
        }
      }
    }
    return heatmap;
  }

  /** Build an R-Tree from an array of issue objects */
  static build(issues) {
    const tree = new RTree();
    for (const issue of issues) {
      tree.insert(parseFloat(issue.latitude), parseFloat(issue.longitude), issue);
    }
    return tree;
  }
}

module.exports = { RTree, MBR };
