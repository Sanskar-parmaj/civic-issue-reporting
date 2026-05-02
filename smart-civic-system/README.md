# Smart Civic Issue Management System

A comprehensive full-stack web application designed to empower citizens to report civic issues and enable administrators to track and resolve them efficiently. The system also serves as a practical demonstration of advanced data structures in a real-world scenario.

## 🚀 Features

### For Citizens:
- **User Dashboard**: Register, log in, and view the status of reported issues.
- **Report Issue**: Easily report local issues (like potholes, broken streetlights, waste accumulation) with descriptions and precise location data.
- **Interactive Map**: View a spatial heatmap of reported issues, including density markers for areas with high concentrations of problems.

### For Administrators:
- **Admin Dashboard**: A centralized hub to manage and oversee all reported issues.
- **Progressive Workflow Enforcement**: Manage issue statuses through a rigid pipeline (`Reported` -> `In-Progress` -> `Resolved`).
- **Proof of Resolution**: Enforces image uploads by administrators as proof when marking an issue as `Resolved`.

### Educational & Technical Core (Advanced Data Structures):
This project practically applies several advanced data structures, implemented in C (for backend functionality)
- **Spatial Data**: `QuadTree` and `RTree` for efficient geographic querying and mapping.
- **Collections & Graph Data**: `AVLTree`, `HashMap`, `LinkedList`, `PriorityQueue`, `Stack`, `Queue`, `Trie`.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet, React-Leaflet
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (pg)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Uploads**: Multer

### Algorithms
- **Languages**:  C

## 📂 Project Structure

```
smart-civic-system/
├── backend/            # Express Node.js server, routes, controllers,
├── frontend/           # React Vite application for users and admins
├── c_algorithms/       # Standalone C implementations of advanced data structures
└── database/           # Database schemas and initialization scripts
```

## ⚙️ Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smart-civic-system
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with necessary variables (DB connection, JWT secret, etc.)
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Database:**
   Ensure PostgreSQL is running and initialize the database tables using the files in the `database/` directory.

## 📄 License
This project is licensed under the ISC License.

"Node.js natively processes data from our PostgreSQL database as JSON objects. If we used our C algorithms in the backend, Node.js would have to convert every single database row into a massive text string, send it to the C program, wait for C to process it, and then convert it back. The time it takes to transfer data between JavaScript memory and C memory creates a massive I/O bottleneck. The performance we would gain from C's fast computation is completely wiped out by the overhead of data translation. Running the algorithms natively in JS is actually faster for standard web traffic."