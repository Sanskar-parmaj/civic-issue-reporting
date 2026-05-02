#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <math.h>

#define QT_NODE_CAPACITY 8
#define EARTH_RADIUS_KM 6371.0
#define PI 3.14159265358979323846

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
    
    struct QuadTree* nw;
    struct QuadTree* ne;
    struct QuadTree* sw;
    struct QuadTree* se;
} QuadTree;

Boundary newBoundary(double x, double y, double w, double h) {
    Boundary b = {x, y, w, h};
    return b;
}

bool contains(Boundary b, Point p) {
    return (p.lat >= b.x - b.w && p.lat <= b.x + b.w &&
            p.lng >= b.y - b.h && p.lng <= b.y + b.h);
}

bool intersects(Boundary b, Boundary range) {
    return !(range.x - range.w > b.x + b.w ||
             range.x + range.w < b.x - b.w ||
             range.y - range.h > b.y + b.h ||
             range.y + range.h < b.y - b.h);
}

QuadTree* newQuadTree(Boundary b) {
    QuadTree* qt = (QuadTree*)malloc(sizeof(QuadTree));
    qt->boundary = b;
    qt->count = 0;
    qt->divided = false;
    qt->nw = NULL; qt->ne = NULL; qt->sw = NULL; qt->se = NULL;
    return qt;
}

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

double haversine(double lat1, double lng1, double lat2, double lng2) {
    double dLat = (lat2 - lat1) * PI / 180.0;
    double dLng = (lng2 - lng1) * PI / 180.0;
    double a = sin(dLat / 2) * sin(dLat / 2) +
               cos(lat1 * PI / 180.0) * cos(lat2 * PI / 180.0) *
               sin(dLng / 2) * sin(dLng / 2);
    return EARTH_RADIUS_KM * 2 * atan2(sqrt(a), sqrt(1 - a));
}

void queryRadius(QuadTree* qt, double centerLat, double centerLng, double radiusKm, Point* results, int* numResults) {
    double latDelta = radiusKm / 111.0;
    double lngDelta = radiusKm / (111.0 * cos(centerLat * PI / 180.0));
    Boundary range = newBoundary(centerLat, centerLng, latDelta, lngDelta);
    
    Point candidates[1000];
    int candidateCount = 0;
    queryRange(qt, range, candidates, &candidateCount);
    
    for (int i = 0; i < candidateCount; i++) {
        if (haversine(centerLat, centerLng, candidates[i].lat, candidates[i].lng) <= radiusKm) {
            results[*numResults] = candidates[i];
            (*numResults)++;
        }
    }
}

bool hasNearbyIssue(QuadTree* qt, double lat, double lng, double thresholdKm) {
    Point results[10];
    int numResults = 0;
    queryRadius(qt, lat, lng, thresholdKm, results, &numResults);
    return numResults > 0;
}

// Mock Database Connection for Presentation Purposes
void fetchIssuesFromDatabase(Point* db, int* count) {
    printf("[DB] Connecting to PostgreSQL database...\n");
    printf("[DB] Executing Query: SELECT issue_id, latitude, longitude FROM Issues;\n");
    
    db[0] = (Point){20.5937, 78.9629, 1}; // India
    db[1] = (Point){40.7128, -74.0060, 2}; // NYC
    db[2] = (Point){51.5074, -0.1278, 3}; // London
    db[3] = (Point){20.5950, 78.9630, 4}; // Near India point (within ~2km)
    *count = 4;
    
    printf("[DB] Fetched %d spatial records successfully.\n\n", *count);
}

int main() {
    QuadTree* qt = newQuadTree(newBoundary(0, 0, 90, 180));

    Point db[100];
    int totalIssues = 0;
    
    // Simulate fetching dynamic data from backend
    fetchIssuesFromDatabase(db, &totalIssues);

    for (int i = 0; i < totalIssues; i++) {
        insertPoint(qt, db[i]);
    }

    Point found[100];
    int foundCount = 0;
    
    // Find issues within 5km of p1
    queryRadius(qt, 20.5937, 78.9629, 5.0, found, &foundCount);

    printf("QuadTree Radius Search (5km) found %d issues:\n", foundCount);
    for(int i = 0; i < foundCount; i++) {
        printf("- Issue #%d at (%.4f, %.4f)\n", found[i].issue_id, found[i].lat, found[i].lng);
    }
    
    bool hasDuplicate = hasNearbyIssue(qt, 40.7120, -74.0050, 0.1);
    printf("Nearby duplicate check (100m in NYC): %s\n", hasDuplicate ? "Found duplicate!" : "Clear");

    return 0;
}
