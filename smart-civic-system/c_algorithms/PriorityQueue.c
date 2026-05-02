#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_CAPACITY 100

// Define an Issue
typedef struct {
    int issue_id;
    char title[100];
    int severity; // 1-4
    int votes;
    int escalated; // 0 or 1
    int priority_score; // severity + votes + (escalated ? 10 : 0)
} Issue;

// Max-Heap Priority Queue definition
typedef struct {
    Issue array[MAX_CAPACITY];
    int size;
} PriorityQueue;

// Initialize PQ
void initPQ(PriorityQueue* pq) {
    pq->size = 0;
}

// Swap two issues in the heap
void swap(Issue* a, Issue* b) {
    Issue temp = *a;
    *a = *b;
    *b = temp;
}

// Helper to bubble up the element at index i (Max-Heapify Up)
void heapifyUp(PriorityQueue* pq, int i) {
    int parent = (i - 1) / 2;
    if (i > 0 && pq->array[i].priority_score > pq->array[parent].priority_score) {
        swap(&pq->array[i], &pq->array[parent]);
        heapifyUp(pq, parent);
    }
}

// Helper to push down the element at index i (Max-Heapify Down)
void heapifyDown(PriorityQueue* pq, int i) {
    int maxIndex = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < pq->size && pq->array[left].priority_score > pq->array[maxIndex].priority_score)
        maxIndex = left;

    if (right < pq->size && pq->array[right].priority_score > pq->array[maxIndex].priority_score)
        maxIndex = right;

    if (i != maxIndex) {
        swap(&pq->array[i], &pq->array[maxIndex]);
        heapifyDown(pq, maxIndex);
    }
}

// Insert an issue into PQ
void insert(PriorityQueue* pq, int id, const char* title, int sev, int votes, int escalated) {
    if (pq->size == MAX_CAPACITY) {
        printf("Priority Queue is full.\n");
        return;
    }
    
    Issue newIssue;
    newIssue.issue_id = id;
    strcpy(newIssue.title, title);
    newIssue.severity = sev;
    newIssue.votes = votes;
    newIssue.escalated = escalated;
    newIssue.priority_score = sev + votes + (escalated ? 10 : 0);

    // Insert at end
    pq->array[pq->size] = newIssue;
    pq->size++;

    // Fix the heap property
    heapifyUp(pq, pq->size - 1);
}

// Extract the highest priority issue (root)
Issue extractMax(PriorityQueue* pq) {
    if (pq->size <= 0) {
        Issue empty = {-1, "", 0, 0, 0};
        return empty;
    }
    if (pq->size == 1) {
        pq->size--;
        return pq->array[0];
    }

    Issue root = pq->array[0];
    pq->array[0] = pq->array[pq->size - 1];
    pq->size--;
    heapifyDown(pq, 0);

    return root;
}

// Mock Database Connection for Presentation Purposes
void fetchIssuesFromDatabase(Issue* db, int* count) {
    printf("[DB] Connecting to PostgreSQL database...\n");
    printf("[DB] Executing Query: SELECT issue_id, title, severity, votes, escalated FROM Issues;\n");
    
    // id, title, sev, votes, escalated, priority_score
    db[0] = (Issue){1, "Pothole on Main St", 2, 5, 0, 0}; 
    db[1] = (Issue){2, "Burst Water Pipe", 4, 10, 0, 0};  
    db[2] = (Issue){3, "Broken Streetlight", 1, 2, 1, 0}; 
    *count = 3;
    
    printf("[DB] Fetched %d records for Priority Queue processing.\n\n", *count);
}

int main() {
    PriorityQueue pq;
    initPQ(&pq);

    Issue db[100];
    int totalIssues = 0;
    
    // Simulate fetching dynamic data from backend
    fetchIssuesFromDatabase(db, &totalIssues);

    for (int i = 0; i < totalIssues; i++) {
        insert(&pq, db[i].issue_id, db[i].title, db[i].severity, db[i].votes, db[i].escalated);
    }

    printf("Processing Highest Priority Issues First:\n");
    while (pq.size > 0) {
        Issue max = extractMax(&pq);
        printf("- Issue #%d [%s] (Priority Score: %d)\n", 
            max.issue_id, max.title, max.priority_score);
    }

    return 0;
}
