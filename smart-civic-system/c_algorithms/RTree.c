#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_ENTRIES 9

typedef struct {
    double minLat, minLng;
    double maxLat, maxLng;
} MBR;

double area(MBR m) {
    return (m.maxLat - m.minLat) * (m.maxLng - m.minLng);
}

MBR enlarge(MBR m1, MBR m2) {
    MBR result;
    result.minLat = (m1.minLat < m2.minLat) ? m1.minLat : m2.minLat;
    result.minLng = (m1.minLng < m2.minLng) ? m1.minLng : m2.minLng;
    result.maxLat = (m1.maxLat > m2.maxLat) ? m1.maxLat : m2.maxLat;
    result.maxLng = (m1.maxLng > m2.maxLng) ? m1.maxLng : m2.maxLng;
    return result;
}

bool intersects(MBR m1, MBR m2) {
    return !(m2.minLat > m1.maxLat || m2.maxLat < m1.minLat ||
             m2.minLng > m1.maxLng || m2.maxLng < m1.minLng);
}

typedef struct {
    double lat, lng;
    int issue_id;
} IssueData;

// RTree Node definition
typedef struct RTreeNode {
    bool isLeaf;
    MBR mbr;
    bool hasMbr;
    
    // In leaf nodes: stores IssueData entries
    // In internal nodes: stores pointers to child RTreeNodes
    int count;
    union {
        IssueData data[MAX_ENTRIES + 1];
        struct RTreeNode* children[MAX_ENTRIES + 1];
    } entries;
    
    MBR childMbrs[MAX_ENTRIES + 1]; // To cache MBR of each entry for internal nodes
} RTreeNode;

RTreeNode* newRTreeNode(bool isLeaf) {
    RTreeNode* node = (RTreeNode*)malloc(sizeof(RTreeNode));
    node->isLeaf = isLeaf;
    node->count = 0;
    node->hasMbr = false;
    return node;
}

void updateMBR(RTreeNode* node) {
    if (node->count == 0) {
        node->hasMbr = false;
        return;
    }
    
    MBR result;
    if (node->isLeaf) {
        result.minLat = node->entries.data[0].lat;
        result.minLng = node->entries.data[0].lng;
        result.maxLat = node->entries.data[0].lat;
        result.maxLng = node->entries.data[0].lng;
        for (int i = 1; i < node->count; i++) {
            MBR m = {node->entries.data[i].lat, node->entries.data[i].lng,
                     node->entries.data[i].lat, node->entries.data[i].lng};
            result = enlarge(result, m);
        }
    } else {
        result = node->childMbrs[0];
        for (int i = 1; i < node->count; i++) {
            result = enlarge(result, node->childMbrs[i]);
        }
    }
    node->mbr = result;
    node->hasMbr = true;
}

void split(RTreeNode* parent, int idx) {
    RTreeNode* node = parent->entries.children[idx];
    int half = (node->count + 1) / 2;
    int rightCount = node->count - half;
    
    RTreeNode* newNode = newRTreeNode(node->isLeaf);
    
    if (node->isLeaf) {
        for (int i = 0; i < rightCount; i++) {
            newNode->entries.data[i] = node->entries.data[half + i];
        }
    } else {
        for (int i = 0; i < rightCount; i++) {
            newNode->entries.children[i] = node->entries.children[half + i];
            newNode->childMbrs[i] = node->childMbrs[half + i];
        }
    }
    
    newNode->count = rightCount;
    node->count = half;
    
    updateMBR(node);
    updateMBR(newNode);
    
    // Add newNode to parent
    parent->entries.children[parent->count] = newNode;
    parent->childMbrs[idx] = node->mbr; // update modified node's cached MBR
    parent->childMbrs[parent->count] = newNode->mbr;
    parent->count++;
}

void insertNode(RTreeNode* node, double lat, double lng, IssueData data, int depth) {
    MBR entryMbr = {lat, lng, lat, lng};
    
    if (node->isLeaf) {
        node->entries.data[node->count] = data;
        node->count++;
        node->mbr = node->hasMbr ? enlarge(node->mbr, entryMbr) : entryMbr;
        node->hasMbr = true;
    } else {
        int bestIdx = 0;
        double bestGrowth = -1;
        
        for (int i = 0; i < node->count; i++) {
            double currentArea = area(node->childMbrs[i]);
            double newArea = area(enlarge(node->childMbrs[i], entryMbr));
            double growth = newArea - currentArea;
            
            if (bestGrowth < 0 || growth < bestGrowth) {
                bestGrowth = growth;
                bestIdx = i;
            }
        }
        
        RTreeNode* best = node->entries.children[bestIdx];
        insertNode(best, lat, lng, data, depth + 1);
        
        node->childMbrs[bestIdx] = best->mbr;
        node->mbr = node->hasMbr ? enlarge(node->mbr, entryMbr) : entryMbr;
        node->hasMbr = true;
        
        if (best->count > MAX_ENTRIES) {
            split(node, bestIdx);
        }
    }
}

typedef struct {
    RTreeNode* root;
} RTree;

void rtreeInsert(RTree* tree, double lat, double lng, IssueData data) {
    insertNode(tree->root, lat, lng, data, 0);
    if (tree->root->count > MAX_ENTRIES) {
        RTreeNode* newRoot = newRTreeNode(false);
        newRoot->entries.children[0] = tree->root;
        newRoot->childMbrs[0] = tree->root->mbr;
        newRoot->count = 1;
        
        split(newRoot, 0);
        tree->root = newRoot;
        updateMBR(tree->root);
    }
}

void searchRTree(RTreeNode* node, MBR range, IssueData* results, int* count) {
    if (!node->hasMbr || !intersects(range, node->mbr)) return;
    
    if (node->isLeaf) {
        for (int i = 0; i < node->count; i++) {
            MBR entryMbr = {node->entries.data[i].lat, node->entries.data[i].lng,
                            node->entries.data[i].lat, node->entries.data[i].lng};
            if (intersects(range, entryMbr)) {
                results[*count] = node->entries.data[i];
                (*count)++;
            }
        }
    } else {
        for (int i = 0; i < node->count; i++) {
            searchRTree(node->entries.children[i], range, results, count);
        }
    }
}

typedef struct {
    double lat;
    double lng;
    int count;
} HeatmapCell;

// Match generateHeatmap logic from RTree.js
void generateHeatmap(RTree* tree, IssueData* issues, int issueCount, HeatmapCell* heatmap, int* hmCount) {
    double radius = 0.009;
    bool processed[1000] = {false};
    
    for (int i = 0; i < issueCount; i++) {
        if (processed[issues[i].issue_id]) continue;
        
        double lat = issues[i].lat;
        double lng = issues[i].lng;
        
        MBR queryBox = {lat - radius, lng - radius, lat + radius, lng + radius};
        IssueData neighbors[1000];
        int n_count = 0;
        
        searchRTree(tree->root, queryBox, neighbors, &n_count);
        
        double sumLat = 0, sumLng = 0;
        for (int j = 0; j < n_count; j++) {
            sumLat += neighbors[j].lat;
            sumLng += neighbors[j].lng;
            processed[neighbors[j].issue_id] = true;
        }
        
        if (n_count > 0) {
            heatmap[*hmCount].lat = sumLat / n_count;
            heatmap[*hmCount].lng = sumLng / n_count;
            heatmap[*hmCount].count = n_count;
            (*hmCount)++;
        }
    }
}

// Mock Database Connection for Presentation Purposes
void fetchIssuesFromDatabase(IssueData* db, int* count) {
    printf("[DB] Connecting to PostgreSQL database...\n");
    printf("[DB] Executing Query: SELECT issue_id, latitude, longitude FROM Issues;\n");
    
    db[0] = (IssueData){40.71, -74.00, 1};
    db[1] = (IssueData){40.712, -74.005, 2};
    db[2] = (IssueData){40.715, -74.001, 3};
    db[3] = (IssueData){40.65, -74.02, 4}; // Far away
    *count = 4;
    
    printf("[DB] Fetched %d records for Heatmap Generation.\n\n", *count);
}

int main() {
    RTree tree;
    tree.root = newRTreeNode(true);
    
    IssueData db[100];
    int totalIssues = 0;
    
    // Simulate fetching dynamic data from backend
    fetchIssuesFromDatabase(db, &totalIssues);
    
    for (int i = 0; i < totalIssues; i++) {
        rtreeInsert(&tree, db[i].lat, db[i].lng, db[i]);
    }
    
    HeatmapCell heatmap[100];
    int hmCount = 0;
    
    generateHeatmap(&tree, db, totalIssues, heatmap, &hmCount);
    
    printf("RTree Heatmap Generation:\n");
    for (int i = 0; i < hmCount; i++) {
        printf("- Cell %d: Centroid (%.4f, %.4f) | Issues Clustered: %d\n", 
               i+1, heatmap[i].lat, heatmap[i].lng, heatmap[i].count);
    }
    
    return 0;
}
