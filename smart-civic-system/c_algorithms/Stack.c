#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STACK_SIZE 100

// Define an Activity Log entry
typedef struct {
    char action[100];
    long timestamp;
} Activity;

// LIFO Stack mapped array structure
typedef struct {
    Activity items[MAX_STACK_SIZE];
    int top;
} Stack;

// Initialize Stack
void initStack(Stack* s) {
    s->top = -1;
}

// Check if stack is empty
int isEmpty(Stack* s) {
    return s->top == -1;
}

// Check if stack is full
int isFull(Stack* s) {
    return s->top == MAX_STACK_SIZE - 1;
}

// Push a new activity onto the timeline
void push(Stack* s, const char* action, long time) {
    if (isFull(s)) {
        printf("Stack Full: Cannot log more recent activities.\n");
        return;
    }
    s->top++;
    strcpy(s->items[s->top].action, action);
    s->items[s->top].timestamp = time;
}

// Pop the most recent activity
Activity pop(Stack* s) {
    if (isEmpty(s)) {
        Activity empty = {"", 0};
        return empty;
    }
    Activity latest = s->items[s->top];
    s->top--;
    return latest;
}

int main() {
    Stack timeline;
    initStack(&timeline);

    // Simulated user actions
    push(&timeline, "User reported a pothole issue", 1600000100);
    push(&timeline, "User upvoted an electricity issue", 1600000200);
    push(&timeline, "User commented on a water issue", 1600000300);

    printf("User Timeline (Recent to Oldest):\n");
    while (!isEmpty(&timeline)) {
        Activity recent = pop(&timeline);
        printf("- [%ld] %s\n", recent.timestamp, recent.action);
    }

    return 0;
}
