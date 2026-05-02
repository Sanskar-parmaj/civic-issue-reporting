#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Definition for an Issue
typedef struct {
    int issue_id;
    char title[100];
    int created_at; // Timestamp
} Issue;

// AVL Tree Node
typedef struct AVLNode {
    Issue data;
    struct AVLNode *left;
    struct AVLNode *right;
    int height;
} AVLNode;

// Get the height of the tree
int height(AVLNode *N) {
    if (N == NULL)
        return 0;
    return N->height;
}

// Get maximum of two integers
int max(int a, int b) {
    return (a > b) ? a : b;
}

// Helper function to allocate a new node
AVLNode* newNode(Issue data) {
    AVLNode* node = (AVLNode*)malloc(sizeof(AVLNode));
    node->data = data;
    node->left = NULL;
    node->right = NULL;
    node->height = 1; // new node is initially added at leaf
    return node;
}

// Right rotate
AVLNode *rightRotate(AVLNode *y) {
    AVLNode *x = y->left;
    AVLNode *T2 = x->right;

    // Perform rotation
    x->right = y;
    y->left = T2;

    // Update heights
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;

    // Return new root
    return x;
}

// Left rotate
AVLNode *leftRotate(AVLNode *x) {
    AVLNode *y = x->right;
    AVLNode *T2 = y->left;

    // Perform rotation
    y->left = x;
    x->right = T2;

    // Update heights
    x->height = max(height(x->left), height(x->right)) + 1;
    y->height = max(height(y->left), height(y->right)) + 1;

    // Return new root
    return y;
}

// Get Balance factor of node N
int getBalance(AVLNode *N) {
    if (N == NULL)
        return 0;
    return height(N->left) - height(N->right);
}

// Insert an issue into AVL Tree (Sorted by created_at DESC)
AVLNode* insert(AVLNode* node, Issue data) {
    if (node == NULL)
        return newNode(data);

    if (data.created_at > node->data.created_at)
        node->left = insert(node->left, data);
    else if (data.created_at < node->data.created_at)
        node->right = insert(node->right, data);
    else // Equal keys are not allowed in BST
        return node;

    // Update height of this ancestor node
    node->height = 1 + max(height(node->left), height(node->right));

    // Get the balance factor of this ancestor node to check whether
    // this node became unbalanced
    int balance = getBalance(node);

    // If this node becomes unbalanced, then there are 4 cases
    // Left Left Case
    if (balance > 1 && data.created_at > node->left->data.created_at)
        return rightRotate(node);

    // Right Right Case
    if (balance < -1 && data.created_at < node->right->data.created_at)
        return leftRotate(node);

    // Left Right Case
    if (balance > 1 && data.created_at < node->left->data.created_at) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }

    // Right Left Case
    if (balance < -1 && data.created_at > node->right->data.created_at) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }

    return node;
}

// In-order traversal to print issues (Will print in descending order of time)
void inOrder(AVLNode *root) {
    if (root != NULL) {
        inOrder(root->left);
        printf("Issue %d: %s (Time: %d)\n", root->data.issue_id, root->data.title, root->data.created_at);
        inOrder(root->right);
    }
}

// Mock Database Connection for Presentation Purposes
void fetchIssuesFromDatabase(Issue* db, int* count) {
    printf("[DB] Connecting to PostgreSQL database...\n");
    printf("[DB] Executing Query: SELECT issue_id, title, created_at FROM Issues ORDER BY created_at DESC;\n");
    
    db[0] = (Issue){1, "Pothole", 1600000000};
    db[1] = (Issue){2, "Broken Light", 1600000500};
    db[2] = (Issue){3, "Water Leak", 1600000200};
    *count = 3;
    
    printf("[DB] Fetched %d records successfully.\n\n", *count);
}

int main() {
    AVLNode *root = NULL;

    Issue db[100];
    int totalIssues = 0;
    
    // Simulate fetching dynamic data from backend
    fetchIssuesFromDatabase(db, &totalIssues);

    // Inserting issues
    for (int i = 0; i < totalIssues; i++) {
        root = insert(root, db[i]);
    }

    printf("AVL Tree (Sorted by exact time):\n");
    inOrder(root);

    return 0;
}
