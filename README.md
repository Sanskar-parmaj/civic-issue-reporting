# Smart Civic Issue Management System

A full-stack, data-structure-driven web application designed to revolutionize how citizens report, track, and resolve local civic issues. The system goes beyond basic CRUD operations by leveraging advanced algorithms and custom-built data structures to provide real-time geo-alerts, dynamic heatmaps, automated escalations, and smart duplicate detection.

---

## 🔄 Project Flow (How It Works)

The Smart Civic System is designed to create a seamless, transparent loop between citizens and city administrators. Here is the typical lifecycle of a civic issue on the platform:

1. **Citizen Authentication**: A user registers or logs into the platform as a Citizen.
2. **Issue Discovery**: The citizen can view the **Dynamic Heatmap** to see problem hotspots in their city or scroll through the community **Priority Feed** to see the most urgent issues.
3. **Smart Reporting**: The citizen reports a new issue (e.g., a broken streetlight). 
   - *Duplicate Check*: Before submission, the system runs a spatial and text-based algorithm to ensure the exact same issue hasn't already been reported nearby.
4. **Global Notification**: Once successfully submitted, the system broadcasts a real-time geo-alert to all other users on the platform, notifying them of the new issue.
5. **Community Engagement**: Other citizens can click the notification to view the issue, upvote it (increasing its priority in the feed), and leave comments.
6. **Administrative Tracking & Escalation**: System Administrators monitor the dashboard.
   - *Smart Escalation*: If the admin does not resolve the issue within its designated SLA deadline (e.g., 7 days for Critical, 35 days for Low), the system automatically flags it as "Escalated" and alerts all admins.
7. **Accountable Resolution**: An admin updates the status to `In-Progress`, and eventually `Resolved`. To mark it as resolved, they are strictly required to upload a **Proof-of-Resolution Image**.
8. **Final Alert**: Upon resolution, the system sends a final broadcast notification to all citizens, closing the loop and maintaining complete transparency.

---

## 🚀 Key Features

### 1. Smart Duplicate Issue Detection
When a citizen attempts to report a new issue, the system ensures the database isn't cluttered with identical reports.
* **Spatial Check**: Uses a **QuadTree** to find existing issues within a 100m radius of the reported location.
* **Text Similarity Check**: If nearby issues exist, a **Trie** evaluates the title strings to check for textual similarities. If a match is found, the user is prompted to vote on the existing issue instead of creating a new one.

### 2. Automated Smart Escalation Workflow
Issues shouldn't stay unresolved forever. A background job continuously evaluates unresolved issues and escalates them to administrators if they exceed their designated service-level agreement (SLA) deadlines.
The deadlines are tracked efficiently using a **HashMap**:
* **Critical Severity**: 1 Week (7 days)
* **High Severity**: 2 Weeks (14 days)
* **Medium Severity**: 3 Weeks (21 days)
* **Low Severity**: 5 Weeks (35 days)
*When an issue escalates, the system automatically dispatches an alert to all system administrators.*

### 3. Real-Time Geo-Alert Notifications
A robust notification system built on a custom **FIFO Queue** broadcasts alerts to citizens. 
* **Global Reach**: Notifications are dispatched to users when a new issue is reported or when an issue is successfully resolved.
* **Interactive**: Notifications appear in a polished top-bar dropdown. Clicking a notification automatically redirects the user to the specific issue's detail page.

### 4. Dynamic Spatial Heatmaps
The platform provides a geographical overview of civic problem areas.
* **Clustering & Density**: Uses an **RTree** to process spatial bounding boxes and generate visual density clusters, allowing city planners to instantly see the most problematic neighborhoods.

### 5. Algorithmic Issue Sorting
* **Priority Feed**: The main community issue feed doesn't just show the newest items. It uses a **Priority Queue** (Max-Heap) to rank issues based on a dynamic priority score calculated from both *Severity* and *Community Votes*.
* **Chronological History**: User dashboards utilize an **AVL Tree** to guarantee \(O(\log n)\) insertion and perfectly balanced chronological retrieval of their reported issues.

### 6. Strict Administrative Workflow
Administrators manage issue resolutions through a rigid, progressive state machine:
* **Workflow**: `Reported` ➔ `In-Progress` ➔ `Resolved`
* **Proof of Work**: Admins cannot simply click "Resolved". The system enforces accountability by requiring a mandatory **Proof-of-Resolution Image Upload** to close an issue.

---

## 🛠️ Technology Stack

### Frontend
* **React & Vite**: Extremely fast and modular UI development.
* **Tailwind CSS**: For sleek, modern, and responsive utility-first styling.
* **Framer Motion**: For smooth micro-animations, dropdown transitions, and page loads.
* **React Router DOM**: For seamless single-page application navigation.

### Backend
* **Node.js & Express**: Fast, non-blocking REST API server.
* **PostgreSQL (pg)**: Relational database for persistent, structured storage.
* **JWT & bcryptjs**: For secure, encrypted citizen and administrator authentication.
* **Multer**: For handling issue images and administrative proof-of-resolution uploads.

### Advanced Custom Data Structures (JavaScript & C)
*As part of an advanced algorithms initiative, standard array methods were replaced with custom implementations:*
* **QuadTree**: Spatial point querying (Duplicate detection, radius searches).
* **RTree**: Bounding-box spatial clustering (Heatmap generation).
* **Priority Queue**: Dynamic ranking algorithm (Sorting main feed).
* **AVL Tree**: Self-balancing binary search tree (Chronological user history).
* **Trie**: Prefix tree (Fast string similarity checks).
* **HashMap**: Constant time \(O(1)\) key-value lookup (Escalation mapping, analytics distribution).
* **Queue**: First-In-First-Out processing (Notification dispatching).

---

## 📂 Project Structure

```text
civic-issue-system/
├── backend/
│   ├── algorithms/       # Custom Data Structures (AVLTree, QuadTree, RTree, etc.)
│   ├── config/           # Database connection & Env variables
│   ├── controllers/      # Route logic (Auth, Issues, Notifications)
│   ├── middleware/       # JWT Auth protection
│   ├── routes/           # Express API endpoints
│   ├── services/         # Background workers (Escalation Job)
│   └── uploads/          # User-uploaded images
├── database/
│   └── schema.sql        # PostgreSQL definitions and indexes
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI (Navbar, NotificationBell, Dropdown)
    │   ├── context/      # Global state (AuthContext)
    │   ├── pages/        # Main views (Home, Map, Dashboard, Admin)
    │   └── services/     # Axios API layer
```

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL (v14+)

### 1. Database Setup
1. Create a PostgreSQL database named `civic_issues_db`.
2. The server will auto-migrate and create the required tables upon startup.
3. A default admin account is automatically seeded (`admin@civicsmart.com` / `admin123`).

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on the provided configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to explore the Smart Civic System.