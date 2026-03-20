#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 100

// A hash map entry for counting stats (e.g. Category Stats)
typedef struct HashNode {
    char key[50];    // Category Name (e.g. "Road")
    int count;       // Frequency
    struct HashNode* next;
} HashNode;

// Hash Map structure
typedef struct {
    HashNode* buckets[TABLE_SIZE];
} HashMap;

// Initialize Hash Map
void initHashMap(HashMap* map) {
    for (int i = 0; i < TABLE_SIZE; i++) {
        map->buckets[i] = NULL;
    }
}

// Simple hash function for strings
unsigned int hash(const char* str) {
    unsigned int hash = 5381;
    int c;
    while ((c = *str++))
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    return hash % TABLE_SIZE;
}

// Update or add frequency to the hash map
void incrementFrequency(HashMap* map, const char* category) {
    unsigned int index = hash(category);
    HashNode* current = map->buckets[index];
    
    // Check if category exists
    while (current != NULL) {
        if (strcmp(current->key, category) == 0) {
            current->count++;
            return;
        }
        current = current->next;
    }
    
    // Create new node if it doesn't exist
    HashNode* newNode = (HashNode*)malloc(sizeof(HashNode));
    strcpy(newNode->key, category);
    newNode->count = 1;
    newNode->next = map->buckets[index];
    map->buckets[index] = newNode;
}

// Print Hash Map Stats
void printStats(HashMap* map) {
    printf("Category Statistics:\n");
    for (int i = 0; i < TABLE_SIZE; i++) {
        HashNode* current = map->buckets[i];
        while (current != NULL) {
            printf("- %s: %d issues\n", current->key, current->count);
            current = current->next;
        }
    }
}

int main() {
    HashMap map;
    initHashMap(&map);

    // Simulating categorization of incoming issues
    incrementFrequency(&map, "Road");
    incrementFrequency(&map, "Water");
    incrementFrequency(&map, "Road");
    incrementFrequency(&map, "Electricity");
    incrementFrequency(&map, "Water");
    incrementFrequency(&map, "Road");

    // Print frequencies
    printStats(&map);

    return 0;
}
