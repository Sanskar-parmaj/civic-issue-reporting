#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_ENTRIES 4

// A Bounding Box representing a region or point
typedef struct {
    double minLat, minLng;
    double maxLat, maxLng;
} MBR;

// Simplified R-Tree Node
typedef struct RTreeNode {
    bool isLeaf;
    int count;
    MBR mbrs[MAX_ENTRIES];
    int issue_ids[MAX_ENTRIES]; // For leaves: issue_id
    struct RTreeNode* children[MAX_ENTRIES]; // For branches: child nodes
} RTreeNode;

// Calculate area of an MBR
double calculateArea(MBR m) {
    return (m.maxLat - m.minLat) * (m.maxLng - m.minLng);
}

// Compute the enlarged MBR that contains both m1 and m2
MBR enlargeMBR(MBR m1, MBR m2) {
    MBR result;
    result.minLat = (m1.minLat < m2.minLat) ? m1.minLat : m2.minLat;
    result.minLng = (m1.minLng < m2.minLng) ? m1.minLng : m2.minLng;
    result.maxLat = (m1.maxLat > m2.maxLat) ? m1.maxLat : m2.maxLat;
    result.maxLng = (m1.maxLng > m2.maxLng) ? m1.maxLng : m2.maxLng;
    return result;
}

// Check if two MBRs intersect
bool intersects(MBR m1, MBR m2) {
    return !(m1.minLat > m2.maxLat || m1.maxLat < m2.minLat ||
             m1.minLng > m2.maxLng || m1.maxLng < m2.minLng);
}

// Allocate a new Node
RTreeNode* newRTreeNode(bool isLeaf) {
    RTreeNode* node = (RTreeNode*)malloc(sizeof(RTreeNode));
    node->isLeaf = isLeaf;
    node->count = 0;
    return node;
}

// Calculate density for heatmaps
// In a full R-Tree implementation, this recursively searches MBRs.
// Simplified DFS for counting intersecting points in a region.
int countDensity(RTreeNode* node, MBR searchArea) {
    if (node == NULL) return 0;
    
    int points = 0;
    for (int i = 0; i < node->count; i++) {
        if (intersects(node->mbrs[i], searchArea)) {
            if (node->isLeaf) {
                points++; // Found a specific issue
            } else {
                points += countDensity(node->children[i], searchArea); // Search branch
            }
        }
    }
    return points;
}

// Hardcoded sample RTree creation for demonstration logic
int main() {
    RTreeNode* root = newRTreeNode(false);
    
    // Create two leaf chunks (e.g., North and South city zones)
    RTreeNode* northZone = newRTreeNode(true);
    northZone->mbrs[0] = (MBR){40.71, -74.00, 40.71, -74.00}; northZone->issue_ids[0] = 1;
    northZone->mbrs[1] = (MBR){40.72, -74.01, 40.72, -74.01}; northZone->issue_ids[1] = 2;
    northZone->mbrs[2] = (MBR){40.75, -73.98, 40.75, -73.98}; northZone->issue_ids[2] = 3;
    northZone->count = 3;

    RTreeNode* southZone = newRTreeNode(true);
    southZone->mbrs[0] = (MBR){40.65, -74.02, 40.65, -74.02}; southZone->issue_ids[0] = 4;
    southZone->count = 1;

    // Attach to root with their expanded bounding boxes
    root->children[0] = northZone;
    root->mbrs[0] = (MBR){40.71, -74.01, 40.75, -73.98};
    
    root->children[1] = southZone;
    root->mbrs[1] = (MBR){40.65, -74.02, 40.65, -74.02};
    root->count = 2;

    // Generating Heatmap Density
    printf("R-Tree Heatmap Density Calculations:\n");
    
    // Grid search over New York area
    MBR searchGrid1 = {40.70, -74.05, 40.73, -73.99}; // Lower Manhattanish
    MBR searchGrid2 = {40.60, -74.05, 40.68, -73.99}; // South Brooklynish
    
    printf("Density in Grid 1 (Midtown/Downtown): %d issues\n", countDensity(root, searchGrid1));
    printf("Density in Grid 2 (South): %d issues\n", countDensity(root, searchGrid2));

    return 0;
}
