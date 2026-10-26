-- ============================================================================
-- DATABASE MANAGEMENT SYSTEMS MINI-PROJECT
-- TOPIC: College Clubs and Committees Event Management System
-- INSTITUTION: Sardar Patel Institute of Technology (SPIT), Mumbai
-- AUTHORS: Vighnesh Deepak Pawar (UID: 2025800098)
--          Rushikesh Amol Patil  (UID: 2025800093)
-- ACADEMIC YEAR: 2026 - 2027 | SEMESTER: III | CSE-SY
-- TARGET RDBMS: MySQL 8.0+
-- NORMALIZATION: Normalized up to 3NF (Third Normal Form)
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE INITIALIZATION
-- ============================================================================

DROP DATABASE IF EXISTS college_event_management;
CREATE DATABASE college_event_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE college_event_management;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables to ensure clean initialization
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SECTION 2: TABLE CREATION (3NF RELATIONAL SCHEMA)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table 1: roles
-- Role definition for Role-Based Access Control (RBAC): Student, Faculty, Admin
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_roles PRIMARY KEY (role_id),
    CONSTRAINT uq_roles_role_name UNIQUE (role_name),
    CONSTRAINT chk_roles_role_name CHECK (role_name IN ('Student', 'Faculty', 'Administrator', 'Mentor'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: users
-- Core user entity storing student, faculty, and administrator profiles
-- Note: roll_no is UNIQUE for students, but NULL for faculty/administrators
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    roll_no VARCHAR(20) DEFAULT NULL,
    department VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'spit@123',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_roll_no UNIQUE (roll_no),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) 
        REFERENCES roles (role_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: organizations
-- Student-run clubs, societies, and committees (e.g. ACSES, CSI, IEEE, E-Cell)
-- Referenced faculty advisor has ON DELETE SET NULL for optional advisor changes
-- ----------------------------------------------------------------------------
CREATE TABLE organizations (
    organization_id INT AUTO_INCREMENT,
    org_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    faculty_advisor_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_organizations PRIMARY KEY (organization_id),
    CONSTRAINT uq_organizations_org_name UNIQUE (org_name),
    CONSTRAINT fk_organizations_faculty_advisor FOREIGN KEY (faculty_advisor_id) 
        REFERENCES users (user_id) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: venues
-- College premises, auditoriums, labs, and seminar halls available for events
-- ----------------------------------------------------------------------------
CREATE TABLE venues (
    venue_id INT AUTO_INCREMENT,
    venue_name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_venues PRIMARY KEY (venue_id),
    CONSTRAINT uq_venues_venue_name UNIQUE (venue_name),
    CONSTRAINT chk_venues_capacity CHECK (capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: memberships
-- Bridge table representing student membership in clubs and 3-tier hierarchy
-- Enforces UNIQUE (organization_id, user_id) to prevent duplicate memberships
-- ----------------------------------------------------------------------------
CREATE TABLE memberships (
    membership_id INT AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    member_role VARCHAR(50) NOT NULL DEFAULT 'Member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_memberships PRIMARY KEY (membership_id),
    CONSTRAINT uq_memberships_org_user UNIQUE (organization_id, user_id),
    CONSTRAINT fk_memberships_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations (organization_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) 
        REFERENCES users (user_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT chk_memberships_role CHECK (
        member_role IN (
            'Chairperson', 
            'Vice Chairperson', 
            'Secretary', 
            'Finance Secretary', 
            'Creatives Head', 
            'Marketing Head', 
            'Technical Head', 
            'Events Head', 
            'Supercore', 
            'Core', 
            'Subcommittee', 
            'Member',
            'Advisor',
            'Mentor',
            'Volunteer'
        )
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 6: events
-- Events proposed by club core members, verified by faculty/admins
-- Contains venue booking, capacity limits, approval status and lifecycle state
-- ----------------------------------------------------------------------------
CREATE TABLE events (
    event_id INT AUTO_INCREMENT,
    organization_id INT NOT NULL,
    venue_id INT NOT NULL,
    created_by INT NOT NULL,
    approved_by INT DEFAULT NULL,
    event_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    max_participants INT NOT NULL,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    event_status VARCHAR(20) NOT NULL DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_events PRIMARY KEY (event_id),
    CONSTRAINT chk_events_max_participants CHECK (max_participants > 0),
    CONSTRAINT chk_events_approval_status CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    CONSTRAINT chk_events_event_status CHECK (event_status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
    CONSTRAINT fk_events_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations (organization_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) 
        REFERENCES venues (venue_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) 
        REFERENCES users (user_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    CONSTRAINT fk_events_approved_by FOREIGN KEY (approved_by) 
        REFERENCES users (user_id) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 7: registrations
-- Student event registrations and post-event attendance tracking
-- Enforces UNIQUE (event_id, user_id) to prevent duplicate registrations
-- ----------------------------------------------------------------------------
CREATE TABLE registrations (
    registration_id INT AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    participation_status VARCHAR(20) NOT NULL DEFAULT 'Registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_registrations PRIMARY KEY (registration_id),
    CONSTRAINT uq_registrations_event_user UNIQUE (event_id, user_id),
    CONSTRAINT chk_registrations_status CHECK (participation_status IN ('Registered', 'Attended', 'Absent', 'Cancelled')),
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) 
        REFERENCES events (event_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) 
        REFERENCES users (user_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 8: feedback
-- Post-event participant feedback; 1:1 relationship with registration record
-- UNIQUE (registration_id) strictly prevents multiple feedback submissions
-- ----------------------------------------------------------------------------
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT,
    registration_id INT NOT NULL,
    rating INT NOT NULL,
    comments TEXT DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_feedback PRIMARY KEY (feedback_id),
    CONSTRAINT uq_feedback_registration UNIQUE (registration_id),
    CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_feedback_registration FOREIGN KEY (registration_id) 
        REFERENCES registrations (registration_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 9: announcements
-- Official club and committee announcements broadcasted to students
-- ----------------------------------------------------------------------------
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT,
    organization_id INT NOT NULL,
    created_by INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_announcements PRIMARY KEY (announcement_id),
    CONSTRAINT fk_announcements_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations (organization_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) 
        REFERENCES users (user_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 3: TRIGGERS (BUSINESS RULES & ADVANCED INTEGRITY ENFORCEMENT)
-- ============================================================================

DELIMITER $$

-- ----------------------------------------------------------------------------
-- Trigger 1: trg_prevent_venue_clash_insert
-- Prevents scheduling two approved events at the same venue on the same date
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_prevent_venue_clash_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.approval_status = 'Approved' THEN
        IF EXISTS (
            SELECT 1 FROM events
            WHERE venue_id = NEW.venue_id
              AND event_date = NEW.event_date
              AND approval_status = 'Approved'
              AND event_status != 'Cancelled'
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Venue Conflict: Another approved event is already booked at this venue for this date.';
        END IF;
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- Trigger 2: trg_prevent_venue_clash_update
-- Prevents venue conflict upon updating venue, date, or approving an event
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_prevent_venue_clash_update
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
    IF NEW.approval_status = 'Approved' AND (
        OLD.approval_status != 'Approved' 
        OR OLD.venue_id != NEW.venue_id 
        OR OLD.event_date != NEW.event_date
    ) THEN
        IF EXISTS (
            SELECT 1 FROM events
            WHERE venue_id = NEW.venue_id
              AND event_date = NEW.event_date
              AND event_id != NEW.event_id
              AND approval_status = 'Approved'
              AND event_status != 'Cancelled'
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Venue Conflict: Another approved event is already booked at this venue for this date.';
        END IF;
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- Trigger 3: trg_check_registration_rules
-- Ensures:
-- 1. Student can only register for 'Approved' events
-- 2. Registration count does not exceed max_participants
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_check_registration_rules
BEFORE INSERT ON registrations
FOR EACH ROW
BEGIN
    DECLARE v_approval_status VARCHAR(20);
    DECLARE v_event_status VARCHAR(20);
    DECLARE v_max_participants INT;
    DECLARE v_current_registrations INT;

    SELECT approval_status, event_status, max_participants 
    INTO v_approval_status, v_event_status, v_max_participants
    FROM events
    WHERE event_id = NEW.event_id;

    IF v_approval_status != 'Approved' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registration Error: Registrations are only allowed for approved events.';
    END IF;

    IF v_event_status = 'Cancelled' OR v_event_status = 'Completed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registration Error: Cannot register for completed or cancelled events.';
    END IF;

    SELECT COUNT(*) INTO v_current_registrations
    FROM registrations
    WHERE event_id = NEW.event_id
      AND participation_status != 'Cancelled';

    IF v_current_registrations >= v_max_participants THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registration Error: Event participant capacity limit has been reached.';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- Trigger 4: trg_validate_feedback_eligibility
-- Verifies that feedback can ONLY be submitted by participants who attended
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_validate_feedback_eligibility
BEFORE INSERT ON feedback
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT participation_status INTO v_status
    FROM registrations
    WHERE registration_id = NEW.registration_id;

    IF v_status != 'Attended' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Feedback Error: Feedback can only be submitted for attended events.';
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- SECTION 4: SAMPLE DATA INSERTION (EXACT ABSTRACT SPECIFICATION)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Populate roles
-- ----------------------------------------------------------------------------
INSERT INTO roles (role_id, role_name) VALUES
(1, 'Student'),
(2, 'Faculty'),
(3, 'Administrator'),
(4, 'Mentor');

-- ----------------------------------------------------------------------------
-- 2. Populate users
-- Faculty and Admins have roll_no = NULL; Students have specific roll numbers
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, role_id, full_name, email, roll_no, department, password_hash) VALUES
(1, 3, 'Dr. B. N. Chaudhari', 'principal@spit.ac.in', NULL, 'Administration', 'admin@123'),
(2, 2, 'Dr. Anand Godbole', 'anand.godbole@spit.ac.in', NULL, 'Computer Engineering', 'faculty@123'),
(3, 1, 'Mihir Pukale', 'mihir.pukale@spit.ac.in', '2023300001', 'Computer Engineering', 'acses@123'),
(4, 1, 'Rushikesh Patil', 'rushikesh.patil@spit.ac.in', '2025800093', 'Computer Engineering', 'rushikesh@123'),
(5, 1, 'Vighnesh Pawar', 'vighnesh.pawar@spit.ac.in', '2025800098', 'Computer Engineering', 'csi@123'),
(6, 1, 'Arjun Thakur', 'arjun.thakur@spit.ac.in', '2023300003', 'Computer Engineering', 'arjun@123'),
(7, 4, 'Prof. Rajiv Mehta', 'rajiv.mehta@spit.ac.in', NULL, 'Industry & Alumni Mentorship', 'mentor@123'),
(8, 3, 'Dr. Y. S. Rao', 'dean.acad@spit.ac.in', NULL, 'Academic Affairs & R&D', 'dean@123'),
(9, 1, 'Tanvi Shah', 'tanvi.shah@spit.ac.in', '2023300012', 'Computer Engineering', 'tanvi@123'),
(10, 1, 'Siddharth Nair', 'siddharth.nair@spit.ac.in', '2023300045', 'Computer Engineering', 'siddharth@123'),
(11, 1, 'Priya Sharma', 'priya.sharma@spit.ac.in', '2023300088', 'Information Technology', 'student@123');

-- ----------------------------------------------------------------------------
-- 3. Populate organizations
-- Active student chapters and committees mentored by Faculty Advisor (Dr. Godbole)
-- ----------------------------------------------------------------------------
INSERT INTO organizations (organization_id, org_name, description, faculty_advisor_id) VALUES
(1, 'ACSES', 'Association of Computer Science & Engineering Students', 2),
(2, 'CSI', 'Computer Society of India - SPIT Student Chapter', 2),
(3, 'IEEE', 'IEEE SPIT Student Branch - Technical and research society', 2),
(4, 'E-Cell', 'Entrepreneurship Cell SPIT - Startup incubation hub', 2),
(5, 'Mudra (cultural)', 'Mudra - Cultural Committee overseeing performing arts', 2),
(6, 'Sports committee', 'SPIT Sports Committee - Organizing sports tournaments', 2);

-- ----------------------------------------------------------------------------
-- 4. Populate venues
-- Campus venues and seat capacities
-- ----------------------------------------------------------------------------
INSERT INTO venues (venue_id, venue_name, capacity) VALUES
(1, 'SPIT Auditorium', 350),
(2, 'Seminar Hall 008', 150),
(3, 'Central Computing Facility (CCF)', 120),
(4, 'Computer Lab 202', 60),
(5, 'College Quadrangle', 500);

-- ----------------------------------------------------------------------------
-- 5. Populate memberships
-- Club leadership and hierarchy positions
-- ----------------------------------------------------------------------------
INSERT INTO memberships (membership_id, organization_id, user_id, member_role) VALUES
(1, 1, 3, 'Chairperson'),
(2, 1, 9, 'Vice Chairperson'),
(3, 1, 4, 'Creatives Head'),
(4, 1, 6, 'Secretary'),
(5, 2, 5, 'Chairperson'),
(6, 2, 10, 'Vice Chairperson'),
(7, 4, 4, 'Finance Secretary'),
(8, 2, 11, 'Subcommittee Member');

-- ----------------------------------------------------------------------------
-- 6. Populate events
-- Event proposals, venues, dates, capacities, approval and event status
-- ----------------------------------------------------------------------------
INSERT INTO events (event_id, organization_id, venue_id, created_by, approved_by, event_name, description, event_date, max_participants, approval_status, event_status) VALUES
(1, 1, 3, 3, 1, 'CodeBash 2026', 'Departmental competitive programming and algorithm hackathon.', '2026-10-25', 100, 'Approved', 'Upcoming'),
(2, 1, 4, 4, 1, 'Design & UI/UX Sprint', 'Hands-on UI/UX product design sprint with Figma prototyping.', '2026-09-15', 50, 'Approved', 'Completed'),
(3, 1, 2, 5, 1, 'Brand & Marketing Summit', 'Interactive session on brand positioning, content creation and marketing.', '2026-11-05', 80, 'Approved', 'Upcoming'),
(4, 4, 1, 3, 1, 'E-Summit: Shark Tank SPIT', 'Annual entrepreneurship pitch competition before angel investors.', '2026-11-20', 250, 'Approved', 'Upcoming'),
(5, 5, 5, 6, 1, 'Tarang: Cultural Showcase', 'Intra-college cultural extravaganza with music, dance, and theater.', '2026-09-22', 400, 'Approved', 'Completed'),
(6, 6, 5, 5, NULL, 'Agility Cup: Football League', 'Inter-department 7v7 football championship league matches.', '2026-12-02', 150, 'Pending', 'Upcoming'),
(7, 2, 1, 5, 1, 'The S.P.I.T. Hackathon 2026', 'Premier 24-hour national offline hackathon across Web3, AI/ML, and FinTech domains.', '2026-12-14', 300, 'Approved', 'Upcoming'),
(8, 2, 3, 5, 2, 'unSQLved: Query & Schema Debugging', 'High-speed relational database debugging challenge solving complex SQL queries and 3NF anomalies.', '2026-10-10', 100, 'Approved', 'Completed'),
(9, 3, 1, 4, 1, 'HackFusion 2026: Hybrid Hackathon', 'Flagship 24-hour hybrid hackathon co-hosted by IEEE Bombay Section with real-world industry tracks.', '2026-11-12', 250, 'Approved', 'Upcoming'),
(10, 3, 2, 3, 2, 'Aeravat: AI & Deep Learning Summit', 'Specialized symposium on Large Language Models, vision transformers, and clinical diagnostic AI.', '2026-11-28', 120, 'Approved', 'Upcoming'),
(11, 4, 2, 4, 2, 'Avalanche: Crisis Management Challenge', 'High-intensity corporate PR and boardroom simulation testing strategic adaptation under market panic.', '2026-10-05', 75, 'Approved', 'Completed'),
(12, 5, 1, 6, 1, 'Oculus: Sargam Inter-College Singing', 'Flagship intra- and inter-collegiate solo and band singing showdown under the annual Oculus festival.', '2026-10-18', 320, 'Approved', 'Completed'),
(13, 6, 5, 5, 1, 'SPoorthi: Inter-Collegiate Cricket Cup', 'Premier 8-team inter-engineering box cricket championship on the college grounds with live scoring.', '2026-12-18', 200, 'Approved', 'Upcoming'),
(14, 6, 5, 3, NULL, 'SPIT Marathon: Run for Mental Health', 'Annual 5K and 10K campus marathon traversing Juhu-Andheri to raise awareness for student well-being.', '2026-12-28', 350, 'Pending', 'Upcoming'),
(15, 2, 4, 4, 2, 'Pixel Perfect: UI/UX Design Sprint', 'Rapid 4-hour Figma design battle building interactive mobile prototypes and design tokens.', '2026-09-28', 50, 'Approved', 'Completed');

-- ----------------------------------------------------------------------------
-- 7. Populate registrations
-- Student event enrollments and attendance outcomes
-- ----------------------------------------------------------------------------
INSERT INTO registrations (registration_id, event_id, user_id, participation_status) VALUES
(1, 2, 3, 'Attended'),
(2, 2, 5, 'Attended'),
(3, 2, 6, 'Attended'),
(4, 5, 3, 'Attended'),
(5, 5, 4, 'Attended'),
(6, 1, 5, 'Registered'),
(7, 8, 4, 'Attended'),
(8, 8, 5, 'Attended'),
(9, 8, 3, 'Attended'),
(10, 11, 3, 'Attended'),
(11, 11, 6, 'Attended'),
(12, 12, 4, 'Attended'),
(13, 12, 5, 'Attended'),
(14, 15, 3, 'Attended'),
(15, 15, 5, 'Attended'),
(16, 7, 4, 'Registered'),
(17, 9, 3, 'Registered');

-- ----------------------------------------------------------------------------
-- 8. Populate feedback
-- Post-event evaluations by attended participants (Rating 1 to 5)
-- ----------------------------------------------------------------------------
INSERT INTO feedback (feedback_id, registration_id, rating, comments) VALUES
(1, 1, 5, 'Great hands-on design sprint! Figma prototyping was explained thoroughly.'),
(2, 2, 5, 'Exceptional creative branding session. Marketing materials insights were practical.'),
(3, 3, 4, 'Very insightful technical workshop organized by ACSES.'),
(4, 4, 5, 'Tarang was electrifying! Stellar musical battles and great lighting.'),
(5, 5, 5, 'Flawless event coordination and vibrant performances by the cultural squad.'),
(6, 7, 5, 'The unSQLved schema debugging round was brilliant! Solved real ACID compliance puzzles.'),
(7, 8, 5, 'Challenging query optimization puzzles. Loved the competitive edge of CSI.'),
(8, 10, 5, 'Intense crisis scenario! Boardroom simulation felt like a real venture capital meeting.'),
(9, 12, 5, 'Acoustics in the Auditorium were outstanding! Mudra team coordinated sound perfectly.'),
(10, 14, 5, 'Great hands-on Figma design critique session by the design mentors.');

-- ----------------------------------------------------------------------------
-- 9. Populate announcements
-- Club announcements and notifications
-- ----------------------------------------------------------------------------
INSERT INTO announcements (announcement_id, organization_id, created_by, title, description) VALUES
(1, 1, 3, 'CodeBash 2026: Team Registrations Open', 'Registrations live on HackerRank! Teams of 2 to 3 before Oct 22.'),
(2, 1, 4, 'ACSES Creatives & Design Submissions', 'Call for banner artwork, event posters, and teaser video edits.'),
(3, 1, 5, 'ACSES Marketing & Sponsorship Drive', 'Applications invited for student marketing associates for annual symposium.'),
(4, 4, 3, 'Shark Tank SPIT: Pitch Deck Deadline', 'Submit 5-slide startup pitch deck by Nov 15 for investor pitches.'),
(5, 5, 6, 'Auditions for Mudra Dance Squad', 'Auditions for the annual intra-college dance troupe this Friday in Quadrangle.'),
(6, 6, 5, 'Agility Cup: Fixture Schedule Released', 'Inter-department cricket and football draws published on sports noticeboard.'),
(7, 2, 5, 'S.P.I.T. Hackathon 2026 Track Announcements', 'Tracks for AI/ML, Web3, and FinTech are live on Unstop. Register early to guarantee shortlisting.'),
(8, 3, 4, 'HackFusion 2026: Hybrid Hackathon Details', 'Joint international hackathon problem statements revealed. Hardware kits provided for shortlisted teams.'),
(9, 6, 5, 'SPoorthi Cricket Championship: Captains Meet', 'Inter-department cricket tournament captain briefing on Friday at 4 PM in CCF.');

-- ============================================================================
-- SECTION 5: DATABASE VIEWS (FOR REPORTING & API INTEGRATION)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View 1: vw_approved_upcoming_events
-- Clean feed of upcoming approved events with live seat availability
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_approved_upcoming_events AS
SELECT 
    e.event_id,
    e.event_name,
    o.org_name AS organizing_club,
    v.venue_name,
    v.capacity AS venue_capacity,
    e.event_date,
    e.max_participants,
    COUNT(r.registration_id) AS registered_count,
    (e.max_participants - COUNT(r.registration_id)) AS seats_remaining,
    u.full_name AS created_by_name
FROM events e
JOIN organizations o ON e.organization_id = o.organization_id
JOIN venues v ON e.venue_id = v.venue_id
JOIN users u ON e.created_by = u.user_id
LEFT JOIN registrations r ON e.event_id = r.event_id AND r.participation_status != 'Cancelled'
WHERE e.approval_status = 'Approved' 
  AND e.event_status = 'Upcoming'
GROUP BY e.event_id, e.event_name, o.org_name, v.venue_name, v.capacity, e.event_date, e.max_participants, u.full_name
ORDER BY e.event_date ASC;

-- ----------------------------------------------------------------------------
-- View 2: vw_club_leadership_directory
-- Overview of student heads, core committee members, and faculty advisors
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_club_leadership_directory AS
SELECT 
    o.organization_id,
    o.org_name AS club_name,
    fa.full_name AS faculty_advisor,
    fa.email AS advisor_email,
    u.user_id AS student_user_id,
    u.full_name AS student_name,
    u.roll_no,
    u.department,
    m.member_role,
    m.joined_at
FROM organizations o
LEFT JOIN users fa ON o.faculty_advisor_id = fa.user_id
JOIN memberships m ON o.organization_id = m.organization_id
JOIN users u ON m.user_id = u.user_id
ORDER BY o.org_name, m.member_role;

-- ----------------------------------------------------------------------------
-- View 3: vw_event_feedback_analytics
-- Performance analytics, ratings, and attendance breakdown per event
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_event_feedback_analytics AS
SELECT 
    e.event_id,
    e.event_name,
    o.org_name AS organized_by,
    e.event_date,
    COUNT(DISTINCT r.registration_id) AS total_registrations,
    SUM(CASE WHEN r.participation_status = 'Attended' THEN 1 ELSE 0 END) AS attendees_count,
    COUNT(DISTINCT f.feedback_id) AS feedback_count,
    ROUND(AVG(f.rating), 2) AS average_rating
FROM events e
JOIN organizations o ON e.organization_id = o.organization_id
LEFT JOIN registrations r ON e.event_id = r.event_id
LEFT JOIN feedback f ON r.registration_id = f.registration_id
GROUP BY e.event_id, e.event_name, o.org_name, e.event_date
ORDER BY average_rating DESC;

-- ----------------------------------------------------------------------------
-- View 4: vw_student_participation_history
-- Individual student portfolio of club registrations, attendance, and feedback
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_participation_history AS
SELECT 
    u.user_id,
    u.full_name AS student_name,
    u.roll_no,
    u.department,
    e.event_id,
    e.event_name,
    o.org_name AS club_name,
    e.event_date,
    r.registration_id,
    r.participation_status,
    f.rating AS feedback_rating,
    f.comments AS feedback_comments
FROM users u
JOIN registrations r ON u.user_id = r.user_id
JOIN events e ON r.event_id = e.event_id
JOIN organizations o ON e.organization_id = o.organization_id
LEFT JOIN feedback f ON r.registration_id = f.registration_id
ORDER BY u.full_name, e.event_date DESC;

-- ============================================================================
-- SECTION 6: STORED PROCEDURES (BUSINESS WORKFLOWS)
-- ============================================================================

DELIMITER $$

-- ----------------------------------------------------------------------------
-- Procedure 1: sp_register_for_event
-- Safely enrolls a student for an event with capacity & approval validation
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_register_for_event(
    IN p_event_id INT,
    IN p_user_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_is_approved VARCHAR(20);
    DECLARE v_event_state VARCHAR(20);
    DECLARE v_max_seats INT;
    DECLARE v_current_seats INT;
    DECLARE v_already_registered INT;

    -- Check if student already registered
    SELECT COUNT(*) INTO v_already_registered
    FROM registrations
    WHERE event_id = p_event_id AND user_id = p_user_id;

    IF v_already_registered > 0 THEN
        SET p_status_code = 409;
        SET p_status_message = 'Already registered for this event.';
        LEAVE proc_label;
    END IF;

    -- Check event existence & approval
    SELECT approval_status, event_status, max_participants 
    INTO v_is_approved, v_event_state, v_max_seats
    FROM events
    WHERE event_id = p_event_id;

    IF v_is_approved IS NULL THEN
        SET p_status_code = 404;
        SET p_status_message = 'Event not found.';
        LEAVE proc_label;
    END IF;

    IF v_is_approved != 'Approved' THEN
        SET p_status_code = 400;
        SET p_status_message = 'Cannot register: Event is not approved.';
        LEAVE proc_label;
    END IF;

    -- Check capacity
    SELECT COUNT(*) INTO v_current_seats
    FROM registrations
    WHERE event_id = p_event_id AND participation_status != 'Cancelled';

    IF v_current_seats >= v_max_seats THEN
        SET p_status_code = 422;
        SET p_status_message = 'Registration closed: Event reached full capacity.';
        LEAVE proc_label;
    END IF;

    -- Register student
    INSERT INTO registrations (event_id, user_id, participation_status)
    VALUES (p_event_id, p_user_id, 'Registered');

    SET p_status_code = 200;
    SET p_status_message = 'Registration successful.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 2: sp_approve_event_proposal
-- Administrator / Advisor reviews and approves an event proposal
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_approve_event_proposal(
    IN p_event_id INT,
    IN p_approver_user_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_venue_id INT;
    DECLARE v_event_date DATE;
    DECLARE v_approver_role VARCHAR(50);
    DECLARE v_clash_count INT;

    -- Verify approver role (Must be Faculty or Administrator)
    SELECT r.role_name INTO v_approver_role
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = p_approver_user_id;

    IF v_approver_role NOT IN ('Faculty', 'Administrator') THEN
        SET p_status_code = 403;
        SET p_status_message = 'Unauthorized: Only Faculty or Administrators can approve events.';
        LEAVE proc_label;
    END IF;

    -- Get event venue and date
    SELECT venue_id, event_date INTO v_venue_id, v_event_date
    FROM events
    WHERE event_id = p_event_id;

    IF v_venue_id IS NULL THEN
        SET p_status_code = 404;
        SET p_status_message = 'Event not found.';
        LEAVE proc_label;
    END IF;

    -- Check venue clash
    SELECT COUNT(*) INTO v_clash_count
    FROM events
    WHERE venue_id = v_venue_id
      AND event_date = v_event_date
      AND approval_status = 'Approved'
      AND event_id != p_event_id
      AND event_status != 'Cancelled';

    IF v_clash_count > 0 THEN
        SET p_status_code = 409;
        SET p_status_message = 'Approval failed: Venue already booked by another approved event on this date.';
        LEAVE proc_label;
    END IF;

    -- Update status
    UPDATE events
    SET approval_status = 'Approved',
        approved_by = p_approver_user_id
    WHERE event_id = p_event_id;

    SET p_status_code = 200;
    SET p_status_message = 'Event approved successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 3: sp_submit_feedback
-- Validates attendance and records student ratings and comments
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_submit_feedback(
    IN p_registration_id INT,
    IN p_rating INT,
    IN p_comments TEXT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_already_submitted INT;

    -- Check if feedback already submitted
    SELECT COUNT(*) INTO v_already_submitted
    FROM feedback
    WHERE registration_id = p_registration_id;

    IF v_already_submitted > 0 THEN
        SET p_status_code = 409;
        SET p_status_message = 'Feedback has already been submitted for this registration.';
        LEAVE proc_label;
    END IF;

    -- Check attendance
    SELECT participation_status INTO v_status
    FROM registrations
    WHERE registration_id = p_registration_id;

    IF v_status IS NULL THEN
        SET p_status_code = 404;
        SET p_status_message = 'Registration record not found.';
        LEAVE proc_label;
    END IF;

    IF v_status != 'Attended' THEN
        SET p_status_code = 400;
        SET p_status_message = 'Cannot submit feedback: Participant status is not marked as Attended.';
        LEAVE proc_label;
    END IF;

    IF p_rating < 1 OR p_rating > 5 THEN
        SET p_status_code = 422;
        SET p_status_message = 'Invalid rating: Rating must be between 1 and 5.';
        LEAVE proc_label;
    END IF;

    -- Insert feedback
    INSERT INTO feedback (registration_id, rating, comments)
    VALUES (p_registration_id, p_rating, p_comments);

    SET p_status_code = 200;
    SET p_status_message = 'Feedback recorded successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 4: sp_add_user
-- Inserts a new user (Student, Faculty/Professor, Mentor, or Administrator)
-- Enforces RBAC: Only Committee Chairpersons (CP), Faculty, or Administrators can add users
-- Enforces email uniqueness and roll_no uniqueness for students
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_add_user(
    IN p_requester_user_id INT,
    IN p_role_id INT,
    IN p_full_name VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_roll_no VARCHAR(20),
    IN p_department VARCHAR(100),
    IN p_password VARCHAR(255),
    OUT p_new_user_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_requester_role VARCHAR(50);
    DECLARE v_is_cp INT DEFAULT 0;
    DECLARE v_exists INT;

    -- Verify requester permission (Faculty, Administrator, or Committee Chairperson)
    IF p_requester_user_id IS NOT NULL THEN
        SELECT r.role_name INTO v_requester_role
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = p_requester_user_id;

        SELECT COUNT(*) INTO v_is_cp
        FROM memberships
        WHERE user_id = p_requester_user_id AND member_role IN ('Chairperson', 'Vice Chairperson');

        IF (v_requester_role IS NULL OR v_requester_role NOT IN ('Faculty', 'Administrator')) AND v_is_cp = 0 THEN
            SET p_status_code = 403;
            SET p_status_message = 'Access Denied: Only Committee CPs, VCPs, Faculty, or Administrators can add users.';
            LEAVE proc_label;
        END IF;
    END IF;

    -- Validate role exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE role_id = p_role_id) THEN
        SET p_status_code = 400;
        SET p_status_message = 'Invalid role ID provided.';
        LEAVE proc_label;
    END IF;

    -- Check duplicate email
    SELECT COUNT(*) INTO v_exists FROM users WHERE email = p_email;
    IF v_exists > 0 THEN
        SET p_status_code = 409;
        SET p_status_message = 'A user with this email address already exists.';
        LEAVE proc_label;
    END IF;

    -- If student, check duplicate roll_no
    IF p_roll_no IS NOT NULL AND p_roll_no != '' THEN
        SELECT COUNT(*) INTO v_exists FROM users WHERE roll_no = p_roll_no;
        IF v_exists > 0 THEN
            SET p_status_code = 409;
            SET p_status_message = 'A student with this roll number already exists.';
            LEAVE proc_label;
        END IF;
    END IF;

    -- Insert new user
    INSERT INTO users (role_id, full_name, email, roll_no, department, password_hash)
    VALUES (p_role_id, p_full_name, p_email, NULLIF(p_roll_no, ''), p_department, COALESCE(NULLIF(p_password, ''), 'spit@123'));

    SET p_new_user_id = LAST_INSERT_ID();
    SET p_status_code = 201;
    SET p_status_message = 'User account created successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 5: sp_delete_user
-- Deletes a user profile; ON DELETE CASCADE cleans dependent memberships &
-- registrations, while ON DELETE SET NULL clears optional advisor references.
-- Enforces RBAC: Only Committee Chairpersons (CP), Faculty, or Administrators can delete users.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_delete_user(
    IN p_requester_user_id INT,
    IN p_target_user_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_requester_role VARCHAR(50);
    DECLARE v_is_cp INT DEFAULT 0;

    -- Verify requester permission (Faculty, Administrator, or Committee Chairperson)
    IF p_requester_user_id IS NOT NULL THEN
        SELECT r.role_name INTO v_requester_role
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = p_requester_user_id;

        SELECT COUNT(*) INTO v_is_cp
        FROM memberships
        WHERE user_id = p_requester_user_id AND member_role IN ('Chairperson', 'Vice Chairperson');

        IF (v_requester_role IS NULL OR v_requester_role NOT IN ('Faculty', 'Administrator')) AND v_is_cp = 0 THEN
            SET p_status_code = 403;
            SET p_status_message = 'Access Denied: Only Committee CPs, VCPs, Faculty, or Administrators can delete users.';
            LEAVE proc_label;
        END IF;

        -- Committee CP/VCP can only delete students/members, NOT Administrators, Faculty, or Mentors
        IF v_is_cp > 0 AND (v_requester_role IS NULL OR v_requester_role NOT IN ('Faculty', 'Administrator')) THEN
            IF EXISTS (
                SELECT 1 FROM users u
                JOIN roles r ON u.role_id = r.role_id
                WHERE u.user_id = p_target_user_id AND r.role_name IN ('Administrator', 'Faculty', 'Mentor')
            ) THEN
                SET p_status_code = 403;
                SET p_status_message = 'Access Denied: Committee CPs cannot delete Administrators, Faculty Advisors, or Mentors.';
                LEAVE proc_label;
            END IF;

            IF p_requester_user_id = p_target_user_id THEN
                SET p_status_code = 400;
                SET p_status_message = 'Cannot delete your own active login profile.';
                LEAVE proc_label;
            END IF;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = p_target_user_id) THEN
        SET p_status_code = 404;
        SET p_status_message = 'User record not found.';
        LEAVE proc_label;
    END IF;

    DELETE FROM users WHERE user_id = p_target_user_id;

    SET p_status_code = 200;
    SET p_status_message = 'User and associated records deleted successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 11: sp_delete_announcement
-- Enforces ownership & committee RBAC on deleting announcements
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_delete_announcement(
    IN p_requester_user_id INT,
    IN p_announcement_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_author_id INT;
    DECLARE v_org_id INT;
    DECLARE v_role VARCHAR(50);
    DECLARE v_is_lead INT DEFAULT 0;

    SELECT created_by, organization_id INTO v_author_id, v_org_id
    FROM announcements
    WHERE announcement_id = p_announcement_id;

    IF v_author_id IS NULL THEN
        SET p_status_code = 404;
        SET p_status_message = 'Announcement record not found.';
        LEAVE proc_label;
    END IF;

    -- Author can always delete their own announcement
    IF p_requester_user_id = v_author_id THEN
        DELETE FROM announcements WHERE announcement_id = p_announcement_id;
        SET p_status_code = 200;
        SET p_status_message = 'Announcement deleted successfully by author.';
        LEAVE proc_label;
    END IF;

    -- Administrators & Faculty Advisors have moderation oversight
    SELECT r.role_name INTO v_role
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = p_requester_user_id;

    IF v_role IN ('Administrator', 'Faculty') THEN
        DELETE FROM announcements WHERE announcement_id = p_announcement_id;
        SET p_status_code = 200;
        SET p_status_message = 'Announcement deleted by authorized supervisor.';
        LEAVE proc_label;
    END IF;

    -- Committee CP / VCP of this specific organization can delete
    SELECT COUNT(*) INTO v_is_lead
    FROM memberships
    WHERE user_id = p_requester_user_id 
      AND organization_id = v_org_id 
      AND member_role IN ('Chairperson', 'Vice Chairperson');

    IF v_is_lead > 0 THEN
        DELETE FROM announcements WHERE announcement_id = p_announcement_id;
        SET p_status_code = 200;
        SET p_status_message = 'Announcement deleted by committee chairperson.';
        LEAVE proc_label;
    END IF;

    -- General members and non-authors cannot delete
    SET p_status_code = 403;
    SET p_status_message = 'Access Denied: You cannot delete an announcement that was not created by you or does not belong to your committee.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 6: sp_delete_event
-- Deletes an event and cascades to its registrations & feedback records
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_delete_event(
    IN p_event_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    IF NOT EXISTS (SELECT 1 FROM events WHERE event_id = p_event_id) THEN
        SET p_status_code = 404;
        SET p_status_message = 'Event record not found.';
        LEAVE proc_label;
    END IF;

    DELETE FROM events WHERE event_id = p_event_id;

    SET p_status_code = 200;
    SET p_status_message = 'Event and associated registrations deleted successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 7: sp_add_club_membership
-- Assigns a student or mentor to an organizational leadership portfolio
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_add_club_membership(
    IN p_organization_id INT,
    IN p_user_id INT,
    IN p_member_role VARCHAR(50),
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    IF EXISTS (SELECT 1 FROM memberships WHERE organization_id = p_organization_id AND user_id = p_user_id) THEN
        SET p_status_code = 409;
        SET p_status_message = 'User already holds a leadership portfolio in this club.';
        LEAVE proc_label;
    END IF;

    INSERT INTO memberships (organization_id, user_id, member_role)
    VALUES (p_organization_id, p_user_id, p_member_role);

    SET p_status_code = 201;
    SET p_status_message = 'Committee membership assigned successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 8: sp_remove_club_membership
-- Removes a member from an organization hierarchy
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_remove_club_membership(
    IN p_membership_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DELETE FROM memberships WHERE membership_id = p_membership_id;
    SET p_status_code = 200;
    SET p_status_message = 'Committee membership revoked successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 9: sp_delete_announcement
-- Removes an announcement notice
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_delete_announcement(
    IN p_announcement_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DELETE FROM announcements WHERE announcement_id = p_announcement_id;
    SET p_status_code = 200;
    SET p_status_message = 'Announcement deleted successfully.';
END$$

-- ----------------------------------------------------------------------------
-- Procedure 10: sp_authenticate_user
-- Verifies user login credentials (email or roll number + password)
-- Returns user details, role, and committee chairperson (CP) status
-- ----------------------------------------------------------------------------
CREATE PROCEDURE sp_authenticate_user(
    IN p_identifier VARCHAR(150),
    IN p_password VARCHAR(255),
    OUT p_user_id INT,
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_user_id INT;
    DECLARE v_stored_pwd VARCHAR(255);

    -- Find user by email or roll_no
    SELECT user_id, password_hash INTO v_user_id, v_stored_pwd
    FROM users
    WHERE LOWER(email) = LOWER(p_identifier) 
       OR (roll_no IS NOT NULL AND roll_no = p_identifier)
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SET p_status_code = 404;
        SET p_status_message = 'Invalid credentials: User not found.';
        LEAVE proc_label;
    END IF;

    IF v_stored_pwd != p_password THEN
        SET p_status_code = 401;
        SET p_status_message = 'Invalid credentials: Password incorrect.';
        LEAVE proc_label;
    END IF;

    SET p_user_id = v_user_id;
    SET p_status_code = 200;
    SET p_status_message = 'Authentication successful.';
END$$

DELIMITER ;

-- ============================================================================
-- SECTION 7: VERIFICATION & VIVA QUERIES
-- ============================================================================

-- Query 1: Display all 9 tables record counts to verify complete population
SELECT 'roles' AS table_name, COUNT(*) AS total_rows FROM roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'venues', COUNT(*) FROM venues
UNION ALL
SELECT 'memberships', COUNT(*) FROM memberships
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements;

-- Query 2: Test vw_approved_upcoming_events view
SELECT * FROM vw_approved_upcoming_events;

-- Query 3: Test vw_club_leadership_directory view
SELECT * FROM vw_club_leadership_directory;

-- Query 4: Test vw_event_feedback_analytics view
SELECT * FROM vw_event_feedback_analytics;

-- ============================================================================
-- END OF SQL SCRIPT
-- ============================================================================
