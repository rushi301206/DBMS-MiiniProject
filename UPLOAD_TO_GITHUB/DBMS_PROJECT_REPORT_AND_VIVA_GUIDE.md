# College Clubs and Committees Event Management System
## Mini-Project Report & Comprehensive DBMS Lab Viva Guide

**Autonomous Institute:** Bharatiya Vidya Bhavan's Sardar Patel Institute of Technology (SPIT), Mumbai  
**Department:** Computer Science and Engineering  
**Academic Year:** 2026 - 2027 | Semester III (CSE-SY)  
**Authors:**  
- **Rushikesh Amol Patil** (UID: 2025800093)  
- **Vighnesh Deepak Pawar** (UID: 2025800098)  
**Target RDBMS:** MySQL 8.0+  
**Architecture:** 3-Tier Web Application (Vanilla JS Frontend + Node.js/Express REST API + MySQL 8.0)  

---

## 1. Executive Summary & Problem Definition
Colleges conduct dozens of technical hackathons, cultural fests, workshops, and sports tournaments every semester through student chapters (ACSES, CSI, IEEE, E-Cell, Mudra, Sports Committee). Historically, these clubs functioned through disparate Google Spreadsheets, WhatsApp groups, and paper-based approval slips.

### Key Pain Points Solved
1. **Venue Scheduling Clashes**: Two committees accidentally booking the SPIT Auditorium or CCF at the same time.
2. **Double Registrations & Capacity Overflow**: Students registering multiple times or events exceeding safety capacities.
3. **Ghost Attendees & Unverified Feedback**: Inability to verify who actually attended before collecting ratings.
4. **Scattered Announcements**: Lost notice updates and missed deadlines across disparate chat groups.

---

## 2. 3NF Relational Schema Architecture

Our schema comprises **9 interconnected entities**, normalized up to **Third Normal Form (3NF)**:

```
[roles] 1 ────< N [users] 1 ────< N [memberships] >──── 1 [organizations]
                     │                                         │
                     │ (advises)                               │ (organizes)
                     └─────────────────┐                       │
                                       ▼                       ▼
[venues] 1 ───────────────────< N [events] <───────────────────┘
                                   │
                                   │ (registers)
                                   ▼
 [feedback] 1 ────────── 1 [registrations]
                                   ▲
                                   │
[users] 1 ─────────────────────────┘
```

### Table Specifications & Referential Integrity

| Table Name | Primary Key | Foreign Key References | Integrity Action (ON UPDATE / ON DELETE) |
|---|---|---|---|
| `roles` | `role_id` | None | N/A |
| `users` | `user_id` | `role_id → roles(role_id)` | `CASCADE` / `RESTRICT` |
| `organizations` | `organization_id` | `faculty_advisor_id → users(user_id)` | `CASCADE` / `SET NULL` |
| `venues` | `venue_id` | None | N/A |
| `memberships` | `membership_id` | `organization_id → organizations`<br>`user_id → users` | `CASCADE` / `CASCADE` |
| `events` | `event_id` | `organization_id → organizations`<br>`venue_id → venues`<br>`created_by → users`<br>`approved_by → users` | `CASCADE` / `CASCADE`<br>`CASCADE` / `RESTRICT`<br>`CASCADE` / `RESTRICT`<br>`CASCADE` / `SET NULL` |
| `registrations` | `registration_id` | `event_id → events`<br>`user_id → users` | `CASCADE` / `CASCADE` |
| `feedback` | `feedback_id` | `registration_id → registrations` | `CASCADE` / `CASCADE` |
| `announcements` | `announcement_id` | `organization_id → organizations`<br>`created_by → users` | `CASCADE` / `CASCADE` |

---

## 3. Normalization Breakdown (1NF $\rightarrow$ 2NF $\rightarrow$ 3NF)

### First Normal Form (1NF)
- **Rule**: Every attribute must be atomic (no multi-valued attributes or repeating groups).
- **Implementation**: Multi-member clubs are not stored as comma-separated lists in `organizations`. Instead, individual memberships are decomposed into atomic rows in the `memberships` table.

### Second Normal Form (2NF)
- **Rule**: Must be in 1NF and have NO partial dependencies (all non-key attributes must be fully functionally dependent on the entire primary key).
- **Implementation**: In bridge tables like `registrations` and `memberships`, artificial surrogate primary keys (`registration_id`, `membership_id`) are used, with composite unique keys. Attributes like `participation_status` depend strictly on the complete event-student registration record.

### Third Normal Form (3NF)
- **Rule**: Must be in 2NF and have NO transitive dependencies ($X \rightarrow Y$ and $Y \rightarrow Z$).
- **Implementation**: 
  - `department` and `role_name` are separated. `role_name` is factored out into `roles` rather than repeating strings in `users`.
  - `venue_name` and `capacity` are normalized into `venues`. Events only reference `venue_id`. If a venue's capacity changes, it is updated in exactly one row without data anomaly.
  - Feedback attributes (`rating`, `comments`) are separated into `feedback` table, maintaining a 1:1 relation with `registrations`.

---

## 4. Database Triggers (Advanced Integrity & Business Logic)

### Trigger 1 & 2: Venue Conflict Prevention (`trg_prevent_venue_clash_insert` & `trg_prevent_venue_clash_update`)
- **Purpose**: Prevents double-booking a venue on the same date for approved events.
- **Mechanism**:
```sql
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
```

### Trigger 3: Participant Capacity & Approval Check (`trg_check_registration_rules`)
- **Purpose**: Enforces that students cannot register for an unapproved/cancelled event or after max seats are booked.
```sql
IF v_current_registrations >= v_max_participants THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Registration Error: Event participant capacity limit has been reached.';
END IF;
```

### Trigger 4: Attendance Verification for Feedback (`trg_validate_feedback_eligibility`)
- **Purpose**: Enforces that only students who actually attended the event can provide ratings.
```sql
IF v_status != 'Attended' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Feedback Error: Feedback can only be submitted for attended events.';
END IF;
```

---

## 5. Top 10 Viva Questions & Model Answers

### Q1: Why did you use `SET NULL` for `faculty_advisor_id` and `approved_by` instead of `CASCADE`?
> **Answer:** "If a faculty advisor leaves the institution or their account is modified, we do not want to delete the entire student organization or historical event records. Using `ON DELETE SET NULL` preserves historical event audits while cleanly disassociating the faculty reference."

### Q2: Why is `roll_no` unique in `users`, but faculty have `NULL` values? Does MySQL allow multiple `NULL`s in a `UNIQUE` column?
> **Answer:** "Yes! According to the SQL standard and InnoDB in MySQL, `NULL` represents an unknown value. Consequently, multiple rows can have `NULL` in a unique column without violating uniqueness. This allows faculty and administrators to have `NULL` roll numbers while ensuring no two students can share a roll number."

### Q3: How do you enforce a 1:1 relationship between `registrations` and `feedback`?
> **Answer:** "We place a `UNIQUE` constraint on `feedback.registration_id` alongside the foreign key reference. This strictly guarantees that a given registration record can have at most one corresponding feedback row."

### Q4: What is the difference between a Stored Procedure and a Trigger in your project?
> **Answer:** "A **trigger** executes automatically in response to DML operations (`INSERT`, `UPDATE`, `DELETE`) to enforce data integrity invariants (e.g., checking venue conflicts). A **stored procedure** (e.g., `sp_register_for_event`) is explicitly called by our backend application to orchestrate multi-step business transactions."

### Q5: How does your system prevent SQL Injection?
> **Answer:** "In our Node.js backend with `mysql2`, we exclusively use **parameterized queries** with placeholder markers (`?`). Input values are never concatenated directly into SQL strings, preventing injection attacks."

---

## 6. How to Run the Complete Stack

### Option A: Complete Full-Stack Application (Frontend + Express API + MySQL)
1. Configure `backend/.env` with your MySQL root password:
   ```env
   DB_PASSWORD=your_root_password
   ```
2. Initialize database: Double click **`setup_mysql_database.bat`** (or run `npm run setup-db` inside `backend/`).
3. Start backend: Double click **`run_backend.bat`** (or run `npm start` inside `backend/`).
4. Access the web app in your browser at: **`http://localhost:5000`**.

### Option B: Instant Standalone Frontend Mode
Simply double-click **`run_frontend.bat`** or open **`frontend/index.html`** in any browser. It operates seamlessly with built-in localStorage and mock seed data!
