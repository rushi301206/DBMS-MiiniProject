# College Clubs and Committees Event Management System
**Autonomous Institute:** Bharatiya Vidya Bhavan's Sardar Patel Institute of Technology (SPIT), Mumbai  
**Course:** CSE-SY Database Management Systems (Mini-Project)  
**Authors:** Rushikesh Amol Patil (UID: 2025800093) & Vighnesh Deepak Pawar (UID: 2025800098)  
**Target RDBMS:** MySQL 8.0+  

---

## 📌 Project Overview
The **College Clubs and Committees Event Management System** is a centralized relational database and web management portal designed to eliminate spreadsheet redundancies, scheduling conflicts, and manual approval delays across college student chapters, technical councils, and cultural committees.

The schema is normalized to **Third Normal Form (3NF)** and features **9 interconnected tables** with comprehensive referential integrity constraints, automated business logic triggers, analytical views, and stored procedures.

---

## 📁 Repository Structure
```text
DBMS/
│
├── College_Clubs_Event_Management_Abstract.pdf   # Project abstract & specifications
├── college_clubs_event_management.sql           # Complete MySQL 8.0+ master script
├── run_frontend.bat                             # One-click launcher for frontend
├── README.md                                    # Project documentation & execution guide
│
└── frontend/                                    # Frontend Application
    ├── index.html                               # Responsive Single Page Application
    ├── css/
    │   └── styles.css                           # Clean, elegant academic UI styling
    └── js/
        ├── data.js                              # Initial 3NF seed dataset from abstract
        └── app.js                               # Application state, triggers & UI controllers
```

---

## 💻 Frontend Interfaces Built (Simple & Clean UI)

We designed a clean, intuitive, and modern UI following academic best practices. It incorporates **9 dedicated interfaces**:

1. **📅 Events Hub**:
   - Browse upcoming and completed events.
   - Live search by keyword, filter by club/committee, venue, and status.
   - Real-time seat capacity tracker (with capacity % progress bars).
   - Instant "Register Now" action respecting capacity and approval constraints.

2. **🎟️ My Registrations & History**:
   - Displays student's personal event portfolio.
   - Live participation status (`Registered`, `Attended`, `Absent`, `Cancelled`).
   - 1:1 Post-event feedback trigger: Attended students can click **⭐ Give Feedback** to rate (1–5 stars) and review.

3. **🏛️ Clubs & Committees Directory**:
   - Roster for all 6 organizations: ACSES, CSI, IEEE, E-Cell, Mudra (Cultural), and Sports Committee.
   - Maps Faculty Advisors (Dr. Anand Godbole) and the 3-tier student committee hierarchy (Supercore, Core, and Subcommittee heads).

4. **📢 Campus Announcements Noticeboard**:
   - Central broadcast channel for Hackathon calls, audition schedules, and fixture releases.
   - Committee heads can post new announcements with auto-timestamping.

5. **➕ Propose Event (Core Member Desk)**:
   - Form for club leaders to propose new events with date, venue, seats, and agenda.
   - Automatic venue capacity limit hints and validation.

6. **🛡️ Faculty & Admin Approvals Desk**:
   - Approval queue for Faculty Advisors and Administrators (Dr. Godbole & Dr. Chaudhari).
   - **Automated Venue Conflict Detector**: Simulates the database trigger `trg_prevent_venue_clash_insert` and alerts if a venue is already booked on that date before allowing approval.

7. **👥 Attendance Desk (Event Coordinators)**:
   - Event coordinators can view the attendee roster for any event.
   - One-click buttons to mark participants as **Attended** or **Absent**, which enables students to submit verified feedback.

8. **📊 Analytics & Feedback Reports**:
   - Aggregates average ratings, turnout percentages, and attendee reviews.
   - Direct frontend representation of the database view `vw_event_feedback_analytics`.

9. **🗄️ Relational DBMS 3NF Table Explorer**:
   - Interactive live viewer for all **9 database tables**.
   - Inspect raw records, foreign keys, and constraints directly from the browser.
   - Includes a **"Reset DB to Abstract Data"** button to restore initial state anytime.

---

## 👤 Persona Switcher (Top Right Bar)
You can test the entire workflow from different perspectives by clicking the top right dropdown:
- **Rushikesh Patil** (Student & ACSES Creatives Head)
- **Vighnesh Pawar** (Student & ACSES Marketing Head / CSI Chair)
- **Mihir Pukale** (Student & ACSES Chairperson)
- **Dr. Anand Godbole** (Faculty Advisor)
- **Dr. B. N. Chaudhari** (Principal / Administrator)

---

## 🏛️ 4-Tier Institutional Hierarchy & Dynamic Interface Gateway

The portal features an **Institutional Role Gateway** at the start of the site that dynamically tailors visible options, actions, and navigation desks according to the college hierarchy:

```
┌────────────────────────────────────────────────────────┐
│               1. DEANS & PRINCIPALS                    │
│      Apex Institutional Governance & 3NF Database      │
├────────────────────────────────────────────────────────┤
│             2. FACULTY MENTORS & ADVISORS              │
│       Academic Oversight & Event Venue Sanctioning     │
├────────────────────────────────────────────────────────┤
│           3. COMMITTEE CPs & VCPs (2-3 PER CLUB)       │
│        Event Proposing, Rosters & Attendance Desks     │
├────────────────────────────────────────────────────────┤
│         4. COMMITTEE MEMBERS & GENERAL STUDENTS        │
│       Event Discovery, 1-Click RSVP & Verified 5★      │
└────────────────────────────────────────────────────────┘
```

### Hierarchy Access & Authority Matrix

| Feature / Workspace Action | 🏛️ Tier 1: Deans & Principals | 👨‍🏫 Tier 2: Faculty Mentors | 🏆 Tier 3: Committee CPs & VCPs | 👥 Tier 4: Members & Students |
| :--- | :---: | :---: | :---: | :---: |
| **Visible Desks / Tabs** | Approvals, Users, Notices, Analytics, Events, Clubs, 3NF Tables | Approvals, Events, Clubs, Users, Analytics, Notices | Propose Event, Attendance, Users, Events, Notices, Feedback, Clubs | Events Hub, My Tickets, Ratings & Feedback, Clubs, Notices |
| **Event Approvals & Veto** | ✅ Final Institutional Approval / Veto | ✅ Sanction Proposals (checks venue clash) | ❌ *Restricted (Hidden)* | ❌ *Restricted (Hidden)* |
| **Propose Events & Venues** | ✅ Root Admin Override | ✅ Advisory Proposals | ✅ Full Authority (with capacity hints) | ❌ *Restricted (Hidden)* |
| **Add / Delete User Profiles** | ✅ Any User Role | ✅ Students & Core Members | ✅ Committee Members within Own Club Only *(Cannot delete Admins/Faculty)* | ❌ *Access Denied (403 Forbidden)* |
| **Assign Club Portfolios** | ✅ Full Authority | ✅ Full Authority | ✅ Within their committee | ❌ *Restricted (Hidden)* |
| **Attendance Check-In** | ✅ Audit Attendance | ✅ Review Turnout Trends | ✅ Mark Attended / Absent (Own Club Only) | ❌ *Restricted (Hidden)* |
| **Event Registration (RSVP)** | Optional | Optional | Club Event Oversight | ✅ Live Seat Tracking & 1-Click RSVP |
| **Submit Verified Feedback** | View Analytics | View Analytics | View Club Feedback | ✅ 1-to-5★ Ratings (Attended only) |
| **Campus Announcements** | Official College Circulars & Delete Any | Faculty Notices & Delete Advised Club Notices | Post Club Notices & Delete Own Club Notices | Post for Affiliated Club & **Delete Own Notices Only** *(Other notices are 🔒 Protected)* |
| **DBMS 3NF Table Inspector** | ✅ Live SQL Schema & Integrity Check | ❌ *Restricted (Hidden)* | ❌ *Restricted (Hidden)* | ❌ *Restricted (Hidden)* |

---

### 🔑 Complete Demo Credentials (Organized by 4 Tiers)

| Hierarchy Tier | Official Persona | Role / Committee | Identifier (Email / Roll No) | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Deans & Principals** | **Dr. B. N. Chaudhari** | Principal | `principal@spit.ac.in` | `admin@123` |
| | **Dr. Y. S. Rao** | Dean Academics & R&D | `dean.acad@spit.ac.in` | `dean@123` |
| **Tier 2: Faculty Mentors** | **Dr. Anand Godbole** | Faculty Advisor (CMPN) | `anand.godbole@spit.ac.in` | `faculty@123` |
| | **Prof. Rajiv Mehta** | Industry & Alumni Mentor | `rajiv.mehta@spit.ac.in` | `mentor@123` |
| **Tier 3: Committee CPs & VCPs** | **Mihir Pukale** | ACSES Chairperson (CP) | `mihir.pukale@spit.ac.in` / `2023300001` | `acses@123` |
| | **Tanvi Shah** | ACSES Vice Chairperson (VCP) | `tanvi.shah@spit.ac.in` / `2023300012` | `tanvi@123` |
| | **Vighnesh Pawar** | CSI-SPIT Chairperson (CP) | `vighnesh.pawar@spit.ac.in` / `2025800098` | `csi@123` |
| | **Siddharth Nair** | CSI-SPIT Vice Chairperson (VCP) | `siddharth.nair@spit.ac.in` / `2023300045` | `siddharth@123` |
| **Tier 4: Members & Students** | **Rushikesh Patil** | Student & Creatives Head | `rushikesh.patil@spit.ac.in` / `2025800093` | `rushikesh@123` |
| | **Arjun Thakur** | Student & Secretary | `arjun.thakur@spit.ac.in` / `2023300003` | `arjun@123` |
| | **Priya Sharma** | Student Attendee | `priya.sharma@spit.ac.in` / `2023300088` | `student@123` |

> *Note: When opening the website or link, you are immediately greeted by the **Initial Login Screen Gate**. For fast evaluation with your professor, all demo usernames and passwords are displayed in brackets directly below the input fields. Clicking any bracketed credential automatically signs you in and transitions into that user's customized interface! You can click **"🚪 Log Out"** at any time to return to this screen.*

---

## 🚀 How to Run the Project

### Option A: Complete Full-Stack (Backend + Frontend) [Recommended]
```powershell
cd c:\Users\Rushikesh\Desktop\DBMS
node backend/server.js
```
Then open `http://localhost:5000` in your web browser.

### Option B: Standalone Frontend (No setup needed)
Double-click `run_frontend.bat` or open `frontend/index.html` directly in any web browser.

### Option C: Import into MySQL (For Database Lab / Viva)
Open MySQL Workbench or PowerShell:
```powershell
mysql -u root -p < "c:\Users\Rushikesh\Desktop\DBMS\college_clubs_event_management.sql"
```
