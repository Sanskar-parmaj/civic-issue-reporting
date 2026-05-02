#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

#define ALPHABET_SIZE 37 // a-z (26) + 0-9 (10) + '_' (1)

typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    bool isEnd;
    int issueId; // issue_id at the end node
} TrieNode;

TrieNode* newTrieNode() {
    TrieNode* node = (TrieNode*)malloc(sizeof(TrieNode));
    node->isEnd = false;
    node->issueId = -1;
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    return node;
}

int getCharIndex(char c) {
    if (c >= 'a' && c <= 'z') return c - 'a';
    if (c >= '0' && c <= '9') return 26 + (c - '0');
    if (c == '_') return 36;
    return -1;
}

// Simple dynamic array of strings to hold normalized words
typedef struct {
    char words[50][50];
    int count;
} WordList;

WordList normalize(const char* title) {
    WordList list;
    list.count = 0;
    
    char buffer[256];
    int bufIdx = 0;
    for (int i = 0; title[i] != '\0' && bufIdx < 255; i++) {
        char c = tolower(title[i]);
        if (isalnum(c) || isspace(c)) {
            buffer[bufIdx++] = c;
        }
    }
    buffer[bufIdx] = '\0';
    
    char* token = strtok(buffer, " ");
    while (token != NULL && list.count < 50) {
        strcpy(list.words[list.count++], token);
        token = strtok(NULL, " ");
    }
    return list;
}

void insert(TrieNode* root, const char* title, int issueId) {
    WordList words = normalize(title);
    TrieNode* node = root;
    
    for (int i = 0; i < words.count; i++) {
        char* word = words.words[i];
        for (int j = 0; word[j] != '\0'; j++) {
            int idx = getCharIndex(word[j]);
            if (idx == -1) continue;
            if (!node->children[idx]) {
                node->children[idx] = newTrieNode();
            }
            node = node->children[idx];
        }
        
        // Add word separator '_'
        int sepIdx = getCharIndex('_');
        if (!node->children[sepIdx]) {
            node->children[sepIdx] = newTrieNode();
        }
        node = node->children[sepIdx];
    }
    
    node->isEnd = true;
    node->issueId = issueId;
}

// Search for exact normalized title match
int search(TrieNode* root, const char* title) {
    WordList words = normalize(title);
    TrieNode* node = root;
    
    for (int i = 0; i < words.count; i++) {
        char* word = words.words[i];
        for (int j = 0; word[j] != '\0'; j++) {
            int idx = getCharIndex(word[j]);
            if (idx == -1) continue;
            if (!node->children[idx]) return -1;
            node = node->children[idx];
        }
        
        int sepIdx = getCharIndex('_');
        if (!node->children[sepIdx]) return -1;
        node = node->children[sepIdx];
    }
    
    return node->isEnd ? node->issueId : -1;
}

// Check Similarity using Jaccard index
typedef struct {
    int issue_id;
    char title[256];
} IssueDict;

void checkSimilarity(const char* inputTitle, IssueDict* existingIssues, int totalIssues) {
    WordList inputWordsList = normalize(inputTitle);
    
    // Convert input list to distinct Set
    char inputSet[50][50];
    int inputSetSize = 0;
    for (int i = 0; i < inputWordsList.count; i++) {
        bool exists = false;
        for (int j = 0; j < inputSetSize; j++) {
            if (strcmp(inputSet[j], inputWordsList.words[i]) == 0) { exists = true; break; }
        }
        if (!exists) strcpy(inputSet[inputSetSize++], inputWordsList.words[i]);
    }
    
    float bestScore = 0.0;
    int bestIssueId = -1;
    
    for (int k = 0; k < totalIssues; k++) {
        WordList existWordsList = normalize(existingIssues[k].title);
        
        char existSet[50][50];
        int existSetSize = 0;
        for (int i = 0; i < existWordsList.count; i++) {
            bool exists = false;
            for (int j = 0; j < existSetSize; j++) {
                if (strcmp(existSet[j], existWordsList.words[i]) == 0) { exists = true; break; }
            }
            if (!exists) strcpy(existSet[existSetSize++], existWordsList.words[i]);
        }
        
        int intersectionCount = 0;
        for (int i = 0; i < inputSetSize; i++) {
            for (int j = 0; j < existSetSize; j++) {
                if (strcmp(inputSet[i], existSet[j]) == 0) {
                    intersectionCount++;
                    break;
                }
            }
        }
        
        int unionCount = inputSetSize + existSetSize - intersectionCount;
        float score = unionCount == 0 ? 0 : (float)intersectionCount / unionCount;
        
        if (score > bestScore) {
            bestScore = score;
            bestIssueId = existingIssues[k].issue_id;
        }
    }
    
    bool similar = bestScore >= 0.6;
    printf("Similarity Check for: '%s'\n", inputTitle);
    printf("- Best Match Score: %.2f%%\n", bestScore * 100);
    if (similar) {
        printf("- Found high similarity with Issue #%d. Suggesting vote instead of new report.\n\n", bestIssueId);
    } else {
        printf("- No duplicates found (score < 60%%).\n\n");
    }
}

// Mock Database Connection for Presentation Purposes
void fetchIssuesFromDatabase(IssueDict* db, int* count) {
    printf("[DB] Connecting to PostgreSQL database...\n");
    printf("[DB] Executing Query: SELECT issue_id, title FROM Issues;\n");
    
    db[0].issue_id = 1; strcpy(db[0].title, "Broken streetlight on main");
    db[1].issue_id = 2; strcpy(db[1].title, "Massive pothole near avenue");
    db[2].issue_id = 3; strcpy(db[2].title, "Water pipe leak");
    *count = 3;
    
    printf("[DB] Fetched %d records successfully.\n\n", *count);
}

int main() {
    TrieNode* root = newTrieNode();
    
    IssueDict db[100];
    int totalIssues = 0;
    
    // Simulate fetching dynamic data from backend
    fetchIssuesFromDatabase(db, &totalIssues);
    
    for (int i = 0; i < totalIssues; i++) {
        insert(root, db[i].title, db[i].issue_id);
    }
    
    // Testing Exact Search
    int exactMatch = search(root, "broken streetlight on main");
    printf("Exact match search for 'broken streetlight on main': Issue #%d\n\n", exactMatch);
    
    // Testing Similarity (Jaccard > 0.6)
    checkSimilarity("Streetlight is broken on main", db, totalIssues);
    checkSimilarity("Pothole on avenue", db, totalIssues); // Too few common words, low score
    
    return 0;
}
