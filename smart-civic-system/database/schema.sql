-- Smart Civic Issue Management System
-- PostgreSQL 16 Schema

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS IssueHistory CASCADE;
DROP TABLE IF EXISTS Comments CASCADE;
DROP TABLE IF EXISTS Votes CASCADE;
DROP TABLE IF EXISTS Issues CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Users Table
CREATE TABLE Users (
    user_id     SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(10) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Issues Table
CREATE TABLE Issues (
    issue_id    SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    category    VARCHAR(50) NOT NULL,
    severity    VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status      VARCHAR(20) NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in-progress', 'resolved')),
    image       VARCHAR(255),
    proof_image VARCHAR(255),
    proof_description TEXT,
    latitude    DECIMAL(10, 7) NOT NULL,
    longitude   DECIMAL(10, 7) NOT NULL,
    votes       INTEGER DEFAULT 0,
    created_by  INTEGER REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Index for spatial queries
CREATE INDEX idx_issues_location ON Issues (latitude, longitude);
CREATE INDEX idx_issues_status ON Issues (status);
CREATE INDEX idx_issues_created_by ON Issues (created_by);

-- Votes Table
CREATE TABLE Votes (
    vote_id     SERIAL PRIMARY KEY,
    issue_id    INTEGER REFERENCES Issues(issue_id) ON DELETE CASCADE NOT NULL,
    user_id     INTEGER REFERENCES Users(user_id) ON DELETE CASCADE NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (issue_id, user_id) -- Prevent duplicate votes
);

-- Comments Table
CREATE TABLE Comments (
    comment_id  SERIAL PRIMARY KEY,
    issue_id    INTEGER REFERENCES Issues(issue_id) ON DELETE CASCADE NOT NULL,
    user_id     INTEGER REFERENCES Users(user_id) ON DELETE CASCADE NOT NULL,
    comment     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_issue_id ON Comments (issue_id);

-- IssueHistory Table (track all status changes)
CREATE TABLE IssueHistory (
    history_id  SERIAL PRIMARY KEY,
    issue_id    INTEGER REFERENCES Issues(issue_id) ON DELETE CASCADE NOT NULL,
    status      VARCHAR(20) NOT NULL,
    updated_by  INTEGER REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_history_issue_id ON IssueHistory (issue_id);
