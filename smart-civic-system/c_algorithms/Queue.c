#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_QUEUE_SIZE 100

// Define a Notification
typedef struct {
    int notification_id;
    int issue_id;
    char message[100];
    int user_id;
} Notification;

// FIFO Queue Structure
typedef struct {
    Notification items[MAX_QUEUE_SIZE];
    int front;
    int rear;
    int current_size;
} Queue;

// Initialize the Queue
void initQueue(Queue* q) {
    q->front = 0;
    q->rear = -1;
    q->current_size = 0;
}

int isFull(Queue* q) {
    return q->current_size == MAX_QUEUE_SIZE;
}

int isEmpty(Queue* q) {
    return q->current_size == 0;
}

// Enqueue a new notification
void enqueue(Queue* q, int id, int issue_id, const char* msg, int uid) {
    if (isFull(q)) {
        printf("Queue Full: Cannot enqueue notification.\n");
        return;
    }
    // Circular increment of rear
    q->rear = (q->rear + 1) % MAX_QUEUE_SIZE;
    q->items[q->rear].notification_id = id;
    q->items[q->rear].issue_id = issue_id;
    q->items[q->rear].user_id = uid;
    strcpy(q->items[q->rear].message, msg);
    q->current_size++;
}

// Dequeue and process a notification
Notification dequeue(Queue* q) {
    if (isEmpty(q)) {
        Notification empty = {-1, -1, "", -1};
        return empty;
    }
    Notification n = q->items[q->front];
    // Circular increment of front
    q->front = (q->front + 1) % MAX_QUEUE_SIZE;
    q->current_size--;
    return n;
}

// Mock Database Connection for Presentation Purposes
void fetchPendingNotifications(Notification* db, int* count) {
    printf("[DB] Connecting to PostgreSQL database...\n");
    printf("[DB] Executing Query: SELECT notification_id, issue_id, message, user_id FROM Notifications WHERE status='pending';\n");
    
    db[0] = (Notification){101, 12, "Resolved: Broken Streetlight", 42};
    db[1] = (Notification){102, 45, "New Issue: Pothole on Main St", 42};
    db[2] = (Notification){103, 8, "Updated: Park Cleanup", 15};
    *count = 3;
    
    printf("[DB] Fetched %d pending notifications for broadcasting.\n\n", *count);
}

int main() {
    Queue asyncNotifications;
    initQueue(&asyncNotifications);

    Notification db[100];
    int pendingCount = 0;
    
    // Simulate fetching dynamic data from backend
    fetchPendingNotifications(db, &pendingCount);

    // Enqueue system notifications
    for (int i = 0; i < pendingCount; i++) {
        enqueue(&asyncNotifications, db[i].notification_id, db[i].issue_id, db[i].message, db[i].user_id);
    }

    printf("Processing Asynchronous Notification Queue (FIFO):\n");
    while (!isEmpty(&asyncNotifications)) {
        Notification n = dequeue(&asyncNotifications);
        printf("- Sent to User %d [For Issue ID %d]: '%s'\n", n.user_id, n.issue_id, n.message);
    }

    return 0;
}
