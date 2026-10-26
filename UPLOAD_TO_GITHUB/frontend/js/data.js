/**
 * Database State matching SPIT Clubs & Committees
 * (ACSES, CSI-SPIT, IEEE-SPIT, E-Cell SPIT, Mudra Cultural, Sports Committee)
 * Normalized up to 3NF.
 */

const INITIAL_DB = {
    roles: [
        { role_id: 1, role_name: 'Student' },
        { role_id: 2, role_name: 'Faculty' },
        { role_id: 3, role_name: 'Administrator' },
        { role_id: 4, role_name: 'Mentor' }
    ],

    users: [
        { user_id: 1, role_id: 3, full_name: 'Dr. B. N. Chaudhari', email: 'principal@spit.ac.in', roll_no: null, department: 'Administration', password: 'admin@123' },
        { user_id: 8, role_id: 3, full_name: 'Dr. Y. S. Rao', email: 'dean.acad@spit.ac.in', roll_no: null, department: 'Academic Affairs & R&D', password: 'dean@123' },
        { user_id: 2, role_id: 2, full_name: 'Dr. Anand Godbole', email: 'anand.godbole@spit.ac.in', roll_no: null, department: 'Computer Engineering', password: 'faculty@123' },
        { user_id: 7, role_id: 4, full_name: 'Prof. Rajiv Mehta', email: 'rajiv.mehta@spit.ac.in', roll_no: null, department: 'Industry & Alumni Mentorship', password: 'mentor@123' },
        { user_id: 3, role_id: 1, full_name: 'Mihir Pukale', email: 'mihir.pukale@spit.ac.in', roll_no: '2023300001', department: 'Computer Engineering', password: 'acses@123' },
        { user_id: 9, role_id: 1, full_name: 'Tanvi Shah', email: 'tanvi.shah@spit.ac.in', roll_no: '2023300012', department: 'Computer Engineering', password: 'tanvi@123' },
        { user_id: 5, role_id: 1, full_name: 'Vighnesh Pawar', email: 'vighnesh.pawar@spit.ac.in', roll_no: '2025800098', department: 'Computer Engineering', password: 'csi@123' },
        { user_id: 10, role_id: 1, full_name: 'Siddharth Nair', email: 'siddharth.nair@spit.ac.in', roll_no: '2023300045', department: 'Computer Engineering', password: 'siddharth@123' },
        { user_id: 4, role_id: 1, full_name: 'Rushikesh Patil', email: 'rushikesh.patil@spit.ac.in', roll_no: '2025800093', department: 'Computer Engineering', password: 'rushikesh@123' },
        { user_id: 6, role_id: 1, full_name: 'Arjun Thakur', email: 'arjun.thakur@spit.ac.in', roll_no: '2023300003', department: 'Computer Engineering', password: 'arjun@123' },
        { user_id: 11, role_id: 1, full_name: 'Priya Sharma', email: 'priya.sharma@spit.ac.in', roll_no: '2023300088', department: 'Information Technology', password: 'student@123' }
    ],

    organizations: [
        { organization_id: 1, org_name: 'ACSES', description: 'Association of Computer Science & Engineering Students - Departmental techno-cultural council', faculty_advisor_id: 2 },
        { organization_id: 2, org_name: 'CSI-SPIT', description: 'Computer Society of India SPIT Chapter - Organizers of S.P.I.T. Hackathon & tech sprints', faculty_advisor_id: 2 },
        { organization_id: 3, org_name: 'IEEE-SPIT', description: 'IEEE SPIT Student Branch - Technical innovation, research conferences, and HackFusion', faculty_advisor_id: 2 },
        { organization_id: 4, org_name: 'E-Cell SPIT', description: 'Entrepreneurship Cell SPIT - Startup incubation hub, E-Summit, and angel pitching', faculty_advisor_id: 2 },
        { organization_id: 5, org_name: 'Mudra (Cultural)', description: 'Mudra Cultural Committee - Overseeing dance, music (Sargam), dramatics, and Oculus', faculty_advisor_id: 2 },
        { organization_id: 6, org_name: 'SPIT Sports', description: 'SPIT Sports Committee - Organizing SPoorthi inter-college fest and Agility intra-leagues', faculty_advisor_id: 2 }
    ],

    venues: [
        { venue_id: 1, venue_name: 'SPIT Auditorium', capacity: 350 },
        { venue_id: 2, venue_name: 'Seminar Hall 008', capacity: 150 },
        { venue_id: 3, venue_name: 'Central Computing Facility (CCF)', capacity: 120 },
        { venue_id: 4, venue_name: 'Computer Lab 202', capacity: 60 },
        { venue_id: 5, venue_name: 'College Quadrangle', capacity: 500 }
    ],

    memberships: [
        { membership_id: 1, organization_id: 1, user_id: 3, member_role: 'Chairperson' },
        { membership_id: 2, organization_id: 1, user_id: 9, member_role: 'Vice Chairperson' },
        { membership_id: 3, organization_id: 1, user_id: 4, member_role: 'Creatives Head' },
        { membership_id: 4, organization_id: 1, user_id: 6, member_role: 'Secretary' },
        { membership_id: 5, organization_id: 2, user_id: 5, member_role: 'Chairperson' },
        { membership_id: 6, organization_id: 2, user_id: 10, member_role: 'Vice Chairperson' },
        { membership_id: 7, organization_id: 4, user_id: 4, member_role: 'Finance Secretary' },
        { membership_id: 8, organization_id: 2, user_id: 11, member_role: 'Subcommittee Member' },
        { membership_id: 9, organization_id: 4, user_id: 7, member_role: 'Mentor' }
    ],

    events: [
        { 
            event_id: 1, 
            organization_id: 1, 
            venue_id: 3, 
            created_by: 3, 
            approved_by: 1, 
            event_name: 'CodeBash 2026', 
            description: 'Departmental competitive programming and algorithm hackathon on HackerRank.', 
            event_date: '2026-10-25', 
            max_participants: 100, 
            approval_status: 'Approved', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 2, 
            organization_id: 1, 
            venue_id: 4, 
            created_by: 4, 
            approved_by: 1, 
            event_name: 'Design & UI/UX Sprint', 
            description: 'Hands-on UI/UX product design sprint with Figma prototyping and design systems.', 
            event_date: '2026-09-15', 
            max_participants: 50, 
            approval_status: 'Approved', 
            event_status: 'Completed' 
        },
        { 
            event_id: 3, 
            organization_id: 1, 
            venue_id: 2, 
            created_by: 5, 
            approved_by: 1, 
            event_name: 'Brand & Marketing Summit', 
            description: 'Interactive session on brand positioning, student outreach, and content creation.', 
            event_date: '2026-11-05', 
            max_participants: 80, 
            approval_status: 'Approved', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 4, 
            organization_id: 4, 
            venue_id: 1, 
            created_by: 3, 
            approved_by: 1, 
            event_name: 'E-Summit: Shark Tank SPIT', 
            description: 'Annual entrepreneurship pitch competition before angel investors, VCs, and alumni.', 
            event_date: '2026-11-20', 
            max_participants: 250, 
            approval_status: 'Approved', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 5, 
            organization_id: 5, 
            venue_id: 5, 
            created_by: 6, 
            approved_by: 1, 
            event_name: 'Tarang: Cultural Showcase', 
            description: 'Intra-college cultural extravaganza featuring live music, classical dance, and theater.', 
            event_date: '2026-09-22', 
            max_participants: 400, 
            approval_status: 'Approved', 
            event_status: 'Completed' 
        },
        { 
            event_id: 6, 
            organization_id: 6, 
            venue_id: 5, 
            created_by: 5, 
            approved_by: null, 
            event_name: 'Agility Cup: Football League', 
            description: 'Inter-department 7v7 football championship league matches on college ground.', 
            event_date: '2026-12-02', 
            max_participants: 150, 
            approval_status: 'Pending', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 7, 
            organization_id: 2, 
            venue_id: 1, 
            created_by: 5, 
            approved_by: 1, 
            event_name: 'The S.P.I.T. Hackathon 2026', 
            description: 'Premier 24-hour national offline hackathon across Web3, AI/ML, and FinTech domains.', 
            event_date: '2026-12-14', 
            max_participants: 300, 
            approval_status: 'Approved', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 8, 
            organization_id: 2, 
            venue_id: 3, 
            created_by: 5, 
            approved_by: 2, 
            event_name: 'unSQLved: Query & Schema Debugging', 
            description: 'High-speed relational database debugging challenge solving complex SQL queries and 3NF anomalies.', 
            event_date: '2026-10-10', 
            max_participants: 100, 
            approval_status: 'Approved', 
            event_status: 'Completed' 
        },
        { 
            event_id: 9, 
            organization_id: 3, 
            venue_id: 1, 
            created_by: 4, 
            approved_by: 1, 
            event_name: 'HackFusion 2026: Hybrid Hackathon', 
            description: 'Flagship 24-hour hybrid hackathon co-hosted by IEEE Bombay Section with real-world industry tracks.', 
            event_date: '2026-11-12', 
            max_participants: 250, 
            approval_status: 'Approved', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 10, 
            organization_id: 3, 
            venue_id: 2, 
            created_by: 3, 
            approved_by: 2, 
            event_name: 'Aeravat: AI & Deep Learning Summit', 
            description: 'Specialized symposium on Large Language Models, vision transformers, and clinical diagnostic AI.', 
            event_date: '2026-11-28', 
            max_participants: 120, 
            approval_status: 'Approved', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 11, 
            organization_id: 4, 
            venue_id: 2, 
            created_by: 4, 
            approved_by: 2, 
            event_name: 'Avalanche: Crisis Management Challenge', 
            description: 'High-intensity corporate PR and boardroom simulation testing strategic adaptation under market panic.', 
            event_date: '2026-10-05', 
            max_participants: 75, 
            approval_status: 'Approved', 
            event_status: 'Completed' 
        },
        { 
            event_id: 12, 
            organization_id: 5, 
            venue_id: 1, 
            created_by: 6, 
            approved_by: 1, 
            event_name: 'Oculus: Sargam Inter-College Singing', 
            description: 'Flagship intra- and inter-collegiate solo and band singing showdown under the annual Oculus festival.', 
            event_date: '2026-10-18', 
            max_participants: 320, 
            approval_status: 'Approved', 
            event_status: 'Completed' 
        },
        { 
            event_id: 13, 
            organization_id: 6, 
            venue_id: 5, 
            created_by: 5, 
            approved_by: 1, 
            event_name: 'SPoorthi: Inter-Collegiate Cricket Cup', 
            description: 'Premier 8-team inter-engineering box cricket championship on the college grounds with live scoring.', 
            event_date: '2026-12-18', 
            max_participants: 200, 
            approval_status: 'Approved', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 14, 
            organization_id: 6, 
            venue_id: 5, 
            created_by: 3, 
            approved_by: null, 
            event_name: 'SPIT Marathon: Run for Mental Health', 
            description: 'Annual 5K and 10K campus marathon traversing Juhu-Andheri to raise awareness for student well-being.', 
            event_date: '2026-12-28', 
            max_participants: 350, 
            approval_status: 'Pending', 
            event_status: 'Upcoming' 
        },
        { 
            event_id: 15, 
            organization_id: 2, 
            venue_id: 4, 
            created_by: 4, 
            approved_by: 2, 
            event_name: 'Pixel Perfect: UI/UX Design Sprint', 
            description: 'Rapid 4-hour Figma design battle building interactive mobile prototypes and design tokens.', 
            event_date: '2026-09-28', 
            max_participants: 50, 
            approval_status: 'Approved', 
            event_status: 'Completed' 
        }
    ],

    registrations: [
        { registration_id: 1, event_id: 2, user_id: 3, participation_status: 'Attended', registered_at: '2026-09-10' },
        { registration_id: 2, event_id: 2, user_id: 5, participation_status: 'Attended', registered_at: '2026-09-11' },
        { registration_id: 3, event_id: 2, user_id: 6, participation_status: 'Attended', registered_at: '2026-09-12' },
        { registration_id: 4, event_id: 5, user_id: 3, participation_status: 'Attended', registered_at: '2026-09-18' },
        { registration_id: 5, event_id: 5, user_id: 4, participation_status: 'Attended', registered_at: '2026-09-19' },
        { registration_id: 6, event_id: 1, user_id: 5, participation_status: 'Registered', registered_at: '2026-10-20' },
        { registration_id: 7, event_id: 8, user_id: 4, participation_status: 'Attended', registered_at: '2026-10-02' },
        { registration_id: 8, event_id: 8, user_id: 5, participation_status: 'Attended', registered_at: '2026-10-03' },
        { registration_id: 9, event_id: 8, user_id: 3, participation_status: 'Attended', registered_at: '2026-10-04' },
        { registration_id: 10, event_id: 11, user_id: 3, participation_status: 'Attended', registered_at: '2026-09-29' },
        { registration_id: 11, event_id: 11, user_id: 6, participation_status: 'Attended', registered_at: '2026-09-30' },
        { registration_id: 12, event_id: 12, user_id: 4, participation_status: 'Attended', registered_at: '2026-10-12' },
        { registration_id: 13, event_id: 12, user_id: 5, participation_status: 'Attended', registered_at: '2026-10-13' },
        { registration_id: 14, event_id: 15, user_id: 3, participation_status: 'Attended', registered_at: '2026-09-24' },
        { registration_id: 15, event_id: 15, user_id: 5, participation_status: 'Attended', registered_at: '2026-09-25' },
        { registration_id: 16, event_id: 7, user_id: 4, participation_status: 'Registered', registered_at: '2026-10-24' },
        { registration_id: 17, event_id: 9, user_id: 3, participation_status: 'Registered', registered_at: '2026-10-25' }
    ],

    feedback: [
        { feedback_id: 1, registration_id: 1, rating: 5, comments: 'Great hands-on design sprint! Figma prototyping was explained thoroughly.' },
        { feedback_id: 2, registration_id: 2, rating: 5, comments: 'Exceptional creative branding session. Marketing materials insights were practical.' },
        { feedback_id: 3, registration_id: 3, rating: 4, comments: 'Very insightful technical workshop organized by ACSES.' },
        { feedback_id: 4, registration_id: 4, rating: 5, comments: 'Tarang was electrifying! Stellar musical battles and great lighting.' },
        { feedback_id: 5, registration_id: 5, rating: 5, comments: 'Flawless event coordination and vibrant performances by the cultural squad.' },
        { feedback_id: 6, registration_id: 7, rating: 5, comments: 'The unSQLved schema debugging round was brilliant! Solved real ACID compliance puzzles.' },
        { feedback_id: 7, registration_id: 8, rating: 5, comments: 'Challenging query optimization puzzles. Loved the competitive edge of CSI.' },
        { feedback_id: 8, registration_id: 10, rating: 5, comments: 'Intense crisis scenario! Boardroom simulation felt like a real venture capital meeting.' },
        { feedback_id: 9, registration_id: 12, rating: 5, comments: 'Acoustics in the Auditorium were outstanding! Mudra team coordinated sound perfectly.' },
        { feedback_id: 10, registration_id: 14, rating: 5, comments: 'Great hands-on Figma design critique session by the design mentors.' }
    ],

    announcements: [
        { announcement_id: 1, organization_id: 1, created_by: 3, title: 'CodeBash 2026: Team Registrations Open', description: 'Registrations live on HackerRank! Teams of 2 to 3 before Oct 22.', posted_at: '2026-10-18' },
        { announcement_id: 2, organization_id: 1, created_by: 4, title: 'ACSES Creatives & Design Submissions', description: 'Call for banner artwork, event posters, and teaser video edits.', posted_at: '2026-09-05' },
        { announcement_id: 3, organization_id: 1, created_by: 5, title: 'ACSES Marketing & Sponsorship Drive', description: 'Applications invited for student marketing associates for annual symposium.', posted_at: '2026-10-22' },
        { announcement_id: 4, organization_id: 4, created_by: 3, title: 'Shark Tank SPIT: Pitch Deck Deadline', description: 'Submit 5-slide startup pitch deck by Nov 15 for investor pitches.', posted_at: '2026-10-24' },
        { announcement_id: 5, organization_id: 5, created_by: 6, title: 'Auditions for Mudra Dance Squad', description: 'Auditions for the annual intra-college dance troupe this Friday in Quadrangle.', posted_at: '2026-09-12' },
        { announcement_id: 6, organization_id: 6, created_by: 5, title: 'Agility Cup: Fixture Schedule Released', description: 'Inter-department cricket and football draws published on sports noticeboard.', posted_at: '2026-10-25' },
        { announcement_id: 7, organization_id: 2, created_by: 5, title: 'S.P.I.T. Hackathon 2026 Track Announcements', description: 'Tracks for AI/ML, Web3, and FinTech are live on Unstop. Register early to guarantee shortlisting.', posted_at: '2026-10-25' },
        { announcement_id: 8, organization_id: 3, created_by: 4, title: 'HackFusion 2026: Hybrid Hackathon Details', description: 'Joint international hackathon problem statements revealed. Hardware kits provided for shortlisted teams.', posted_at: '2026-10-26' },
        { announcement_id: 9, organization_id: 6, created_by: 5, title: 'SPoorthi Cricket Championship: Captains Meet', description: 'Inter-department cricket tournament captain briefing on Friday at 4 PM in CCF.', posted_at: '2026-10-26' }
    ]
};

// Database storage helper
const DB_STORAGE_KEY = 'SPIT_DBMS_EVENT_MGMT_DATA_V5';

function getStoredDB() {
    try {
        const raw = localStorage.getItem(DB_STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Error reading localStorage', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DB));
}

function saveStoredDB(db) {
    try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
        console.error('Error saving to localStorage', e);
    }
}

function resetStoredDB() {
    localStorage.removeItem(DB_STORAGE_KEY);
    return JSON.parse(JSON.stringify(INITIAL_DB));
}
