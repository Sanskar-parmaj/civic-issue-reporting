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
    int priority_score; // severity + votes
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
void insert(PriorityQueue* pq, int id, const char* title, int sev, int votes) {
    if (pq->size == MAX_CAPACITY) {
        printf("Priority Queue is full.\n");
        return;
    }
    
    Issue newIssue;
    newIssue.issue_id = id;
    strcpy(newIssue.title, title);
    newIssue.severity = sev;
    newIssue.votes = votes;
    newIssue.priority_score = sev + votes;

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

int main() {
    PriorityQueue pq;
    initPQ(&pq);

    insert(&pq, 1, "Pothole on Main St", 2, 5); // Score: 7
    insert(&pq, 2, "Burst Water Pipe", 4, 10);  // Score: 14
    insert(&pq, 3, "Broken Streetlight", 1, 2); // Score: 3

    printf("Processing Highest Priority Issues First:\n");
    while (pq.size > 0) {
        Issue max = extractMax(&pq);
        printf("- Issue #%d [%s] (Priority Score: %d)\n", 
            max.issue_id, max.title, max.priority_score);
    }

    return 0;
}
