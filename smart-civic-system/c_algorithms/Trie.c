#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define ALPHABET_SIZE 26

// Trie Node for fast text/dictionary mapping
typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    int isEndOfWord;
    int wordCount; // For frequency tracking
} TrieNode;

// Create a new Trie node
TrieNode *getNode(void) {
    TrieNode *pNode = NULL;
    pNode = (TrieNode *)malloc(sizeof(TrieNode));

    if (pNode) {
        int i;
        pNode->isEndOfWord = 0;
        pNode->wordCount = 0;
        for (i = 0; i < ALPHABET_SIZE; i++)
            pNode->children[i] = NULL;
    }
    return pNode;
}

// Helper to get array zero-indexed mapping
int getIndex(char c) {
    if (isalpha(c)) {
        return tolower(c) - 'a';
    }
    return -1; // ignore non-alphabet
}

// Insert a word into the Trie
void insert(TrieNode *root, const char *key) {
    int length = strlen(key);
    int index;
    TrieNode *pCrawl = root;

    for (int level = 0; level < length; level++) {
        index = getIndex(key[level]);
        if (index == -1) continue; // skip spaces/punctuation
        
        if (!pCrawl->children[index]) {
            pCrawl->children[index] = getNode();
        }
        pCrawl = pCrawl->children[index];
    }

    pCrawl->isEndOfWord = 1;
    pCrawl->wordCount++;
}

// Search for a word in the Trie
int search(TrieNode *root, const char *key) {
    int length = strlen(key);
    int index;
    TrieNode *pCrawl = root;

    for (int level = 0; level < length; level++) {
        index = getIndex(key[level]);
        if (index == -1) continue;
        
        if (!pCrawl->children[index])
            return 0; // Not found

        pCrawl = pCrawl->children[index];
    }

    // Return the frequency of the word found
    return (pCrawl != NULL && pCrawl->isEndOfWord) ? pCrawl->wordCount : 0;
}

// Simple text duplication check logic
void checkTextSimilarity(TrieNode* systemTrie, const char* newReport) {
    // Break the new report into words and check if they exist in the DB
    char buffer[256];
    strcpy(buffer, newReport);
    char* word = strtok(buffer, " ");
    int matchedWords = 0;
    int totalWords = 0;

    while (word != NULL) {
        totalWords++;
        if (search(systemTrie, word) > 0) {
            matchedWords++;
        }
        word = strtok(NULL, " ");
    }

    float matchPercentage = (totalWords > 0) ? ((float)matchedWords / totalWords) * 100 : 0;
    
    printf("Duplicate Analysis for: '%s'\n", newReport);
    printf("- Matched existing dictionary words: %d/%d (%.1f%%)\n", 
            matchedWords, totalWords, matchPercentage);
            
    if (matchPercentage > 50.0) {
        printf("- WARNING: High probability of duplicate issue!\n\n");
    } else {
        printf("- Valid issue. No duplicates found.\n\n");
    }
}

int main() {
    // Simulated system dictionary (previously reported issue tokens)
    char existingIssues[][10] = {"pothole", "broken", "street", "light", "water", "pipe", "leak"};
    
    TrieNode *root = getNode();
    int i;
    int n = sizeof(existingIssues)/sizeof(existingIssues[0]);

    // Insert existing words to the Trie
    for (i = 0; i < n; i++)
        insert(root, existingIssues[i]);

    checkTextSimilarity(root, "massive pothole on street");
    checkTextSimilarity(root, "dangerous loose wire on sidewalk");

    return 0;
}
