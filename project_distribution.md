# 🏙️ Smart Civic Issue Management System
## Project Presentation & Work Distribution

> **Group Size:** 5 Members | **Course:** Advanced Data Structures
> **Goal:** Each member owns one major ADS, explains its real-world integration in the project, and presents the matching C implementation.

---

## 📌 How to Use This Document

- Read **your section fully** before the presentation.
- Know **every file listed** — you must be able to open and explain those files if asked.
- Know your **Algorithm deeply** — the C file is your theoretical proof, the JS file is your real-world application.
- The "What to Say" points are **talking scripts** — use them as a guide, not a script.

---

## ─────────────────────────────────────────
## 👤 Member 1 — System Introduction & User History (AVL Tree)
## ─────────────────────────────────────────

### 🎯 Major Algorithm: AVL Tree (Self-Balancing BST)
### 🔧 Supporting Concept: Authentication Flow

---

### 📁 Files You Own & Must Explain

| Area | File Path | What It Does |
|------|-----------|--------------|
| **C Algorithm** | `c_algorithms/AVLTree.c` | The theoretical AVL Tree implementation in C — insert, rotate, balance |
| **JS Algorithm** | `backend/algorithms/AVLTree.js` | The same AVL logic running live in the backend for user history |
| **Auth Logic** | `backend/controllers/authController.js` | Handles Register & Login, password hashing with bcryptjs, JWT token generation |
| **Auth Routes** | `backend/routes/authRoutes.js` | API endpoints: `POST /api/auth/register`, `POST /api/auth/login` |
| **JWT Guard** | `backend/middleware/authMiddleware.js` | Protects private routes — verifies JWT token on every request |
| **DB Connection** | `backend/config/db.js` | PostgreSQL connection pool setup |
| **Login Page** | `frontend/src/pages/Login.jsx` | The Login UI — sends credentials to backend |
| **Register Page** | `frontend/src/pages/Register.jsx` | The Register UI — creates a new citizen account |
| **Auth Context** | `frontend/src/context/AuthContext.jsx` | Global React state — stores logged-in user & token across all pages |
| **User Dashboard** | `frontend/src/pages/UserDashboard.jsx` | Displays the citizen's own reported issues, sorted by date using AVL Tree |
| **DB Schema** | `database/schema.sql` | `users` table definition — all fields for citizen & admin accounts |

---

### 🗣️ What to Say (Presentation Flow)

#### **Step 1 — Introduce the Project** *(~1 min)*
> "Our project is the Smart Civic Issue Management System. Citizens can report real-world problems like broken roads or faulty streetlights. The government admin can then track, manage, and resolve them with full accountability. Our system is not a basic CRUD app — every core feature is powered by an Advanced Data Structure."

#### **Step 2 — Show Registration & Login** *(open Login.jsx & Register.jsx)*
> "A citizen first registers via `Register.jsx`. The form data is sent to `POST /api/auth/register` in `authRoutes.js`. Inside `authController.js`, the password is hashed using `bcryptjs` and stored in the `users` table (defined in `schema.sql`). On login, we verify the password and issue a **JSON Web Token (JWT)**. This token is stored in `AuthContext.jsx` and attached to every future API request. `authMiddleware.js` validates this token to protect private routes."

#### **Step 3 — Show the User Dashboard** *(open UserDashboard.jsx)*
> "Once logged in, the citizen lands on their dashboard. They can see all issues they have personally reported."

#### **Step 4 — Explain the AVL Tree** *(open AVLTree.js & AVLTree.c)*
> "Here's where the Advanced Data Structure comes in. A normal database query might return issues in any order. Instead, we insert each issue record into an **AVL Tree** — a self-balancing Binary Search Tree. The tree keeps itself balanced after every insert using left and right rotations. The key insight is: because it is always balanced, the height never exceeds O(log n). This means fetching, inserting, or sorting a user's entire history takes O(log n) time, even for a citizen who has reported 10,000 issues.  
> Here in `AVLTree.c` you can see the `rotateLeft`, `rotateRight`, and `getBalance` functions — these are the core mechanics. The JavaScript version in `AVLTree.js` implements the exact same logic in the backend."

---

## ─────────────────────────────────────────
## 👤 Member 2 — Issue Reporting & Spatial Duplicate Check (QuadTree)
## ─────────────────────────────────────────

### 🎯 Major Algorithm: QuadTree (2D Spatial Indexing)
### 🔧 Supporting Concept: Interactive Map & Issue Reporting Form

---

### 📁 Files You Own & Must Explain

| Area | File Path | What It Does |
|------|-----------|--------------|
| **C Algorithm** | `c_algorithms/QuadTree.c` | Theoretical QuadTree in C — spatial subdivision, point insert, radius query |
| **JS Algorithm** | `backend/algorithms/QuadTree.js` | Live QuadTree running in backend for duplicate spatial checking |
| **Issue Controller** | `backend/controllers/issueController.js` | Core backend logic — `createIssue()` calls QuadTree + Trie for duplicate detection |
| **Issue Routes** | `backend/routes/issueRoutes.js` | API endpoints: `POST /api/issues`, `GET /api/issues`, etc. |
| **Report Page** | `frontend/src/pages/ReportIssue.jsx` | The UI where a citizen picks location on map, fills category/severity/title |
| **Map Component** | `frontend/src/components/MapComponent.jsx` | Interactive Leaflet map — allows pin dropping to select GPS coordinates |
| **DB Schema** | `database/schema.sql` | `issues` table — stores lat/lng, title, severity, category, status, reporter |

---

### 🗣️ What to Say (Presentation Flow)

#### **Step 1 — Show the Report Form** *(open ReportIssue.jsx)*
> "When a citizen wants to report a broken road, they go to `ReportIssue.jsx`. They see an interactive map rendered by `MapComponent.jsx` using the Leaflet library. They drop a pin on the exact location — this gives us the GPS coordinates (latitude & longitude). They also fill in a title, select the category (Road, Water, etc.) and severity (Critical, High, Medium, Low)."

#### **Step 2 — Show the Submission Flow** *(open issueController.js)*
> "When they click Submit, the form sends a `POST /api/issues` request to `issueRoutes.js`, which calls `createIssue()` inside `issueController.js`. Here the smart duplicate detection begins — and it has two stages. My part is Stage 1: the **Spatial Check**."

#### **Step 3 — Explain the QuadTree** *(open QuadTree.js & QuadTree.c)*
> "Instead of querying every single issue in the database to find nearby reports, we use a **QuadTree**. A QuadTree works by recursively dividing a 2D space — the city map — into four quadrants: North-West, North-East, South-West, South-East. Each quadrant subdivides again when it gets too many points. When a new report comes in at coordinates (lat, lng), the QuadTree instantly narrows down the search to only the quadrant that contains that location, then checks only those points for proximity within a 100-meter radius.  
> In `QuadTree.c`, you can see the `subdivide()` function which handles the splitting, and `queryRadius()` which performs the spatial search. The JavaScript `QuadTree.js` runs this exact logic live in `issueController.js`. Without QuadTree, this would be an O(n) scan of the entire database. With QuadTree, it's effectively O(log n)."

#### **Step 4 — Show the Outcome**
> "If QuadTree finds no issues nearby, the report proceeds. If it finds nearby issues, it hands the candidate issues off to Member 3's Trie for a text-similarity check."

---

## ─────────────────────────────────────────
## 👤 Member 3 — Text Duplicate Prevention & Real-Time Notifications (Trie + Queue)
## ─────────────────────────────────────────

### 🎯 Major Algorithm: Trie (Prefix Tree)
### 🔧 Supporting Algorithm: FIFO Queue (Notification Dispatch)

---

### 📁 Files You Own & Must Explain

| Area | File Path | What It Does |
|------|-----------|--------------|
| **C Algorithm (Trie)** | `c_algorithms/Trie.c` | Theoretical Trie in C — insert, prefix search, similarity matching |
| **JS Algorithm (Trie)** | `backend/algorithms/Trie.js` | Live Trie checking title similarity in the backend |
| **C Algorithm (Queue)** | `c_algorithms/Queue.c` | Theoretical FIFO Queue in C — enqueue, dequeue, peek |
| **JS Algorithm (Queue)** | `backend/algorithms/Queue.js` | FIFO Queue used for ordered notification dispatch |
| **Issue Controller** | `backend/controllers/issueController.js` | `createIssue()` — Stage 2 of duplicate check (Trie runs here after QuadTree) |
| **Notification Controller** | `backend/controllers/notificationController.js` | Creates & retrieves notifications from the DB |
| **Notification Routes** | `backend/routes/notificationRoutes.js` | API endpoints: `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| **Notification Bell** | `frontend/src/components/NotificationBell.jsx` | The bell icon in the Navbar that shows the unread count badge |
| **Notification Dropdown** | `frontend/src/components/NotificationDropdown.jsx` | The popup list of all notifications — click to go to issue |
| **DB Schema** | `database/schema.sql` | `notifications` table definition |

---

### 🗣️ What to Say (Presentation Flow)

#### **Step 1 — Continue from Member 2's Handoff**
> "Member 2 showed how the QuadTree finds spatially nearby issues. Now, if nearby issues ARE found, Stage 2 of duplicate detection kicks in — the **Trie check**."

#### **Step 2 — Explain the Trie** *(open Trie.js & Trie.c)*
> "A **Trie** is a tree-shaped data structure where every path from root to leaf spells out a word. Each character is a node. We insert the titles of all nearby issues found by the QuadTree into a Trie. Then we search the Trie using prefix tokens from the NEW report's title. For example, if 'Broken Streetlight' already exists and a user types 'Streetlight is broken', the Trie detects shared word roots and flags it as a likely duplicate. The user is then prompted: 'This issue already exists nearby — please upvote it instead.' This prevents database spam.  
> In `Trie.c`, you can see the `TrieNode` struct, the `insert()` function, and the `search()` function. The JavaScript `Trie.js` mirrors this in the live backend logic inside `issueController.js`."

#### **Step 3 — Show the Queue & Notifications** *(open Queue.js, NotificationBell.jsx, NotificationDropdown.jsx)*
> "Once a report passes both checks and is saved to the database, the system must notify all users. Here's where the **FIFO Queue** comes in. Every notification event — 'New Issue Reported', 'Issue Resolved' — is pushed into a Queue. The dispatcher processes them in strict First-In-First-Out order, ensuring no notification is skipped and they're delivered in sequence.  
> In the frontend, `NotificationBell.jsx` shows the bell icon. When clicked, `NotificationDropdown.jsx` renders the list. Each notification is fetched from `notificationController.js` via `notificationRoutes.js`. Clicking a notification navigates directly to that issue's detail page."

---

## ─────────────────────────────────────────
## 👤 Member 4 — Community Feed, Voting & Analytics (Priority Queue + HashMap)
## ─────────────────────────────────────────

### 🎯 Major Algorithm: Priority Queue (Max-Heap)
### 🔧 Supporting Algorithm: HashMap (Dashboard Analytics)

---

### 📁 Files You Own & Must Explain

| Area | File Path | What It Does |
|------|-----------|--------------|
| **C Algorithm (PQ)** | `c_algorithms/PriorityQueue.c` | Theoretical Max-Heap in C — insert, heapify-up, heapify-down, extract-max |
| **JS Algorithm (PQ)** | `backend/algorithms/PriorityQueue.js` | Live Priority Queue ranking issues by score in the backend |
| **C Algorithm (HM)** | `c_algorithms/HashMap.c` | Theoretical HashMap in C — hash function, insert, get, collision chaining |
| **JS Algorithm (HM)** | `backend/algorithms/HashMap.js` | Live HashMap for O(1) analytics aggregation |
| **Issue Controller** | `backend/controllers/issueController.js` | `getIssues()` — sorts issues using Priority Queue before returning to frontend |
| **Vote Controller** | `backend/controllers/voteController.js` | Handles upvote logic — increments vote count, triggers priority recalculation |
| **Vote Routes** | `backend/routes/voteRoutes.js` | API endpoints: `POST /api/votes/:issueId` |
| **Issue Card** | `frontend/src/components/IssueCard.jsx` | Renders a single issue card — shows priority score, votes, upvote button |
| **View Issues** | `frontend/src/pages/ViewIssues.jsx` | The main community feed — displays all issues sorted by Priority Queue output |
| **Status Pie Chart** | `frontend/src/components/StatusPieChart.jsx` | Dashboard pie chart showing issue distribution by status/category via HashMap |
| **User Dashboard** | `frontend/src/pages/UserDashboard.jsx` | Shows the pie chart analytics to the citizen |
| **Home Page** | `frontend/src/pages/Home.jsx` | Landing page linking to the feed, map, and reporting |

---

### 🗣️ What to Say (Presentation Flow)

#### **Step 1 — Show the Community Feed** *(open ViewIssues.jsx, IssueCard.jsx)*
> "Once issues are reported and pass duplicate checks, they appear in the community feed at `ViewIssues.jsx`. Each issue is rendered as a card by `IssueCard.jsx`. Citizens can see the title, severity, location, and upvote count. They can click the upvote button to signal that an issue matters to them."

#### **Step 2 — Explain the Priority Queue** *(open PriorityQueue.js & PriorityQueue.c)*
> "The feed is NOT just a chronological list. We want the most critical, most-voted issues at the top. To achieve this, every issue gets a **Priority Score**: `score = (severity_weight × 10) + vote_count`. Severity weights are: Critical=4, High=3, Medium=2, Low=1. These scores are inserted into a **Priority Queue** built on a **Max-Heap** data structure.  
> A Max-Heap is a complete binary tree where the parent is always greater than its children. The root is always the maximum element. Inserting a new issue takes O(log n) — it 'bubbles up' to its correct position. Extracting the top issue also takes O(log n). This is how `getIssues()` in `issueController.js` always returns issues in perfect priority order.  
> In `PriorityQueue.c`, you'll see `heapifyUp()` and `heapifyDown()` functions. The JavaScript `PriorityQueue.js` does the same."

#### **Step 3 — Explain the HashMap for Analytics** *(open HashMap.js & StatusPieChart.jsx)*
> "On the User Dashboard, there's a pie chart. This chart shows the distribution of issues — for example, 40% Reported, 35% In-Progress, 25% Resolved. To generate this, we iterate over all issues and use a **HashMap** to count occurrences: `map[status]++`. Because HashMap lookups and inserts are O(1), we can aggregate thousands of issues instantly. The result feeds into `StatusPieChart.jsx` which renders the visual chart."

---

## ─────────────────────────────────────────
## 👤 Member 5 — Geographical Heatmap & Admin Escalation Workflow (R-Tree + HashMap)
## ─────────────────────────────────────────

### 🎯 Major Algorithm: R-Tree (Bounding Box Spatial Indexing)
### 🔧 Supporting Algorithm: HashMap (SLA Escalation Deadlines)

---

### 📁 Files You Own & Must Explain

| Area | File Path | What It Does |
|------|-----------|--------------|
| **C Algorithm (RT)** | `c_algorithms/RTree.c` | Theoretical R-Tree in C — MBR (Minimum Bounding Rectangle), insert, query |
| **JS Algorithm (RT)** | `backend/algorithms/RTree.js` | Live R-Tree clustering issues for heatmap density rendering |
| **C Algorithm (HM)** | `c_algorithms/HashMap.c` | Theoretical HashMap in C (shared with Member 4's explanation of O(1) lookup) |
| **JS Algorithm (HM)** | `backend/algorithms/HashMap.js` | Live HashMap storing SLA deadlines per severity level |
| **Escalation Service** | `backend/services/escalationService.js` | Background cron job — runs every hour, checks deadlines via HashMap, flags overdue issues |
| **Issue Controller** | `backend/controllers/issueController.js` | `updateIssueStatus()` — enforces workflow (Reported→In-Progress→Resolved), requires image proof |
| **Issue Routes** | `backend/routes/issueRoutes.js` | `PATCH /api/issues/:id/status` — admin-only status update endpoint |
| **Map Page** | `frontend/src/pages/MapPage.jsx` | The heatmap page — fetches all issues and renders density clusters on the map |
| **Map Component** | `frontend/src/components/MapComponent.jsx` | Leaflet map component — renders R-Tree cluster output as heatmap circles |
| **Admin Dashboard** | `frontend/src/pages/AdminDashboard.jsx` | Admin panel — shows all issues, allows status progression, requires proof image |
| **DB Schema** | `database/schema.sql` | `issues` table — `status`, `proof_image`, `created_at`, `escalated` fields |

---

### 🗣️ What to Say (Presentation Flow)

#### **Step 1 — Show the Heatmap** *(open MapPage.jsx, MapComponent.jsx)*
> "The `MapPage.jsx` is a real-time heatmap of all civic issues in the city. It fetches all issues from the database and passes them to `MapComponent.jsx`. The map renders density circles — red for high-density problem areas, yellow for medium, green for sparse. City planners use this to prioritize which neighborhoods need immediate attention."

#### **Step 2 — Explain the R-Tree** *(open RTree.js & RTree.c)*
> "Rendering thousands of individual issue pins would crash the browser. Instead, we cluster them using an **R-Tree**. An R-Tree is different from a QuadTree — instead of splitting fixed grid cells, an R-Tree groups nearby points into **Minimum Bounding Rectangles (MBRs)**. Overlapping rectangles can exist, and they're organized in a tree hierarchy. When querying 'show me issues in this viewport', the R-Tree quickly prunes entire branches of the tree whose MBRs don't overlap the query area. This makes heatmap generation extremely fast even with 10,000 issue points.  
> In `RTree.c`, you'll see the `MBR` struct, the `insertNode()` function, and the `queryOverlap()` function. The JavaScript `RTree.js` uses this to cluster and return density data to the frontend."

#### **Step 3 — Explain Admin Escalation** *(open escalationService.js, AdminDashboard.jsx)*
> "On the admin side, `AdminDashboard.jsx` shows all issues. Admins can update status, but the system enforces a strict workflow: `Reported → In-Progress → Resolved`. To mark an issue Resolved, the admin MUST upload a proof-of-resolution image — this is enforced in `issueController.js`. There's no way to skip this step.  
> But what if an admin ignores an issue? That's where `escalationService.js` comes in. This is a **background cron job** that runs automatically every hour. It uses a **HashMap** to store SLA deadlines: `{ Critical: 7 days, High: 14 days, Medium: 21 days, Low: 35 days }`. For every unresolved issue, it checks `(now - created_at) > deadline`. If overdue, it marks the issue as `escalated = true` and dispatches an alert to all admins. This HashMap lookup is O(1) — it doesn't matter if there are 10 or 10,000 issue types."

---

## 🗂️ Complete File Reference Map

```
smart-civic-system/
│
├── c_algorithms/                        ← C Language ADS Implementations (Theoretical Proof)
│   ├── AVLTree.c        → Member 1
│   ├── QuadTree.c       → Member 2
│   ├── Trie.c           → Member 3
│   ├── Queue.c          → Member 3
│   ├── PriorityQueue.c  → Member 4
│   ├── HashMap.c        → Member 4 & 5
│   ├── RTree.c          → Member 5
│   ├── LinkedList.c     → (Supporting — any member can reference)
│   └── Stack.c          → (Supporting — any member can reference)
│
├── backend/
│   ├── server.js                        ← Entry point — starts Express + DB + escalation job
│   ├── config/
│   │   └── db.js                        → Member 1
│   ├── middleware/
│   │   └── authMiddleware.js            → Member 1
│   ├── algorithms/                      ← JS Versions (Live Application)
│   │   ├── AVLTree.js       → Member 1
│   │   ├── QuadTree.js      → Member 2
│   │   ├── Trie.js          → Member 3
│   │   ├── Queue.js         → Member 3
│   │   ├── PriorityQueue.js → Member 4
│   │   ├── HashMap.js       → Member 4 & 5
│   │   ├── RTree.js         → Member 5
│   │   ├── LinkedList.js    → (Supporting)
│   │   └── Stack.js         → (Supporting)
│   ├── controllers/
│   │   ├── authController.js            → Member 1
│   │   ├── issueController.js           → Members 2, 3, 4, 5 (shared — each explains their section)
│   │   ├── notificationController.js   → Member 3
│   │   ├── voteController.js            → Member 4
│   │   └── commentController.js        → (General — anyone can mention)
│   ├── routes/
│   │   ├── authRoutes.js               → Member 1
│   │   ├── issueRoutes.js              → Members 2 & 5
│   │   ├── notificationRoutes.js       → Member 3
│   │   ├── voteRoutes.js               → Member 4
│   │   └── commentRoutes.js            → (General)
│   └── services/
│       └── escalationService.js        → Member 5
│
├── database/
│   └── schema.sql                       → Members 1, 2, 3, 5 (each explains their table)
│
└── frontend/src/
    ├── App.jsx                          ← React Router setup — all members can reference
    ├── main.jsx                         ← React entry point
    ├── context/
    │   └── AuthContext.jsx              → Member 1
    ├── services/
    │   └── api.js                       ← Axios instance — any member can reference
    ├── components/
    │   ├── Navbar.jsx                   → Member 1 (general UI)
    │   ├── NotificationBell.jsx         → Member 3
    │   ├── NotificationDropdown.jsx     → Member 3
    │   ├── IssueCard.jsx                → Member 4
    │   ├── MapComponent.jsx             → Members 2 & 5
    │   ├── StatusPieChart.jsx           → Member 4
    │   ├── RadiusSelector.jsx           → Member 2
    │   └── CommentSection.jsx           → (General)
    └── pages/
        ├── Home.jsx                     → Member 4
        ├── Login.jsx                    → Member 1
        ├── Register.jsx                 → Member 1
        ├── ReportIssue.jsx              → Member 2
        ├── ViewIssues.jsx               → Member 4
        ├── IssueDetail.jsx              → (General — all members can reference)
        ├── UserDashboard.jsx            → Members 1 & 4
        ├── MapPage.jsx                  → Member 5
        └── AdminDashboard.jsx           → Member 5
```

---

> **Tip:** Every member should also be able to briefly explain `server.js` (the entry point), `App.jsx` (routing), and `api.js` (Axios setup) as general system knowledge, even if they don't own those files.
