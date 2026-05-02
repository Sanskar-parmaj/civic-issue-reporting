#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// A node in the doubly linked list representing a Comment
typedef struct CommentNode {
    int comment_id;
    char text[256];
    char author[50];
    struct CommentNode* prev;
    struct CommentNode* next;
} CommentNode;

// Doubly Linked List Structure
typedef struct {
    CommentNode* head;
    CommentNode* tail;
    int size;
} LinkedList;

// Initialize an empty list
void initList(LinkedList* list) {
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}

// Append a new comment to the end of the list
void appendComment(LinkedList* list, int id, const char* text, const char* author) {
    CommentNode* newNode = (CommentNode*)malloc(sizeof(CommentNode));
    newNode->comment_id = id;
    strcpy(newNode->text, text);
    strcpy(newNode->author, author);
    newNode->next = NULL;
    
    if (list->tail == NULL) {
        // First element
        newNode->prev = NULL;
        list->head = newNode;
        list->tail = newNode;
    } else {
        // Appending to the tail
        newNode->prev = list->tail;
        list->tail->next = newNode;
        list->tail = newNode;
    }
    list->size++;
}

// Print comments in chronological sequence
void printChronological(LinkedList* list) {
    printf("Comments (Oldest to Newest):\n");
    CommentNode* curr = list->head;
    while (curr != NULL) {
        printf("[%s]: %s\n", curr->author, curr->text);
        curr = curr->next;
    }
    printf("\n");
}

// Print comments in reverse chronological sequence
void printReverseChronological(LinkedList* list) {
    printf("Comments (Newest to Oldest):\n");
    CommentNode* curr = list->tail;
    while (curr != NULL) {
        printf("[%s]: %s\n", curr->author, curr->text);
        curr = curr->prev;
    }
    printf("\n");
}

// Mock Database Connection for Presentation Purposes
typedef struct {
    int id;
    char text[256];
    char author[50];
} CommentData;

void fetchCommentsFromDatabase(CommentData* db, int* count) {
    printf("[DB] Connecting to PostgreSQL database...\n");
    printf("[DB] Executing Query: SELECT comment_id, text, author FROM Comments WHERE issue_id = 12 ORDER BY created_at ASC;\n");
    
    db[0] = (CommentData){1, "There is a massive pothole here.", "Citizen_A"};
    db[1] = (CommentData){2, "I tripped over it yesterday!", "Citizen_B"};
    db[2] = (CommentData){3, "Municipal team has been dispatched.", "Admin_User"};
    *count = 3;
    
    printf("[DB] Fetched %d comments successfully.\n\n", *count);
}

int main() {
    LinkedList list;
    initList(&list);

    CommentData db[100];
    int commentCount = 0;
    
    // Simulate fetching dynamic data from backend
    fetchCommentsFromDatabase(db, &commentCount);

    for (int i = 0; i < commentCount; i++) {
        appendComment(&list, db[i].id, db[i].text, db[i].author);
    }

    printChronological(&list);
    printReverseChronological(&list);

    return 0;
}
