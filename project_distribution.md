# Project Presentation & Work Distribution

This document outlines the breakdown of the **Smart Civic Issue Management System** for a 5-member group presentation. 

Each member is assigned **exactly one major Advanced Data Structure (ADS)** (AVL Tree, QuadTree, Trie, Priority Queue, R-Tree) as their core focus, along with smaller supporting algorithms and features to ensure everyone has a highly technical and equal part to present.

---

## 👤 Member 1: Core System Flow & History Tracking
**Major Algorithm:** **AVL Tree**
**Supporting Concepts:** Basic Auth Flow

### What You Will Explain:
1. **Introduction**: Introduce the Smart Civic System, the problem it solves, and the basic user journey (Registration/Login).
2. **User Dashboard & History**: Explain how citizens track their own past reports in the dashboard.
3. **The Algorithm (AVL Tree)**: 
   - *In Simple Words*: Instead of using a slow, linear array to show a user their past reports, we store their history in an **AVL Tree** (a self-balancing binary search tree). This ensures that no matter how many issues a citizen reports, their history is always perfectly balanced and can be fetched, inserted, and sorted chronologically in extremely fast time—specifically \(O(\log n)\).

---

## 👤 Member 2: Issue Reporting & Spatial Checking
**Major Algorithm:** **QuadTree**

### What You Will Explain:
1. **Reporting Mechanism**: Walk through how a user drops a pin on the map and fills out the issue report form (title, severity, category).
2. **The Algorithm (QuadTree)**: Explain the *first* half of the Smart Duplicate Detection feature.
   - *In Simple Words*: When a user drops a pin, the system doesn't search the entire database to find nearby issues. Instead, it uses a **QuadTree**, which divides the city map into smaller, manageable 2D sections. This allows the system to instantly and efficiently query only the issues located within a strict 100-meter radius of the new report.

---

## 👤 Member 3: Text-Based Duplicate Prevention & Alerts
**Major Algorithm:** **Trie (Prefix Tree)**
**Supporting Algorithm:** **FIFO Queue**

### What You Will Explain:
1. **Text Duplicate Check**: Explain the *second* half of the Smart Duplicate Detection feature.
2. **The Algorithm (Trie)**:
   - *In Simple Words*: Once the QuadTree (from Member 2) finds issues in the same area, we use a **Trie** to analyze the text titles. If a user types "Broken Streetlight" and an existing issue is "Streetlight is broken", the Trie efficiently checks for string similarities. If it's a match, it stops the user from spamming a duplicate and asks them to upvote the existing one instead.
3. **Real-Time Alerts (FIFO Queue)**: Briefly explain that when an issue is successfully reported, a **FIFO Queue** is used to broadcast real-time notifications to all users in the correct order.

---

## 👤 Member 4: Community Feeds & Dynamic Ranking
**Major Algorithm:** **Priority Queue (Max-Heap)**
**Supporting Algorithm:** **HashMap** (for Dashboard Stats)

### What You Will Explain:
1. **Community Feed & Voting**: Explain how citizens view the public issue feed and vote on problems they care about.
2. **The Algorithm (Priority Queue)**:
   - *In Simple Words*: The public feed is not just a chronological list. To decide which issue appears at the very top, we use a **Priority Queue** built on a Max-Heap. Every issue gets a dynamic "Priority Score" based on its assigned severity and community upvotes. The heap automatically bubbles the most critical, highly-voted issues to the top instantly.
3. **Analytics (HashMap)**: Explain that the dashboard pie charts (e.g., issues by category) are generated using a **HashMap** to quickly aggregate and count occurrences in \(O(1)\) time.

---

## 👤 Member 5: Geographical Heatmaps & Admin Workflow
**Major Algorithm:** **R-Tree**
**Supporting Algorithm:** **HashMap** (for Escalation Deadlines)

### What You Will Explain:
1. **Admin Workflow & Escalation**: Explain how admins resolve issues (requiring image proof) and how overdue issues are escalated using a **HashMap** to track exact SLA deadlines (e.g., 7 days for Critical, 35 days for Low).
2. **City Heatmap**: Show the visual map used by city planners to see problem hotspots.
3. **The Algorithm (R-Tree)**:
   - *In Simple Words*: To render the dynamic heatmap without crashing the browser, the system uses an **R-Tree**. While a QuadTree is good for exact points, an R-Tree is designed to handle spatial bounding boxes. It efficiently clusters massive amounts of nearby issues together, allowing the system to quickly draw density hotspots representing areas that need the most administrative attention.
