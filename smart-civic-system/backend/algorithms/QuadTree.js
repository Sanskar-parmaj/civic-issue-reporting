/**
 * QuadTree - 2D Spatial Partitioning
 * Usage:
 *  1. Duplicate issue detection: find nearby issues within ~100m radius
 *  2. Radius search: find all issues in a given search radius
 *  3. Heatmap data: count density in spatial cells
 *
 * Coordinates are stored as (lat, lng).
 */

class Boundary {
  constructor(x, y, w, h) {
    this.x = x; // center latitude
    this.y = y; // center longitude
    this.w = w; // half-width (lat span)
    this.h = h; // half-height (lng span)
  }

  contains(point) {
    return (
      point.lat >= this.x - this.w &&
      point.lat <= this.x + this.w &&
      point.lng >= this.y - this.h &&
      point.lng <= this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

class QuadTree {
  constructor(boundary, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];    // { lat, lng, data }
    this.divided = false;
    this.ne = this.nw = this.se = this.sw = null;
  }

  subdivide() {
    const { x, y, w, h } = this.boundary;
    this.ne = new QuadTree(new Boundary(x + w / 2, y + h / 2, w / 2, h / 2), this.capacity);
    this.nw = new QuadTree(new Boundary(x - w / 2, y + h / 2, w / 2, h / 2), this.capacity);
    this.se = new QuadTree(new Boundary(x + w / 2, y - h / 2, w / 2, h / 2), this.capacity);
    this.sw = new QuadTree(new Boundary(x - w / 2, y - h / 2, w / 2, h / 2), this.capacity);
    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) return false;
    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }
    if (!this.divided) this.subdivide();
    return (
      this.ne.insert(point) ||
      this.nw.insert(point) ||
      this.se.insert(point) ||
      this.sw.insert(point)
    );
  }

  /** Query all points within a rectangular boundary */
  query(range, found = []) {
    if (!this.boundary.intersects(range)) return found;
    for (const p of this.points) {
      if (range.contains(p)) found.push(p);
    }
    if (this.divided) {
      this.ne.query(range, found);
      this.nw.query(range, found);
      this.se.query(range, found);
      this.sw.query(range, found);
    }
    return found;
  }

  /**
   * Find all points within a radius (in km) of a center (lat, lng).
   * Uses Haversine distance for precise calculation.
   */
  queryRadius(centerLat, centerLng, radiusKm) {
    // Approximate degree spans
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos((centerLat * Math.PI) / 180));
    const range = new Boundary(centerLat, centerLng, latDelta, lngDelta);
    const candidates = this.query(range);
    // Filter precisely with Haversine
    return candidates.filter(p => this._haversine(centerLat, centerLng, p.lat, p.lng) <= radiusKm);
  }

  _haversine(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /** Check if any issue exists within ~100m of (lat, lng) — for duplicate detection */
  hasNearbyIssue(lat, lng, thresholdKm = 0.1) {
    const results = this.queryRadius(lat, lng, thresholdKm);
    return results.length > 0 ? results : null;
  }

  /** Build a QuadTree from an array of {lat, lng, ...} issue objects */
  static build(issues) {
    const qt = new QuadTree(new Boundary(0, 0, 90, 180), 8);
    for (const issue of issues) {
      qt.insert({ lat: parseFloat(issue.latitude), lng: parseFloat(issue.longitude), data: issue });
    }
    return qt;
  }
}

module.exports = { QuadTree, Boundary };
