#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// Spatial Limits
#define QT_NODE_CAPACITY 4

// A Geo-Point (Latitude, Longitude) wrapping an Issue
typedef struct {
    double lat;
    double lng;
    int issue_id;
} Point;

// A 2D Bounding Box (Rectangle)
typedef struct {
    double x; // center lat
    double y; // center lng
    double w; // half width
    double h; // half height
} Boundary;

// QuadTree Node
typedef struct QuadTree {
    Boundary boundary;
    Point points[QT_NODE_CAPACITY];
    int count;
    bool divided;
    
    // 4 Spatial Quadrants
    struct QuadTree* nw;
    struct QuadTree* ne;
    struct QuadTree* sw;
    struct QuadTree* se;
} QuadTree;

// Initialize a new Boundary
Boundary newBoundary(double x, double y, double w, double h) {
    Boundary b = {x, y, w, h};
    return b;
}

// Check if a point is inside the boundary
bool contains(Boundary b, Point p) {
    return (p.lat >= b.x - b.w && p.lat <= b.x + b.w &&
            p.lng >= b.y - b.h && p.lng <= b.y + b.h);
}

// Check if two boundaries intersect (for search)
bool intersects(Boundary b, Boundary range) {
    return !(range.x - range.w > b.x + b.w ||
             range.x + range.w < b.x - b.w ||
             range.y - range.h > b.y + b.h ||
             range.y + range.h < b.y - b.h);
}

// Allocate and init a new QuadTree Node
QuadTree* newQuadTree(Boundary b) {
    QuadTree* qt = (QuadTree*)malloc(sizeof(QuadTree));
    qt->boundary = b;
    qt->count = 0;
    qt->divided = false;
    qt->nw = NULL; qt->ne = NULL; qt->sw = NULL; qt->se = NULL;
    return qt;
}

// Subdivide the node into 4 quadrants
void subdivide(QuadTree* qt) {
    double x = qt->boundary.x;
    double y = qt->boundary.y;
    double w = qt->boundary.w;
    double h = qt->boundary.h;

    qt->ne = newQuadTree(newBoundary(x + w/2, y + h/2, w/2, h/2));
    qt->nw = newQuadTree(newBoundary(x - w/2, y + h/2, w/2, h/2));
    qt->se = newQuadTree(newBoundary(x + w/2, y - h/2, w/2, h/2));
    qt->sw = newQuadTree(newBoundary(x - w/2, y - h/2, w/2, h/2));

    qt->divided = true;
}

// Insert a point into the QuadTree
bool insertPoint(QuadTree* qt, Point p) {
    if (!contains(qt->boundary, p)) return false;

    if (qt->count < QT_NODE_CAPACITY) {
        qt->points[qt->count] = p;
        qt->count++;
        return true;
    }

    if (!qt->divided) subdivide(qt);

    if (insertPoint(qt->ne, p)) return true;
    if (insertPoint(qt->nw, p)) return true;
    if (insertPoint(qt->se, p)) return true;
    if (insertPoint(qt->sw, p)) return true;
    
    return false;
}

// Query points within a given boundary range
void queryRange(QuadTree* qt, Boundary range, Point* results, int* numResults) {
    if (!intersects(qt->boundary, range)) return;

    for (int i = 0; i < qt->count; i++) {
        if (contains(range, qt->points[i])) {
            results[*numResults] = qt->points[i];
            (*numResults)++;
        }
    }

    if (qt->divided) {
        queryRange(qt->nw, range, results, numResults);
        queryRange(qt->ne, range, results, numResults);
        queryRange(qt->sw, range, results, numResults);
        queryRange(qt->se, range, results, numResults);
    }
}

int main() {
    // A bounding box holding the entire world map (0,0 is center, covers lat/lng spans)
    QuadTree* mapGrid = newQuadTree(newBoundary(0, 0, 90, 180));

    Point p1 = {20.5937, 78.9629, 1}; // India
    Point p2 = {40.7128, -74.0060, 2}; // NYC
    Point p3 = {51.5074, -0.1278, 3}; // London
    Point p4 = {20.5950, 78.9630, 4}; // Near India point

    insertPoint(mapGrid, p1);
    insertPoint(mapGrid, p2);
    insertPoint(mapGrid, p3);
    insertPoint(mapGrid, p4);

    // Searching an area tightly around India (lat=20.59, lng=78.96, radius spans roughly 0.1 deg)
    Boundary searchArea = newBoundary(20.59, 78.96, 0.1, 0.1);
    
    Point found[100];
    int foundCount = 0;
    
    queryRange(mapGrid, searchArea, found, &foundCount);

    printf("QuadTree Spatial Radius Search found %d issues:\n", foundCount);
    for(int i = 0; i < foundCount; i++) {
        printf("- Issue #%d at (%.4f, %.4f)\n", found[i].issue_id, found[i].lat, found[i].lng);
    }

    return 0;
}
