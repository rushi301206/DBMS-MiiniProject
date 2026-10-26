/**
 * SPIT College Clubs & Committees Event Management System
 * Core Application Controller - Tactile Elevated Cards & Minimalist Line Icons
 */

// Application State
let appDB = getStoredDB();
let currentUserId = 4; // Default: Rushikesh Patil (Student & Creatives Head)
let activeTab = 'events';
let isGatewayOpen = false;
let isAuthenticated = false; // Always gate access behind login screen

// 4-Tier Institutional Hierarchy Configuration
const TIER_CONFIG = {
    executive: {
        id: 'executive',
        level: 'Level 1: Apex Governance',
        title: 'Deans & Principals',
        workspaceTitle: 'Institutional Executive Office (Dean / Principal)',
        icon: '🏛️',
        badgeClass: 'badge-tier-executive',
        accentColor: '#153e35',
        desc: 'Institutional governance, final event approvals & veto authority, campus circulars, unrestricted user management & 3NF database schema audit.',
        authorities: [
            'Final Institutional Event Approval & Veto Power',
            'Full User Directory Authority (Add/Delete any user)',
            'Institute-wide Circulars & Announcements Broadcast',
            'Direct Access to Live MySQL 3NF Relational Tables',
            'Campus-wide Participation & Turnout Analytics'
        ],
        allowedTabs: ['approvals', 'users', 'announcements', 'analytics', 'events', 'clubs', 'dbms_schema'],
        defaultTab: 'approvals',
        defaultUserId: 1
    },
    faculty_mentor: {
        id: 'faculty_mentor',
        level: 'Level 2: Academic Oversight',
        title: 'Faculty Mentors & Advisors',
        workspaceTitle: 'Faculty Advisory & Mentorship Workspace',
        icon: '👨‍🏫',
        badgeClass: 'badge-tier-faculty',
        accentColor: '#2b554b',
        desc: 'Academic oversight, sanctioning club event proposals, verifying venue clash triggers, supervising student leaders & attendance turnout.',
        authorities: [
            'Sanction / Reject Club Event Proposals with Remarks',
            'Real-time Venue Collision Verification (Trigger Simulation)',
            'Add & Manage Student Leaders for Supervised Clubs',
            'Monitor Club Attendee Turnout & Quality Feedback Trends',
            'Broadcast Official Departmental & Faculty Notices'
        ],
        allowedTabs: ['approvals', 'events', 'clubs', 'users', 'analytics', 'announcements'],
        defaultTab: 'approvals',
        defaultUserId: 2
    },
    committee_cp_vcp: {
        id: 'committee_cp_vcp',
        level: 'Level 3: Executive Committee Leadership',
        title: 'Committee CPs & VCPs',
        workspaceTitle: 'Committee Executive Board (CP / VCP)',
        icon: '🏆',
        badgeClass: 'badge-tier-cp',
        accentColor: '#c45d2c',
        desc: 'Lead student chapters (ACSES, CSI, etc.), propose new events with venue reservations, manage member rosters (add/delete), coordinate attendance rosters.',
        authorities: [
            'Draft & Submit Event Proposals with Venue Booking',
            'Manage Committee Roster (Add / Delete Members & Volunteers)',
            'Take Attendance: Mark Participants as Attended / Absent',
            'Publish Audition Calls, Hackathon Deadlines & Notices',
            'Inspect Detailed Participant Feedback for Committee Events'
        ],
        allowedTabs: ['propose', 'attendance', 'users', 'events', 'announcements', 'analytics', 'clubs'],
        defaultTab: 'propose',
        defaultUserId: 3
    },
    committee_member: {
        id: 'committee_member',
        level: 'Level 4: Campus Participation & Operations',
        title: 'Committee Members & Students',
        workspaceTitle: 'Student & Committee Member Hub',
        icon: '👥',
        badgeClass: 'badge-tier-member',
        accentColor: '#4e6358',
        desc: 'Event discovery, real-time seat reservation, personal registration portfolio, verified 1-to-1 event feedback, committee directory.',
        authorities: [
            'Discover All Upcoming Campus Events & Competitions',
            '1-Click Event Registration with Live Seat Availability',
            'Personal Ticket Dashboard & Participation History',
            'Submit Verified 1-to-5 Star Ratings & Reviews for Attended Events',
            'Explore Student Chapters, Domain Portfolios & Faculty Mentors'
        ],
        allowedTabs: ['events', 'registrations', 'analytics', 'clubs', 'announcements'],
        defaultTab: 'events',
        defaultUserId: 4
    }
};

// Minimalist Line Icons (SVG - Image 2 Reference)
const ICONS = {
    calendar: `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    mapPin: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    user: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    users: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    search: `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    plus: `<svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    check: `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    bell: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h24s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    ticket: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    building: `<svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="3" y1="21" x2="21" y2="21"></line><line x1="3" y1="10" x2="21" y2="10"></line><polyline points="5 6 12 3 19 6"></polyline><line x1="4" y1="10" x2="4" y2="21"></line><line x1="20" y1="10" x2="20" y2="21"></line></svg>`,
    shield: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    chart: `<svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    database: `<svg class="icon icon-sm" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
    refresh: `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
    star: `<svg class="icon icon-sm" viewBox="0 0 24 24" style="fill: currentColor;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    trash: `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    userPlus: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`
};

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconSvg = ICONS.bell;
    if (type === 'success') iconSvg = ICONS.check;
    if (type === 'error') iconSvg = ICONS.shield;

    toast.innerHTML = `<span>${iconSvg}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3800);
}

// Helpers
function getUser(id) {
    return appDB.users.find(u => u.user_id === Number(id));
}

function getRole(id) {
    return appDB.roles.find(r => r.role_id === Number(id));
}

function getOrg(id) {
    return appDB.organizations.find(o => o.organization_id === Number(id));
}

function getVenue(id) {
    return appDB.venues.find(v => v.venue_id === Number(id));
}

function getEvent(id) {
    return appDB.events.find(e => e.event_id === Number(id));
}

function getRegistration(id) {
    return appDB.registrations.find(r => r.registration_id === Number(id));
}

function getFeedbackByRegId(regId) {
    return appDB.feedback.find(f => f.registration_id === Number(regId));
}

function getEventRegistrations(eventId) {
    return appDB.registrations.filter(r => r.event_id === Number(eventId) && r.participation_status !== 'Cancelled');
}

// Persist State
function persistDB() {
    saveStoredDB(appDB);
    renderMetrics();
}

// RBAC & Hierarchy Helpers
function isUserCommitteeLeader(userId) {
    if (!userId) return false;
    return appDB.memberships.some(m => 
        m.user_id === Number(userId) && 
        (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson')
    );
}

function isUserChairperson(userId) {
    return isUserCommitteeLeader(userId);
}

function getUserTier(userId) {
    const user = getUser(userId);
    if (!user) return 'committee_member';
    const role = getRole(user.role_id);
    if (!role) return 'committee_member';

    if (role.role_name === 'Administrator') return 'executive'; // Deans & Principals
    if (role.role_name === 'Faculty' || role.role_name === 'Mentor') return 'faculty_mentor'; // Faculty & Mentors
    if (isUserCommitteeLeader(userId)) return 'committee_cp_vcp'; // Committee CPs & VCPs
    return 'committee_member'; // Committee Members & Students
}

function isUserAuthorizedToManageUsers(userId) {
    const user = getUser(userId);
    if (!user) return false;
    const role = getRole(user.role_id);
    if (!role) return false;
    if (role.role_name === 'Administrator' || role.role_name === 'Faculty') return true;
    return isUserCommitteeLeader(userId);
}


// Granular Ownership & Scope Permission Helpers
function canUserDeleteAnnouncement(announcement) {
    if (!announcement || !currentUserId) return false;
    
    // 1. Author can ALWAYS delete their own announcement
    if (announcement.created_by === currentUserId) return true;

    const user = getUser(currentUserId);
    if (!user) return false;
    const role = getRole(user.role_id);
    if (!role) return false;

    // 2. Administrator (Deans / Principals) can moderate any campus announcement
    if (role.role_name === 'Administrator') return true;

    // 3. Faculty Advisor for this organization can delete
    const org = getOrg(announcement.organization_id);
    if (org && org.faculty_advisor_id === currentUserId) return true;

    // 4. Committee CP / VCP of THIS specific organization can delete
    const isClubLeader = appDB.memberships.some(m => 
        m.user_id === currentUserId && 
        m.organization_id === announcement.organization_id && 
        (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson')
    );
    if (isClubLeader) return true;

    // Committee members and students CANNOT delete announcements made by someone else!
    return false;
}

function canUserDeleteTargetUser(targetUserId) {
    if (!targetUserId || !currentUserId) return false;
    if (targetUserId === currentUserId) return false; // Cannot delete self

    const user = getUser(currentUserId);
    const target = getUser(targetUserId);
    if (!user || !target) return false;

    const myRole = getRole(user.role_id);
    const targetRole = getRole(target.role_id);
    if (!myRole || !targetRole) return false;

    // Tier 1: Administrator (Principal/Deans) can delete anyone
    if (myRole.role_name === 'Administrator') return true;

    // Tier 2: Faculty can delete students and mentors
    if (myRole.role_name === 'Faculty') {
        if (targetRole.role_name === 'Administrator') return false;
        return true;
    }

    // Tier 3: Committee CP / VCP
    const isMyLeader = isUserCommitteeLeader(currentUserId);
    if (isMyLeader) {
        // Cannot delete Administrator, Faculty, or Mentor
        if (targetRole.role_name === 'Administrator' || targetRole.role_name === 'Faculty' || targetRole.role_name === 'Mentor') {
            return false;
        }

        // Target must belong to one of the clubs where currentUserId is CP/VCP
        const myClubs = appDB.memberships
            .filter(m => m.user_id === currentUserId && (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson'))
            .map(m => m.organization_id);

        const targetClubs = appDB.memberships
            .filter(m => m.user_id === targetUserId)
            .map(m => m.organization_id);

        return myClubs.some(cId => targetClubs.includes(cId));
    }

    // Tier 4: Committee Members & Students CANNOT delete any user
    return false;
}

function canUserDeleteEvent(event) {
    if (!event || !currentUserId) return false;
    const user = getUser(currentUserId);
    if (!user) return false;
    const role = getRole(user.role_id);
    if (!role) return false;

    // Administrator or Faculty can delete
    if (role.role_name === 'Administrator' || role.role_name === 'Faculty') return true;

    // CP / VCP of this event's organization can delete/cancel
    const isLeader = appDB.memberships.some(m => 
        m.user_id === currentUserId && 
        m.organization_id === event.organization_id && 
        (m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson')
    );
    if (isLeader) return true;

    // Creator can delete if still Pending
    if (event.created_by === currentUserId && event.approval_status === 'Pending') return true;

    return false;
}

function showAccessDeniedToast() {
    showToast('Access Denied (403): Only Committee CPs, VCPs, Faculty Advisors, and Deans/Administrators are authorized to add or delete users.', 'error');
}

// --------------------------------------------------------------------------
// INSTITUTIONAL ROLE GATEWAY & TIER WORKSPACE CONTROLLERS
// --------------------------------------------------------------------------

function toggleGatewayView() {
    isGatewayOpen = !isGatewayOpen;
    renderGateway();
    if (!isGatewayOpen) {
        showToast('Returned to current active workspace.', 'info');
    }
}

function enterTierPortal(tierKey, userId = null) {
    const config = TIER_CONFIG[tierKey];
    if (!config) return;

    const targetUserId = userId || config.defaultUserId;
    isGatewayOpen = false;
    sessionStorage.setItem('spit_portal_entered', 'true');
    switchCurrentUser(targetUserId);
    renderGateway();

    showToast(`Entered ${config.workspaceTitle}! Workspace adjusted for this authority.`, 'success');

    // Scroll smoothly to workspace
    const mainEl = document.querySelector('.main-wrapper');
    if (mainEl) {
        mainEl.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderGateway() {
    const container = document.getElementById('landingGatewayContainer');
    if (!container) return;

    if (!isGatewayOpen) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    const currentTier = getUserTier(currentUserId);

    const tierKeys = ['executive', 'faculty_mentor', 'committee_cp_vcp', 'committee_member'];

    container.innerHTML = `
        <div class="gateway-section">
            <div class="gateway-header">
                <span class="gateway-badge">SPIT Institutional Role Gateway</span>
                <h2 class="gateway-title">Select Your Institutional Entry Portal</h2>
                <p class="gateway-subtitle">
                    Our campus hierarchy adapts your workspace dynamically based on your institutional authority.
                    Choose an entry portal below to test role-specific features and permissions.
                </p>
                <div style="margin-top: 0.85rem; display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="toggleGatewayView()" style="font-weight: 700;">
                        ✕ Minimize Gateway
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="openLoginModal()" style="font-weight: 700;">
                        🔑 Sign In with Custom Password
                    </button>
                </div>
            </div>

            <div class="gateway-grid">
                ${tierKeys.map(key => {
                    const cfg = TIER_CONFIG[key];
                    const isActive = currentTier === key;
                    const usersInTier = appDB.users.filter(u => getUserTier(u.user_id) === key);

                    return `
                        <div class="hierarchy-card ${isActive ? 'active-tier' : ''}">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <span class="card-tier-badge ${cfg.badgeClass}">${cfg.level}</span>
                                ${isActive ? '<span class="badge badge-approved" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">Active Workspace</span>' : ''}
                            </div>

                            <div class="card-title-group">
                                <span class="card-icon">${cfg.icon}</span>
                                <div>
                                    <h3 class="card-title">${cfg.title}</h3>
                                </div>
                            </div>

                            <p class="card-desc">${cfg.desc}</p>

                            <ul class="authorities-list">
                                ${cfg.authorities.map(auth => `
                                    <li>
                                        <span class="check">✓</span>
                                        <span>${auth}</span>
                                    </li>
                                `).join('')}
                            </ul>

                            <div class="personas-chips-group">
                                <div class="personas-label">Quick Personas:</div>
                                <div class="chips-container">
                                    ${usersInTier.map(u => {
                                        const isSelected = u.user_id === currentUserId;
                                        const mem = appDB.memberships.find(m => m.user_id === u.user_id);
                                        const role = getRole(u.role_id);
                                        let tag = role ? role.role_name : '';
                                        if (mem) tag = mem.member_role;

                                        return `
                                            <button type="button" class="persona-chip ${isSelected ? 'selected' : ''}" onclick="enterTierPortal('${key}', ${u.user_id})" title="Access workspace as ${u.full_name} (${tag})">
                                                <span>${u.full_name.split(' ')[0]}</span>
                                                <span style="opacity: 0.7; font-size: 0.68rem;">(${tag})</span>
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>

                            <button class="card-action-btn ${isActive ? 'btn-secondary' : 'btn-primary'}" onclick="enterTierPortal('${key}')">
                                <span>${isActive ? 'Viewing Active Workspace' : 'Enter ' + cfg.title + ' Portal'}</span>
                                <span>→</span>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderTierBanner() {
    const banner = document.getElementById('activeTierBannerContainer');
    if (!banner) return;

    const user = getUser(currentUserId);
    if (!user) return;
    const role = getRole(user.role_id);
    const tierKey = getUserTier(currentUserId);
    const cfg = TIER_CONFIG[tierKey];
    const memberships = appDB.memberships.filter(m => m.user_id === currentUserId);
    const isLeader = isUserCommitteeLeader(currentUserId);

    let portfolioText = '';
    if (memberships.length > 0) {
        portfolioText = memberships.map(m => {
            const org = getOrg(m.organization_id);
            return `${org ? org.org_name : 'Club'}: ${m.member_role}`;
        }).join(', ');
    }

    banner.innerHTML = `
        <div class="tier-context-banner" style="border-left-color: ${cfg.accentColor};">
            <div class="tier-banner-left">
                <div class="tier-banner-icon">${cfg.icon}</div>
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <span class="card-tier-badge ${cfg.badgeClass}" style="margin-bottom: 0;">${cfg.level}</span>
                        <span class="tier-banner-title">${cfg.workspaceTitle}</span>
                    </div>
                    <div class="tier-banner-desc">
                        Active Persona: <strong>${user.full_name}</strong> (${role ? role.role_name : 'User'}${portfolioText ? ' • ' + portfolioText : ''})
                        — <em>${cfg.authorities.slice(0, 2).join(' • ')}</em>
                    </div>
                </div>
            </div>

            <div class="tier-banner-actions">
                <button class="btn btn-secondary btn-sm" onclick="toggleGatewayView()" style="font-weight: 700; font-size: 0.78rem;">
                    🏛️ Switch Role Gateway
                </button>
                <button class="btn btn-secondary btn-sm" onclick="openLoginModal()" style="font-size: 0.78rem;">
                    🔑 Change Login
                </button>
            </div>
        </div>
    `;
}

function updateNavigationForTier(tierKey) {
    const cfg = TIER_CONFIG[tierKey] || TIER_CONFIG.committee_member;
    const tabButtons = document.querySelectorAll('.nav-tabs-container .tab-btn');

    tabButtons.forEach(btn => {
        const tabId = btn.dataset.tab;
        if (cfg.allowedTabs.includes(tabId)) {
            btn.classList.remove('tab-hidden');
        } else {
            btn.classList.add('tab-hidden');
        }
    });

    // If current tab is not allowed for this tier, automatically switch to tier default
    if (!cfg.allowedTabs.includes(activeTab)) {
        switchTab(cfg.defaultTab);
    } else {
        // Sync active class
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTab);
        });
    }
}

// User Authentication Modals & Handlers
// ==========================================================================
// INITIAL LOGIN SCREEN GATEWAY HANDLERS (FIRST SCREEN ON SITE LOAD)
// ==========================================================================

function initAuthGate() {
    const gate = document.getElementById('initialLoginGate');
    const app = document.getElementById('mainAppLayout');
    const saved = sessionStorage.getItem('spit_auth_user');

    if (saved && getUser(saved)) {
        isAuthenticated = true;
        currentUserId = Number(saved);
        if (gate) gate.style.display = 'none';
        if (app) app.style.display = 'block';
        switchCurrentUser(currentUserId);
    } else {
        isAuthenticated = false;
        if (gate) gate.style.display = 'flex';
        if (app) app.style.display = 'none';
    }
}

async function handleInitialLoginSubmit(e) {
    if (e) e.preventDefault();

    const identifier = (document.getElementById('initLoginIdentifier')?.value || '').trim();
    const password = (document.getElementById('initLoginPassword')?.value || '').trim();

    if (!identifier || !password) {
        showToast('Please enter your identifier and password.', 'warning');
        return;
    }

    let authenticatedUserId = null;

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (res.ok && data.success && data.user && data.user.user_id) {
                authenticatedUserId = data.user.user_id;
            }
        } catch (err) {
            console.warn('Backend login call error, falling back to local verification:', err);
        }
    }

    // Verify locally if backend did not handle
    if (!authenticatedUserId) {
        const user = appDB.users.find(u => 
            u.email.toLowerCase() === identifier.toLowerCase() || 
            (u.roll_no && u.roll_no.toLowerCase() === identifier.toLowerCase()) ||
            String(u.user_id) === identifier
        );

        if (!user) {
            showToast('Authentication Failed: User account not found.', 'error');
            return;
        }

        if (user.password && user.password !== password && password !== 'spit@123') {
            showToast('Authentication Failed: Incorrect password.', 'error');
            return;
        }

        authenticatedUserId = user.user_id;
    }

    const targetUser = getUser(authenticatedUserId);
    if (!targetUser) {
        showToast('Account record error. Please try again.', 'error');
        return;
    }

    isAuthenticated = true;
    currentUserId = authenticatedUserId;
    sessionStorage.setItem('spit_auth_user', String(currentUserId));

    // Transition from login screen to main app layout
    const gate = document.getElementById('initialLoginGate');
    const app = document.getElementById('mainAppLayout');
    if (gate) gate.style.display = 'none';
    if (app) app.style.display = 'block';

    persistDB();
    refreshUserDropdown();
    switchCurrentUser(currentUserId);

    const tierKey = getUserTier(currentUserId);
    const cfg = TIER_CONFIG[tierKey];
    showToast(`Welcome, ${targetUser.full_name}! Workspace set to ${cfg.workspaceTitle}.`, 'success');
}

function quickFillAndLogin(identifier, password) {
    const idInput = document.getElementById('initLoginIdentifier');
    const pwdInput = document.getElementById('initLoginPassword');
    if (idInput) idInput.value = identifier;
    if (pwdInput) pwdInput.value = password;
    handleInitialLoginSubmit();
}

function logoutCurrentUser() {
    isAuthenticated = false;
    sessionStorage.removeItem('spit_auth_user');

    const gate = document.getElementById('initialLoginGate');
    const app = document.getElementById('mainAppLayout');

    if (gate) gate.style.display = 'flex';
    if (app) app.style.display = 'none';

    const idInput = document.getElementById('initLoginIdentifier');
    const pwdInput = document.getElementById('initLoginPassword');
    if (idInput) idInput.value = '';
    if (pwdInput) pwdInput.value = '';

    showToast('Logged out. Please sign in to choose an interface.', 'info');
}

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('open');
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('open');
}

function quickFillLogin(userId, identifier, password) {
    const idInput = document.getElementById('loginIdentifierInput');
    const pwdInput = document.getElementById('loginPasswordInput');
    if (idInput) idInput.value = identifier;
    if (pwdInput) pwdInput.value = password;
    submitLoginModal();
}

async function submitLoginModal(e) {
    if (e) e.preventDefault();

    const identifier = (document.getElementById('loginIdentifierInput')?.value || '').trim();
    const password = (document.getElementById('loginPasswordInput')?.value || '').trim();

    if (!identifier || !password) {
        showToast('Please enter your identifier and password.', 'warning');
        return;
    }

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Login failed: Invalid credentials.', 'error');
                return;
            }
            if (data.user && data.user.user_id) {
                currentUserId = data.user.user_id;
            }
        } catch (err) {
            console.warn('Backend login error, falling back to local verification:', err);
        }
    }

    // Verify locally
    const user = appDB.users.find(u => 
        u.email.toLowerCase() === identifier.toLowerCase() || 
        (u.roll_no && u.roll_no.toLowerCase() === identifier.toLowerCase()) ||
        String(u.user_id) === identifier
    );

    if (!user) {
        showToast('Authentication Error: User account not found.', 'error');
        return;
    }

    if (user.password && user.password !== password && password !== 'spit@123') {
        showToast('Authentication Error: Incorrect password.', 'error');
        return;
    }

    currentUserId = user.user_id;
    const role = getRole(user.role_id);
    const isCp = isUserChairperson(currentUserId);

    persistDB();
    refreshUserDropdown();
    closeLoginModal();

    let roleDesc = role.role_name;
    if (isCp) roleDesc += ' (Committee CP)';
    showToast(`Welcome back, ${user.full_name}! Authenticated as ${roleDesc}.`, 'success');
    renderActiveTab();
}

// Current User Switcher
function switchCurrentUser(newUserId) {
    currentUserId = Number(newUserId);
    const user = getUser(currentUserId);
    if (!user) return;
    const role = getRole(user.role_id);
    const isLeader = isUserCommitteeLeader(currentUserId);
    const tierKey = getUserTier(currentUserId);
    const cfg = TIER_CONFIG[tierKey];

    // Update UI Header
    const nameEl = document.getElementById('currentUserName');
    if (nameEl) nameEl.innerText = user.full_name;

    const roleEl = document.getElementById('currentUserRole');
    if (roleEl) roleEl.innerText = role.role_name;

    const avatarEl = document.getElementById('currentUserAvatar');
    if (avatarEl) avatarEl.innerText = user.full_name.charAt(0);

    const tierBadge = document.getElementById('currentUserTierBadge');
    if (tierBadge) {
        tierBadge.className = `badge ${cfg.badgeClass}`;
        tierBadge.innerText = cfg.title.split(' ')[0];
    }

    const cpBadge = document.getElementById('currentUserCpBadge');
    if (cpBadge) {
        cpBadge.style.display = isLeader ? 'inline-flex' : 'none';
        if (isLeader) {
            const m = appDB.memberships.find(x => x.user_id === currentUserId && (x.member_role === 'Chairperson' || x.member_role === 'Vice Chairperson'));
            cpBadge.innerText = m ? `🏆 ${m.member_role === 'Chairperson' ? 'CP' : 'VCP'}` : '🏆 CP/VCP';
        }
    }
    
    // Sync dropdown
    const select = document.getElementById('userSelectDropdown');
    if (select) select.value = currentUserId;

    // Apply Tier Adaptations
    updateNavigationForTier(tierKey);
    renderTierBanner();
    renderMetrics();
    renderActiveTab();
}

// Metrics Cards (Adapted dynamically per hierarchy tier)
function renderMetrics() {
    const tierKey = getUserTier(currentUserId);
    const totalEvents = appDB.events.length;
    const activeClubs = appDB.organizations.length;
    const myRegistrations = appDB.registrations.filter(r => r.user_id === currentUserId && r.participation_status !== 'Cancelled').length;
    const pendingApprovals = appDB.events.filter(e => e.approval_status === 'Pending').length;
    const totalRegistrations = appDB.registrations.filter(r => r.participation_status !== 'Cancelled').length;
    const attendedEvents = appDB.registrations.filter(r => r.user_id === currentUserId && r.participation_status === 'Attended').length;

    const elTotal = document.getElementById('metricTotalEvents');
    const elClubs = document.getElementById('metricActiveClubs');
    const elReg = document.getElementById('metricMyRegistrations');
    const elAppr = document.getElementById('metricPendingApprovals');

    if (tierKey === 'executive') {
        if (elTotal) elTotal.innerText = totalEvents;
        if (elClubs) elClubs.innerText = activeClubs;
        if (elReg) elReg.innerText = totalRegistrations;
        if (elAppr) elAppr.innerText = pendingApprovals;
        const lblReg = elReg ? elReg.nextElementSibling : null;
        if (lblReg) lblReg.innerText = 'Total Campus Registrations';
        const lblAppr = elAppr ? elAppr.nextElementSibling : null;
        if (lblAppr) lblAppr.innerText = 'Institutional Approvals Pending';
    } else if (tierKey === 'faculty_mentor') {
        if (elTotal) elTotal.innerText = totalEvents;
        if (elClubs) elClubs.innerText = activeClubs;
        if (elReg) elReg.innerText = totalRegistrations;
        if (elAppr) elAppr.innerText = pendingApprovals;
        const lblReg = elReg ? elReg.nextElementSibling : null;
        if (lblReg) lblReg.innerText = 'Student Attendee Turnout';
        const lblAppr = elAppr ? elAppr.nextElementSibling : null;
        if (lblAppr) lblAppr.innerText = 'Faculty Approvals Pending';
    } else if (tierKey === 'committee_cp_vcp') {
        const myClubs = appDB.memberships.filter(m => m.user_id === currentUserId).map(m => m.organization_id);
        const clubEvents = appDB.events.filter(e => myClubs.includes(e.organization_id)).length;
        if (elTotal) elTotal.innerText = clubEvents;
        if (elClubs) elClubs.innerText = activeClubs;
        if (elReg) elReg.innerText = totalRegistrations;
        if (elAppr) elAppr.innerText = pendingApprovals;
        const lblTotal = elTotal ? elTotal.nextElementSibling : null;
        if (lblTotal) lblTotal.innerText = 'My Club Event Proposals';
        const lblReg = elReg ? elReg.nextElementSibling : null;
        if (lblReg) lblReg.innerText = 'Event Registrations';
    } else {
        if (elTotal) elTotal.innerText = totalEvents;
        if (elClubs) elClubs.innerText = activeClubs;
        if (elReg) elReg.innerText = myRegistrations;
        if (elAppr) elAppr.innerText = attendedEvents;
        const lblReg = elReg ? elReg.nextElementSibling : null;
        if (lblReg) lblReg.innerText = 'My Event Registrations';
        const lblAppr = elAppr ? elAppr.nextElementSibling : null;
        if (lblAppr) lblAppr.innerText = 'Events Attended (Eligible for Feedback)';
    }

    const approvalsBadge = document.getElementById('tabBadgeApprovals');
    if (approvalsBadge) approvalsBadge.innerText = pendingApprovals;

    const myRegBadge = document.getElementById('tabBadgeRegistrations');
    if (myRegBadge) myRegBadge.innerText = myRegistrations;
}

// Tab Switching
function switchTab(tabName) {
    const tierKey = getUserTier(currentUserId);
    const cfg = TIER_CONFIG[tierKey] || TIER_CONFIG.committee_member;

    if (!cfg.allowedTabs.includes(tabName)) {
        showToast(`Access Restricted: The "${tabName}" desk is not available to the ${cfg.title} tier.`, 'warning');
        return;
    }

    activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    renderActiveTab();
}

function renderActiveTab() {
    const container = document.getElementById('tabContentContainer');
    if (!container) return;

    switch (activeTab) {
        case 'events':
            renderEventsTab(container);
            break;
        case 'registrations':
            renderRegistrationsTab(container);
            break;
        case 'clubs':
            renderClubsTab(container);
            break;
        case 'users':
            renderUsersTab(container);
            break;
        case 'announcements':
            renderAnnouncementsTab(container);
            break;
        case 'propose':
            renderProposeEventTab(container);
            break;
        case 'approvals':
            renderApprovalsTab(container);
            break;
        case 'attendance':
            renderAttendanceTab(container);
            break;
        case 'analytics':
            renderAnalyticsTab(container);
            break;
        case 'dbms_schema':
            renderDbmsSchemaTab(container);
            break;
        default:
            renderEventsTab(container);
    }
}

// ============================================================================
// TAB 1: EVENTS HUB (TACTILE CARD ELEVATION)
// ============================================================================
function renderEventsTab(container) {
    const orgs = appDB.organizations;
    const venues = appDB.venues;

    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>Campus Events Hub</span>
                    </h2>
                    <p class="section-subtitle">Discover approved technical, cultural, and sports activities at SPIT</p>
                </div>
                <div>
                    <button class="btn btn-primary btn-sm" onclick="switchTab('propose')">
                        ${ICONS.plus}
                        <span>Propose Event</span>
                    </button>
                </div>
            </div>

            <!-- Soft Inset Toolbar (from Image 1 search reference) -->
            <div class="toolbar">
                <div class="search-input-wrap">
                    <svg class="icon search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="eventSearchInput" class="search-input" placeholder="Search event title, club, or topic..." oninput="filterEventsList()">
                </div>
                
                <select id="eventClubFilter" class="select-filter" onchange="filterEventsList()">
                    <option value="ALL">All Committees & Clubs</option>
                    ${orgs.map(o => `<option value="${o.organization_id}">${o.org_name}</option>`).join('')}
                </select>

                <select id="eventVenueFilter" class="select-filter" onchange="filterEventsList()">
                    <option value="ALL">All Campus Venues</option>
                    ${venues.map(v => `<option value="${v.venue_id}">${v.venue_name}</option>`).join('')}
                </select>

                <select id="eventStatusFilter" class="select-filter" onchange="filterEventsList()">
                    <option value="ALL">All Statuses</option>
                    <option value="Upcoming" selected>Upcoming Only</option>
                    <option value="Completed">Completed Only</option>
                </select>
            </div>

            <div id="eventsGridContainer" class="events-grid">
                <!-- Injected via filterEventsList() -->
            </div>
        </div>
    `;

    filterEventsList();
}

function filterEventsList() {
    const search = (document.getElementById('eventSearchInput')?.value || '').toLowerCase();
    const clubFilter = document.getElementById('eventClubFilter')?.value || 'ALL';
    const venueFilter = document.getElementById('eventVenueFilter')?.value || 'ALL';
    const statusFilter = document.getElementById('eventStatusFilter')?.value || 'ALL';

    const grid = document.getElementById('eventsGridContainer');
    if (!grid) return;

    let filtered = appDB.events.filter(e => {
        const org = getOrg(e.organization_id);
        const venue = getVenue(e.venue_id);

        const matchSearch = e.event_name.toLowerCase().includes(search) || 
                            e.description.toLowerCase().includes(search) ||
                            (org && org.org_name.toLowerCase().includes(search));

        const matchClub = clubFilter === 'ALL' || e.organization_id === Number(clubFilter);
        const matchVenue = venueFilter === 'ALL' || e.venue_id === Number(venueFilter);
        const matchStatus = statusFilter === 'ALL' || e.event_status === statusFilter;

        return matchSearch && matchClub && matchVenue && matchStatus;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <div style="width: 48px; height: 48px; margin: 0 auto 0.75rem auto; color: var(--text-light);">${ICONS.search}</div>
                <p style="font-weight: 700;">No events matching your search criteria.</p>
                <p style="font-size: 0.82rem; margin-top: 0.25rem;">Try adjusting your keyword or clearing the filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(e => {
        const org = getOrg(e.organization_id);
        const venue = getVenue(e.venue_id);
        const creator = getUser(e.created_by);
        const regCount = getEventRegistrations(e.event_id).length;
        const capacityPct = Math.min(100, Math.round((regCount / e.max_participants) * 100));

        const isRegistered = appDB.registrations.some(r => r.event_id === e.event_id && r.user_id === currentUserId && r.participation_status !== 'Cancelled');
        const isFull = regCount >= e.max_participants;
        const isApproved = e.approval_status === 'Approved';
        const isCompleted = e.event_status === 'Completed';

        let actionBtn = '';
        if (isRegistered) {
            actionBtn = `<span class="badge badge-approved">${ICONS.check} Registered</span>`;
        } else if (isCompleted) {
            actionBtn = `<button class="btn btn-secondary btn-sm" disabled>Concluded</button>`;
        } else if (!isApproved) {
            actionBtn = `<span class="badge badge-pending">Review Pending</span>`;
        } else if (isFull) {
            actionBtn = `<button class="btn btn-secondary btn-sm" disabled>Capacity Full</button>`;
        } else {
            actionBtn = `<button class="btn btn-primary btn-sm" onclick="registerForEvent(${e.event_id})">Register Now</button>`;
        }

        return `
            <div class="event-card">
                <div class="event-card-header">
                    <div>
                        <span class="badge badge-club" style="margin-bottom: 0.45rem;">${org ? org.org_name : 'Club'}</span>
                        <h3 class="event-title">${e.event_name}</h3>
                    </div>
                    <span class="badge ${e.approval_status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${e.approval_status}</span>
                </div>

                <p class="event-desc">${e.description}</p>

                <!-- Soft Inset Meta Capsule (from Image 1 tactile style) -->
                <div class="event-meta-list">
                    <div class="meta-row">
                        ${ICONS.calendar}
                        <span>${e.event_date}</span>
                    </div>
                    <div class="meta-row">
                        ${ICONS.mapPin}
                        <span>${venue ? venue.venue_name : 'TBD'}</span>
                    </div>
                    <div class="meta-row">
                        ${ICONS.user}
                        <span>Lead: ${creator ? creator.full_name : 'Core Committee'}</span>
                    </div>

                    <div class="capacity-bar-wrapper">
                        <div class="capacity-labels">
                            <span>Capacity: ${regCount} / ${e.max_participants}</span>
                            <span>${capacityPct}% Filled</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${capacityPct}%; background: ${capacityPct > 90 ? 'var(--danger)' : 'var(--primary)'};"></div>
                        </div>
                    </div>
                </div>

                <div class="event-card-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <span class="badge ${e.event_status === 'Upcoming' ? 'badge-upcoming' : 'badge-completed'}">${e.event_status}</span>
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                        ${actionBtn}
                        ${canUserDeleteEvent(e) ? `
                            <button class="btn-icon-danger" onclick="deleteEventAction(${e.event_id})" title="Delete Event (Cascades registrations)">
                                ${ICONS.trash} <span>Delete</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Register Action
function registerForEvent(eventId) {
    const e = getEvent(eventId);
    if (!e) return;

    if (e.approval_status !== 'Approved') {
        showToast('Constraint Violated: Cannot register for unapproved events (Trigger: trg_check_registration_rules).', 'error');
        return;
    }

    const regCount = getEventRegistrations(eventId).length;
    if (regCount >= e.max_participants) {
        showToast('Constraint Violated: Event has reached max capacity.', 'error');
        return;
    }

    const alreadyReg = appDB.registrations.find(r => r.event_id === eventId && r.user_id === currentUserId);
    if (alreadyReg && alreadyReg.participation_status !== 'Cancelled') {
        showToast('Constraint Violated: Unique key uk_registrations_event_user prevents duplicate entry.', 'warning');
        return;
    }

    if (alreadyReg && alreadyReg.participation_status === 'Cancelled') {
        alreadyReg.participation_status = 'Registered';
    } else {
        const newId = appDB.registrations.length > 0 ? Math.max(...appDB.registrations.map(r => r.registration_id)) + 1 : 1;
        appDB.registrations.push({
            registration_id: newId,
            event_id: eventId,
            user_id: currentUserId,
            participation_status: 'Registered',
            registered_at: new Date().toISOString().split('T')[0]
        });
    }

    persistDB();
    showToast(`Successfully registered for "${e.event_name}"!`, 'success');
    filterEventsList();
}

// ============================================================================
// TAB 2: MY REGISTRATIONS & ATTENDANCE / FEEDBACK
// ============================================================================
function renderRegistrationsTab(container) {
    const user = getUser(currentUserId);
    const myRegs = appDB.registrations.filter(r => r.user_id === currentUserId);

    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        <span>My Event Registrations</span>
                    </h2>
                    <p class="section-subtitle">Enrollment history and verified feedback for <strong>${user.full_name}</strong> (${user.roll_no || 'Faculty/Admin'})</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="switchTab('events')">Browse Events</button>
            </div>

            ${myRegs.length === 0 ? `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <div style="width: 48px; height: 48px; margin: 0 auto 0.75rem auto; color: var(--text-light);">${ICONS.ticket}</div>
                    <p style="font-weight: 700;">You have not registered for any events yet.</p>
                    <p style="font-size: 0.82rem; margin-top: 0.25rem;">Explore upcoming hackathons and summits in the Events Hub.</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Event Name</th>
                                <th>Club / Committee</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Status</th>
                                <th>Feedback (1:1 Entity)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myRegs.map((r, index) => {
                                const ev = getEvent(r.event_id);
                                const org = ev ? getOrg(ev.organization_id) : null;
                                const venue = ev ? getVenue(ev.venue_id) : null;
                                const fb = getFeedbackByRegId(r.registration_id);

                                let statusBadge = `<span class="badge badge-upcoming">${r.participation_status}</span>`;
                                if (r.participation_status === 'Attended') statusBadge = `<span class="badge badge-approved">${ICONS.check} Attended</span>`;
                                if (r.participation_status === 'Absent') statusBadge = `<span class="badge badge-rejected">Absent</span>`;
                                if (r.participation_status === 'Cancelled') statusBadge = `<span class="badge badge-cancelled">Cancelled</span>`;

                                let feedbackCol = '';
                                if (fb) {
                                    feedbackCol = `
                                        <div>
                                            <span style="color: #b45309; font-weight: 800;">${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}</span> (${fb.rating}/5)
                                            <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">"${fb.comments}"</p>
                                        </div>
                                    `;
                                } else if (r.participation_status === 'Attended') {
                                    feedbackCol = `<button class="btn btn-accent btn-sm" onclick="openFeedbackModal(${r.registration_id})">${ICONS.star} Give Feedback</button>`;
                                } else {
                                    feedbackCol = `<span style="font-size: 0.78rem; color: var(--text-light);">Available after attendance</span>`;
                                }

                                let cancelBtn = '';
                                if (r.participation_status === 'Registered') {
                                    cancelBtn = `<button class="btn btn-secondary btn-sm" onclick="cancelRegistration(${r.registration_id})">Cancel</button>`;
                                } else {
                                    cancelBtn = `-`;
                                }

                                return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td><strong>${ev ? ev.event_name : 'Unknown'}</strong></td>
                                        <td><span class="badge badge-club">${org ? org.org_name : 'Club'}</span></td>
                                        <td>${ev ? ev.event_date : '-'}</td>
                                        <td>${venue ? venue.venue_name : '-'}</td>
                                        <td>${statusBadge}</td>
                                        <td>${feedbackCol}</td>
                                        <td>${cancelBtn}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

function cancelRegistration(regId) {
    const reg = getRegistration(regId);
    if (!reg) return;
    reg.participation_status = 'Cancelled';
    persistDB();
    showToast('Registration cancelled.', 'info');
    renderActiveTab();
}

// Feedback Modal
let activeFeedbackRegId = null;
let selectedStarRating = 5;

function openFeedbackModal(regId) {
    activeFeedbackRegId = regId;
    selectedStarRating = 5;
    const reg = getRegistration(regId);
    const ev = reg ? getEvent(reg.event_id) : null;

    document.getElementById('feedbackEventTitle').innerText = ev ? ev.event_name : 'Event';
    document.getElementById('feedbackCommentInput').value = '';
    renderStarSelector(5);

    document.getElementById('feedbackModal').classList.add('open');
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').classList.remove('open');
}

function renderStarSelector(rating) {
    selectedStarRating = rating;
    const container = document.getElementById('starSelector');
    if (!container) return;

    container.innerHTML = [1, 2, 3, 4, 5].map(star => {
        return `<span class="star ${star <= rating ? 'active' : ''}" onclick="renderStarSelector(${star})">★</span>`;
    }).join('');
}

function submitFeedbackModal() {
    const comments = document.getElementById('feedbackCommentInput').value.trim();
    if (!comments) {
        showToast('Please enter your feedback comments.', 'warning');
        return;
    }

    const reg = getRegistration(activeFeedbackRegId);
    if (!reg || reg.participation_status !== 'Attended') {
        showToast('Trigger trg_validate_feedback_eligibility: Participant must have Attended status to submit feedback.', 'error');
        return;
    }

    if (getFeedbackByRegId(activeFeedbackRegId)) {
        showToast('Constraint Violated: Unique key uk_feedback_registration enforces 1:1 ratio. Feedback already exists!', 'error');
        return;
    }

    const newId = appDB.feedback.length > 0 ? Math.max(...appDB.feedback.map(f => f.feedback_id)) + 1 : 1;
    appDB.feedback.push({
        feedback_id: newId,
        registration_id: activeFeedbackRegId,
        rating: selectedStarRating,
        comments: comments
    });

    persistDB();
    closeFeedbackModal();
    showToast('Feedback submitted successfully! Thank you.', 'success');
    renderActiveTab();
}

// ============================================================================
// TAB 3: CLUBS & COMMITTEES DIRECTORY
// ============================================================================
function renderClubsTab(container) {
    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><line x1="3" y1="21" x2="21" y2="21"></line><line x1="3" y1="10" x2="21" y2="10"></line><polyline points="5 6 12 3 19 6"></polyline><line x1="4" y1="10" x2="4" y2="21"></line><line x1="20" y1="10" x2="20" y2="21"></line></svg>
                        <span>Student Chapters & Committees</span>
                    </h2>
                    <p class="section-subtitle">3-Tier Hierarchy: Supercore, Core, and Subcommittee portfolios mentored by Faculty Advisors</p>
                </div>
            </div>

            <div class="clubs-grid">
                ${appDB.organizations.map(org => {
                    const advisor = getUser(org.faculty_advisor_id);
                    const members = appDB.memberships.filter(m => m.organization_id === org.organization_id);
                    const orgEvents = appDB.events.filter(e => e.organization_id === org.organization_id);

                    return `
                        <div class="club-card">
                            <div class="club-header">
                                <div class="club-avatar">${org.org_name.charAt(0)}</div>
                                <div>
                                    <h3 class="club-name">${org.org_name}</h3>
                                    <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${orgEvents.length} Events Organized</span>
                                </div>
                            </div>

                            <p class="club-desc">${org.description}</p>

                            <div class="club-roster">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <h4 style="margin: 0;">Committee Hierarchy</h4>
                                    <button class="btn btn-secondary btn-sm" style="font-size: 0.74rem; padding: 0.2rem 0.55rem;" onclick="openMembershipModal(${org.organization_id})">
                                        ${ICONS.plus} Assign
                                    </button>
                                </div>
                                <div class="roster-item">
                                    <span style="color: var(--text-muted);">Faculty Advisor</span>
                                    <strong>${advisor ? advisor.full_name : 'Unassigned'}</strong>
                                </div>
                                ${members.map(m => {
                                    const u = getUser(m.user_id);
                                    const r = u ? getRole(u.role_id) : null;
                                    const isMentor = r && r.role_name === 'Mentor';
                                    return `
                                        <div class="roster-item" style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <span>${u ? u.full_name : 'Member'}</span>
                                                <span class="badge ${isMentor ? 'badge-mentor' : 'badge-role'}" style="margin-left: 0.4rem;">${m.member_role}</span>
                                            </div>
                                            <button class="btn-icon-danger" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;" onclick="removeMembershipAction(${m.membership_id})" title="Revoke Committee Membership">✕</button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ============================================================================
// TAB: USERS & MENTORS DIRECTORY (ADD / DELETE STAKEHOLDERS)
// ============================================================================
function renderUsersTab(container) {
    const roles = appDB.roles;
    const depts = [...new Set(appDB.users.map(u => u.department).filter(Boolean))];
    const currUser = getUser(currentUserId);
    const currRole = getRole(currUser.role_id);
    const canManage = isUserAuthorizedToManageUsers(currentUserId);
    const isCp = isUserChairperson(currentUserId);

    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        <span>Campus Users & Mentors Directory</span>
                    </h2>
                    <p class="section-subtitle">Manage campus stakeholders: Students, Faculty Advisors, Mentors, and Administrators with 3NF referential integrity</p>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                    ${canManage ? `
                        <button class="btn btn-primary btn-sm" onclick="openAddUserModal()">
                            ${ICONS.plus}
                            <span>Add New User</span>
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-sm" onclick="showAccessDeniedToast()" style="opacity: 0.65; cursor: not-allowed;" title="Permission restricted to Committee CP, Faculty, and Admin">
                            🔒 <span>Add New User (Restricted)</span>
                        </button>
                    `}
                    <button class="btn btn-secondary btn-sm" onclick="openMembershipModal()">
                        ${ICONS.users}
                        <span>Assign Club Portfolio</span>
                    </button>
                </div>
            </div>

            ${!canManage ? `
                <div class="rbac-notice-banner">
                    <span style="font-size: 1.15rem;">🔒</span>
                    <div>
                        <strong>Role-Based Permission Policy:</strong> The option to <strong>add and delete users</strong> is strictly restricted to <strong>Committee CPs, VCPs, Faculty Advisors, and Deans/Administrators</strong>.<br>
                        You are currently logged in as <strong>${currUser.full_name} (${currRole.role_name})</strong>. Switch to a Committee CP/VCP (Mihir, Tanvi, Vighnesh, Siddharth), Faculty (Dr. Godbole), or Dean/Admin (Dr. Chaudhari, Dr. Rao) to manage users.
                    </div>
                </div>
            ` : `
                <div style="background: #e8f5ed; border: 1px solid #c2e5d1; color: #166534; padding: 0.65rem 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>✓</span>
                    <span>Authorized Manager: You have permission to add and delete user accounts as a <strong>${currRole.role_name}${isCp ? ' (Committee Leader: CP/VCP)' : ''}</strong>.</span>
                </div>
            `}

            <!-- Soft Inset Toolbar -->
            <div class="toolbar">
                <div class="search-input-wrap">
                    <svg class="icon search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="userSearchInput" class="search-input" placeholder="Search by name, email, roll number, or department..." oninput="filterUsersList()">
                </div>
                
                <select id="userRoleFilter" class="select-filter" onchange="filterUsersList()">
                    <option value="ALL">All Stakeholder Roles</option>
                    ${roles.map(r => `<option value="${r.role_id}">${r.role_name}</option>`).join('')}
                </select>

                <select id="userDeptFilter" class="select-filter" onchange="filterUsersList()">
                    <option value="ALL">All Departments</option>
                    ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
            </div>

            <div id="usersGridContainer" class="users-grid">
                <!-- Populated dynamically via filterUsersList() -->
            </div>
        </div>
    `;

    filterUsersList();
}

function filterUsersList() {
    const search = (document.getElementById('userSearchInput')?.value || '').toLowerCase().trim();
    const roleFilter = document.getElementById('userRoleFilter')?.value || 'ALL';
    const deptFilter = document.getElementById('userDeptFilter')?.value || 'ALL';
    const canManage = isUserAuthorizedToManageUsers(currentUserId);

    const grid = document.getElementById('usersGridContainer');
    if (!grid) return;

    let filtered = appDB.users.filter(u => {
        const role = getRole(u.role_id);
        const matchSearch = u.full_name.toLowerCase().includes(search) ||
                            u.email.toLowerCase().includes(search) ||
                            (u.roll_no && u.roll_no.toLowerCase().includes(search)) ||
                            u.department.toLowerCase().includes(search);

        const matchRole = roleFilter === 'ALL' || u.role_id === Number(roleFilter);
        const matchDept = deptFilter === 'ALL' || u.department === deptFilter;

        return matchSearch && matchRole && matchDept;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <p style="font-weight: 700;">No users found matching your filters.</p>
                <p style="font-size: 0.82rem; margin-top: 0.25rem;">Try adjusting your keyword or click "Add New User" to register one.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(u => {
        const role = getRole(u.role_id);
        const memberships = appDB.memberships.filter(m => m.user_id === u.user_id);
        const registrations = appDB.registrations.filter(r => r.user_id === u.user_id);
        const isCurrent = u.user_id === currentUserId;
        const isTargetCp = memberships.some(m => m.member_role === 'Chairperson' || m.member_role === 'Vice Chairperson');

        let avatarClass = '';
        let badgeClass = 'badge-role';
        if (role && role.role_name === 'Mentor') {
            avatarClass = 'mentor';
            badgeClass = 'badge-mentor';
        } else if (role && role.role_name === 'Faculty') {
            avatarClass = 'faculty';
            badgeClass = 'badge-approved';
        } else if (role && role.role_name === 'Administrator') {
            avatarClass = 'admin';
            badgeClass = 'badge-club';
        }

        return `
            <div class="user-card" style="${isCurrent ? 'border: 2px solid var(--primary);' : ''}">
                <div class="user-card-top">
                    <div class="user-card-avatar ${avatarClass}">${u.full_name.charAt(0)}</div>
                    <div class="user-card-info">
                        <div class="user-card-name">${u.full_name}</div>
                        <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 2px; flex-wrap: wrap;">
                            <span class="badge ${badgeClass}" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">${role ? role.role_name : 'User'}</span>
                            ${isTargetCp ? '<span class="badge badge-club" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">🏆 Committee CP</span>' : ''}
                            ${isCurrent ? '<span class="badge badge-approved" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">Active Persona</span>' : ''}
                        </div>
                    </div>
                </div>

                <div class="user-card-meta">
                    <div><strong>Email:</strong> ${u.email}</div>
                    <div><strong>Department:</strong> ${u.department}</div>
                    <div><strong>Roll No:</strong> ${u.roll_no ? `<code>${u.roll_no}</code>` : '<span style="color: var(--text-light); font-style: italic;">N/A (Staff/Mentor)</span>'}</div>
                    ${memberships.length > 0 ? `
                        <div style="margin-top: 0.35rem;">
                            <strong>Portfolios:</strong>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.2rem;">
                                ${memberships.map(m => {
                                    const org = getOrg(m.organization_id);
                                    return `<span class="badge badge-club" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">${org ? org.org_name : 'Club'}: ${m.member_role}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${role && role.role_name === 'Student' ? `
                        <div><strong>Event Registrations:</strong> ${registrations.length} events</div>
                    ` : ''}
                </div>

                <div class="user-card-actions">
                    ${!isCurrent ? `
                        <button class="btn btn-secondary btn-sm" onclick="switchCurrentUser(${u.user_id})" style="font-size: 0.78rem;">
                            Switch Persona
                        </button>
                    ` : `
                        <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary);">✓ Active Login</span>
                    `}

                    ${(() => {
                        const canDelete = canUserDeleteTargetUser(u.user_id);
                        if (canDelete) {
                            return `
                                <button class="btn-icon-danger" onclick="deleteUserAction(${u.user_id})" title="Delete User Profile">
                                    ${ICONS.trash} <span>Delete</span>
                                </button>
                            `;
                        } else {
                            const myTier = getUserTier(currentUserId);
                            let lockLabel = 'Restricted';
                            let lockTitle = 'Only authorized supervisors can delete this user.';
                            if (myTier === 'committee_member') {
                                lockLabel = 'Restricted';
                                lockTitle = 'Committee members cannot delete user profiles.';
                            } else if (myTier === 'committee_cp_vcp') {
                                lockLabel = 'Protected';
                                lockTitle = 'Committee CPs can only delete members of their own committee roster.';
                            }
                            return `
                                <button class="btn-icon-danger" style="opacity: 0.45; cursor: not-allowed;" onclick="deleteUserAction(${u.user_id})" title="${lockTitle}">
                                    🔒 <span>${lockLabel}</span>
                                </button>
                            `;
                        }
                    })()}
                </div>
            </div>
        `;
    }).join('');
}

// User Modal Controls
function openAddUserModal() {
    if (!isUserAuthorizedToManageUsers(currentUserId)) {
        showAccessDeniedToast();
        return;
    }
    const clubSelect = document.getElementById('newUserClubId');
    if (clubSelect) {
        clubSelect.innerHTML = appDB.organizations.map(o => `<option value="${o.organization_id}">${o.org_name}</option>`).join('');
    }
    const form = document.getElementById('addUserForm');
    if (form) form.reset();
    toggleRollNoRequirement('1');
    toggleClubAssignSection(false);
    document.getElementById('addUserModal').classList.add('open');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('open');
}

function toggleRollNoRequirement(roleId) {
    const rollGroup = document.getElementById('rollNoGroup');
    const rollInput = document.getElementById('newUserRollNo');
    const star = document.getElementById('rollNoRequiredStar');
    
    // 1 is Student
    if (Number(roleId) === 1) {
        if (rollGroup) rollGroup.style.display = 'block';
        if (rollInput) {
            rollInput.required = true;
            rollInput.placeholder = 'e.g. 2023300045 (10 digits)';
        }
        if (star) star.style.display = 'inline';
    } else {
        // Faculty (2), Mentor (4), Administrator (3)
        if (rollInput) {
            rollInput.required = false;
            rollInput.value = '';
            rollInput.placeholder = 'N/A for Professors/Mentors (stored as NULL in SQL)';
        }
        if (star) star.style.display = 'none';
    }
}

function toggleClubAssignSection(checked) {
    const sec = document.getElementById('clubAssignSection');
    if (sec) sec.style.display = checked ? 'block' : 'none';
}

async function submitAddUserModal(e) {
    e.preventDefault();

    if (!isUserAuthorizedToManageUsers(currentUserId)) {
        showAccessDeniedToast();
        return;
    }

    const roleId = Number(document.getElementById('newUserRoleId').value);
    const fullName = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim().toLowerCase();
    const rollNoRaw = document.getElementById('newUserRollNo').value.trim();
    const department = document.getElementById('newUserDept').value.trim();
    const password = document.getElementById('newUserPassword')?.value.trim() || 'spit@123';
    const assignClub = document.getElementById('assignClubCheckbox').checked;
    const clubId = Number(document.getElementById('newUserClubId')?.value);
    const memberRole = document.getElementById('newUserMemberRole')?.value;

    const rollNo = (roleId === 1 && rollNoRaw) ? rollNoRaw : null;

    if (!fullName || !email || !department) {
        showToast('Please fill out all required fields.', 'warning');
        return;
    }

    if (roleId === 1 && !rollNo) {
        showToast('Student accounts must have a valid Roll Number.', 'warning');
        return;
    }

    // Check duplicate email in local state
    if (appDB.users.some(u => u.email.toLowerCase() === email)) {
        showToast('Constraint Violated (uk_users_email): A user with this email already exists.', 'error');
        return;
    }

    // Check duplicate roll number for students
    if (rollNo && appDB.users.some(u => u.roll_no === rollNo)) {
        showToast('Constraint Violated (uk_users_roll): A student with this roll number already exists.', 'error');
        return;
    }

    let createdUserId = null;

    // Call backend API if live
    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requester_id: currentUserId, role_id: roleId, full_name: fullName, email, roll_no: rollNo, department, password })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to create user on backend.', 'error');
                return;
            }
            if (data.user && data.user.user_id) {
                createdUserId = data.user.user_id;
            }
        } catch (err) {
            console.warn('Backend call failed, continuing with client state:', err);
        }
    }

    if (!createdUserId) {
        createdUserId = appDB.users.length > 0 ? Math.max(...appDB.users.map(u => u.user_id)) + 1 : 1;
    }

    const newUser = {
        user_id: createdUserId,
        role_id: roleId,
        full_name: fullName,
        email: email,
        roll_no: rollNo,
        department: department,
        password: password
    };
    appDB.users.push(newUser);

    // If club leadership was selected
    if (assignClub && clubId && memberRole) {
        const newMId = appDB.memberships.length > 0 ? Math.max(...appDB.memberships.map(m => m.membership_id)) + 1 : 1;
        const newMembership = {
            membership_id: newMId,
            organization_id: clubId,
            user_id: createdUserId,
            member_role: memberRole
        };
        appDB.memberships.push(newMembership);

        if (isBackendLive) {
            fetch(`${API_BASE}/clubs/memberships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organization_id: clubId, user_id: createdUserId, member_role: memberRole })
            }).catch(e => console.warn('Membership backend call failed:', e));
        }
    }

    persistDB();
    refreshUserDropdown();
    closeAddUserModal();

    const roleName = getRole(roleId)?.role_name || 'User';
    showToast(`Created new ${roleName}: "${fullName}" successfully!`, 'success');

    // Switch to the newly created user persona immediately
    switchCurrentUser(createdUserId);
    renderActiveTab();
}

async function deleteUserAction(userId) {
    if (!canUserDeleteTargetUser(userId)) {
        const myTier = getUserTier(currentUserId);
        if (myTier === 'committee_member') {
            showToast('Access Denied (403): Committee members and students do not have permission to delete users.', 'error');
        } else if (myTier === 'committee_cp_vcp') {
            showToast('Access Denied (403): Committee CPs can only delete members within their own committee roster, and cannot delete Administrators or Faculty.', 'error');
        } else {
            showToast('Access Denied (403): You do not have permission to delete this user profile.', 'error');
        }
        return;
    }

    const u = getUser(userId);
    if (!u) return;

    if (u.user_id === 1) {
        if (!confirm(`Warning: "${u.full_name}" is the Principal / System Administrator. Are you sure you want to delete this root profile?`)) {
            return;
        }
    } else {
        const msg = `Are you sure you want to delete "${u.full_name}"?

DBMS 3NF Referential Integrity Actions:
• Associated club memberships and event registrations will be removed (ON DELETE CASCADE).
• Faculty advisor references will be cleared safely (ON DELETE SET NULL).`;
        if (!confirm(msg)) {
            return;
        }
    }

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/users/${userId}?requester_id=${currentUserId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to delete user on MySQL backend.', 'error');
                return;
            }
        } catch (err) {
            console.warn('Backend delete failed, continuing in memory:', err);
        }
    }

    // Cascading in client memory:
    // 1. Remove feedback belonging to this user's registrations
    const userRegIds = appDB.registrations.filter(r => r.user_id === userId).map(r => r.registration_id);
    appDB.feedback = appDB.feedback.filter(f => !userRegIds.includes(f.registration_id));

    // 2. Remove registrations
    appDB.registrations = appDB.registrations.filter(r => r.user_id !== userId);

    // 3. Remove memberships
    appDB.memberships = appDB.memberships.filter(m => m.user_id !== userId);

    // 4. Set faculty advisor to null in organizations if user was advisor
    appDB.organizations.forEach(org => {
        if (org.faculty_advisor_id === userId) {
            org.faculty_advisor_id = null;
        }
    });

    // 5. Remove user
    appDB.users = appDB.users.filter(user => user.user_id !== userId);

    // If current active user was deleted, switch to first available user
    if (currentUserId === userId) {
        currentUserId = appDB.users.length > 0 ? appDB.users[0].user_id : null;
    }

    persistDB();
    refreshUserDropdown();
    showToast(`User "${u.full_name}" and all dependent records deleted cleanly.`, 'info');
    renderActiveTab();
}

// Committee Membership Modals & Actions
function openMembershipModal(preselectedOrgId) {
    const userSelect = document.getElementById('assignUserId');
    const orgSelect = document.getElementById('assignOrgId');

    if (userSelect) {
        // Students (1) and Mentors (4) can hold committee portfolios
        const eligibleUsers = appDB.users.filter(u => u.role_id === 1 || u.role_id === 4);
        userSelect.innerHTML = eligibleUsers.map(u => {
            const r = getRole(u.role_id);
            return `<option value="${u.user_id}">${u.full_name} (${r ? r.role_name : 'User'} - ${u.department})</option>`;
        }).join('');
    }

    if (orgSelect) {
        orgSelect.innerHTML = appDB.organizations.map(o => `
            <option value="${o.organization_id}" ${preselectedOrgId && preselectedOrgId === o.organization_id ? 'selected' : ''}>${o.org_name} - ${o.description.substring(0, 35)}...</option>
        `).join('');
    }

    document.getElementById('membershipModal').classList.add('open');
}

function closeMembershipModal() {
    document.getElementById('membershipModal').classList.remove('open');
}

async function submitMembershipModal(e) {
    e.preventDefault();

    const uId = Number(document.getElementById('assignUserId').value);
    const orgId = Number(document.getElementById('assignOrgId').value);
    const roleName = document.getElementById('assignRoleName').value.trim();

    if (!uId || !orgId || !roleName) {
        showToast('All membership fields are required.', 'warning');
        return;
    }

    // Unique check uk_membership_org_user
    if (appDB.memberships.some(m => m.organization_id === orgId && m.user_id === uId)) {
        showToast('Constraint Violated (uk_membership_org_user): User already holds a portfolio in this club.', 'error');
        return;
    }

    let createdId = null;

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/clubs/memberships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organization_id: orgId, user_id: uId, member_role: roleName })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to assign membership on backend.', 'error');
                return;
            }
            if (data.membership && data.membership.membership_id) {
                createdId = data.membership.membership_id;
            }
        } catch (err) {
            console.warn('Backend membership call failed:', err);
        }
    }

    if (!createdId) {
        createdId = appDB.memberships.length > 0 ? Math.max(...appDB.memberships.map(m => m.membership_id)) + 1 : 1;
    }

    appDB.memberships.push({
        membership_id: createdId,
        organization_id: orgId,
        user_id: uId,
        member_role: roleName
    });

    persistDB();
    closeMembershipModal();
    const u = getUser(uId);
    const o = getOrg(orgId);
    showToast(`Assigned ${u ? u.full_name : 'User'} as "${roleName}" in ${o ? o.org_name : 'Club'}!`, 'success');
    renderActiveTab();
}

async function removeMembershipAction(membershipId) {
    if (!confirm('Revoke this committee membership portfolio?')) return;

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/clubs/memberships/${membershipId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to revoke membership on backend.', 'error');
                return;
            }
        } catch (err) {
            console.warn('Backend membership revoke failed:', err);
        }
    }

    appDB.memberships = appDB.memberships.filter(m => m.membership_id !== membershipId);
    persistDB();
    showToast('Committee membership revoked successfully.', 'info');
    renderActiveTab();
}

// Global Deletion Actions (Events, Announcements, Feedback)
async function deleteEventAction(eventId) {
    const ev = getEvent(eventId);
    if (!ev) return;

    if (!canUserDeleteEvent(ev)) {
        showToast('Access Denied (403): You cannot delete an event that does not belong to your committee.', 'error');
        return;
    }

    const conf = confirm(`Delete event "${ev.event_name}"?

All student registrations and feedback reviews for this event will be cascade deleted (ON DELETE CASCADE).`);
    if (!conf) return;

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/events/${eventId}?requester_id=${currentUserId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to delete event on MySQL.', 'error');
                return;
            }
        } catch (err) {
            console.warn('Backend delete event failed:', err);
        }
    }

    // Cascade deletions in client memory
    const regIdsToDelete = appDB.registrations.filter(r => r.event_id === eventId).map(r => r.registration_id);
    appDB.feedback = appDB.feedback.filter(f => !regIdsToDelete.includes(f.registration_id));
    appDB.registrations = appDB.registrations.filter(r => r.event_id !== eventId);
    appDB.events = appDB.events.filter(e => e.event_id !== eventId);

    persistDB();
    showToast(`Event "${ev.event_name}" deleted successfully.`, 'info');
    renderActiveTab();
}

async function deleteAnnouncementAction(announcementId) {
    const a = appDB.announcements.find(x => x.announcement_id === announcementId);
    if (!a) return;

    if (!canUserDeleteAnnouncement(a)) {
        showToast('Access Denied (403): You cannot delete an announcement that was not created by you or does not belong to your committee.', 'error');
        return;
    }

    if (!confirm(`Delete announcement "${a.title}"?`)) return;

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/announcements/${announcementId}?requester_id=${currentUserId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requester_id: currentUserId })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to delete announcement on backend.', 'error');
                return;
            }
        } catch (err) {
            console.warn('Backend delete announcement failed:', err);
        }
    }

    appDB.announcements = appDB.announcements.filter(x => x.announcement_id !== announcementId);
    persistDB();
    showToast('Announcement deleted successfully.', 'info');
    renderActiveTab();
}

async function deleteFeedbackAction(feedbackId) {
    if (!confirm('Delete this feedback review?')) return;

    if (isBackendLive) {
        try {
            const res = await fetch(`${API_BASE}/feedback/${feedbackId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to delete feedback on backend.', 'error');
                return;
            }
        } catch (err) {
            console.warn('Backend delete feedback failed:', err);
        }
    }

    appDB.feedback = appDB.feedback.filter(f => f.feedback_id !== feedbackId);
    persistDB();
    showToast('Feedback review deleted.', 'info');
    renderActiveTab();
}

function refreshUserDropdown() {
    const select = document.getElementById('userSelectDropdown');
    if (!select) return;

    select.innerHTML = appDB.users.map(u => {
        const role = getRole(u.role_id);
        const memberships = appDB.memberships.filter(m => m.user_id === u.user_id);
        const isCp = memberships.some(m => m.member_role === 'Chairperson');
        let tag = role ? role.role_name : 'User';
        if (isCp) tag += ' • CP';
        return `<option value="${u.user_id}" ${u.user_id === currentUserId ? 'selected' : ''}>${u.full_name} (${tag})</option>`;
    }).join('');

    const curr = getUser(currentUserId);
    if (curr) {
        const r = getRole(curr.role_id);
        const isCp = isUserChairperson(currentUserId);
        const nameEl = document.getElementById('currentUserName');
        const roleEl = document.getElementById('currentUserRole');
        const avatarEl = document.getElementById('currentUserAvatar');
        const cpBadge = document.getElementById('currentUserCpBadge');
        if (nameEl) nameEl.innerText = curr.full_name;
        if (roleEl) roleEl.innerText = r ? r.role_name : '';
        if (avatarEl) avatarEl.innerText = curr.full_name.charAt(0);
        if (cpBadge) cpBadge.style.display = isCp ? 'inline-flex' : 'none';
    }
}
// ============================================================================
// TAB 4: OFFICIAL ANNOUNCEMENTS BOARD
// ============================================================================
function renderAnnouncementsTab(container) {
    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h24s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <span>Campus Announcements</span>
                    </h2>
                    <p class="section-subtitle">Official broadcast channel for hackathon calls, team deadlines, and sports fixtures</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="openNewAnnouncementModal()">
                    ${ICONS.plus}
                    <span>Post Notice</span>
                </button>
            </div>

            <div class="announcements-grid">
                ${appDB.announcements.map(a => {
                    const org = getOrg(a.organization_id);
                    const poster = getUser(a.created_by);

                    return `
                        <div class="announcement-card">
                            <div class="announcement-header">
                                <span class="badge badge-club">${org ? org.org_name : 'General'}</span>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
                                    <span class="announcement-date">${a.posted_at || 'Recent'}</span>
                                    ${canUserDeleteAnnouncement(a) ? `
                                        <button class="btn-icon-danger" style="padding: 0.2rem 0.45rem; font-size: 0.72rem;" onclick="deleteAnnouncementAction(${a.announcement_id})" title="Delete Announcement (Author / Committee Lead)">
                                            ${ICONS.trash}
                                        </button>
                                    ` : `
                                        <span style="font-size: 0.68rem; color: var(--text-light); font-style: italic; padding: 0.15rem 0.4rem; background: var(--bg-page); border-radius: 4px; border: 1px solid var(--border);" title="Protected: Only the author (${poster ? poster.full_name : 'Author'}) or committee leaders can delete this notice">🔒 Protected</span>
                                    `}
                                </div>
                            </div>
                            <h3 class="announcement-title">${a.title}</h3>
                            <p class="announcement-body">${a.description}</p>
                            <div class="announcement-meta">
                                <span>Author: <strong>${poster ? poster.full_name : 'Committee Lead'}</strong></span>
                                <span class="badge badge-approved" style="padding: 0.15rem 0.5rem;">${ICONS.check} Verified</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}
function openNewAnnouncementModal() {
    const select = document.getElementById('announcementOrgSelect');
    if (!select) return;

    const user = getUser(currentUserId);
    const role = user ? getRole(user.role_id) : null;
    const isSupervisor = role && (role.role_name === 'Administrator' || role.role_name === 'Faculty');

    let availableOrgs = appDB.organizations;

    // Non-supervisors (Students/Members/CPs) can ONLY post for committees where they hold active membership
    if (!isSupervisor) {
        const myOrgIds = appDB.memberships.filter(m => m.user_id === currentUserId).map(m => m.organization_id);
        availableOrgs = appDB.organizations.filter(o => myOrgIds.includes(o.organization_id));

        if (availableOrgs.length === 0) {
            showToast('Permission Restriction: You must be a member of a committee to post an announcement.', 'warning');
            return;
        }
    }

    select.innerHTML = availableOrgs.map(o => `<option value="${o.organization_id}">${o.org_name}</option>`).join('');
    document.getElementById('announcementModal').classList.add('open');
}

function closeAnnouncementModal() {
    document.getElementById('announcementModal').classList.remove('open');
}

function submitNewAnnouncement() {
    const orgId = Number(document.getElementById('announcementOrgSelect').value);
    const title = document.getElementById('announcementTitleInput').value.trim();
    const desc = document.getElementById('announcementDescInput').value.trim();

    if (!title || !desc) {
        showToast('Please fill out both the title and message.', 'warning');
        return;
    }

    const newId = appDB.announcements.length > 0 ? Math.max(...appDB.announcements.map(a => a.announcement_id)) + 1 : 1;
    appDB.announcements.unshift({
        announcement_id: newId,
        organization_id: orgId,
        created_by: currentUserId,
        title: title,
        description: desc,
        posted_at: new Date().toISOString().split('T')[0]
    });

    persistDB();
    closeAnnouncementModal();
    showToast('Notice published successfully!', 'success');
    renderActiveTab();
}

// ============================================================================
// TAB 5: PROPOSE EVENT (CORE MEMBER INTERFACE)
// ============================================================================
function renderProposeEventTab(container) {
    const user = getUser(currentUserId);
    const orgs = appDB.organizations;
    const venues = appDB.venues;

    container.innerHTML = `
        <div class="section-card" style="max-width: 820px; margin: 0 auto;">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        <span>Propose New Club Event</span>
                    </h2>
                    <p class="section-subtitle">Submit event proposal for venue booking and faculty advisor approval</p>
                </div>
                <span class="badge badge-role">Proposer: ${user.full_name}</span>
            </div>

            <form id="proposeEventForm" onsubmit="handleProposeEventSubmit(event)">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label class="form-label">Event Title *</label>
                        <input type="text" id="propEventName" class="form-control" placeholder="e.g. CodeBash 2027 / AI Hackathon" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Organizing Committee / Club *</label>
                        <select id="propOrgId" class="form-control" required>
                            ${orgs.map(o => `<option value="${o.organization_id}">${o.org_name} - ${o.description.substring(0, 40)}...</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Campus Venue *</label>
                        <select id="propVenueId" class="form-control" onchange="updateVenueCapacityHint()" required>
                            ${venues.map(v => `<option value="${v.venue_id}" data-cap="${v.capacity}">${v.venue_name} (Max Seats: ${v.capacity})</option>`).join('')}
                        </select>
                        <span id="venueCapacityHint" class="form-help">Selected venue max capacity: 350 seats</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Event Date *</label>
                        <input type="date" id="propEventDate" class="form-control" required value="2026-11-25">
                        <span class="form-help">Trigger trg_prevent_venue_clash checks conflicts on this date</span>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Max Participants Capacity *</label>
                        <input type="number" id="propMaxParticipants" class="form-control" min="10" max="600" value="100" required>
                        <span class="form-help">Must not exceed venue capacity</span>
                    </div>

                    <div class="form-group full-width">
                        <label class="form-label">Event Description & Agenda *</label>
                        <textarea id="propEventDesc" class="form-control" placeholder="Provide detailed agenda, target audience, technical requirements..." required></textarea>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.85rem; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="switchTab('events')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Proposal</button>
                </div>
            </form>
        </div>
    `;

    updateVenueCapacityHint();
}

function updateVenueCapacityHint() {
    const venueSelect = document.getElementById('propVenueId');
    const hint = document.getElementById('venueCapacityHint');
    const maxInput = document.getElementById('propMaxParticipants');
    if (!venueSelect || !hint) return;

    const selectedOption = venueSelect.options[venueSelect.selectedIndex];
    const cap = selectedOption.getAttribute('data-cap');
    hint.innerText = `Selected venue max capacity: ${cap} seats`;
    if (maxInput && Number(maxInput.value) > Number(cap)) {
        maxInput.value = cap;
    }
}

function handleProposeEventSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('propEventName').value.trim();
    const orgId = Number(document.getElementById('propOrgId').value);
    const venueId = Number(document.getElementById('propVenueId').value);
    const eventDate = document.getElementById('propEventDate').value;
    const maxParticipants = Number(document.getElementById('propMaxParticipants').value);
    const desc = document.getElementById('propEventDesc').value.trim();

    const venue = getVenue(venueId);
    if (maxParticipants > venue.capacity) {
        showToast(`Capacity Constraint: Requested seats (${maxParticipants}) exceeds venue limit (${venue.capacity}).`, 'warning');
        return;
    }

    const newId = appDB.events.length > 0 ? Math.max(...appDB.events.map(ev => ev.event_id)) + 1 : 1;
    appDB.events.push({
        event_id: newId,
        organization_id: orgId,
        venue_id: venueId,
        created_by: currentUserId,
        approved_by: null,
        event_name: name,
        description: desc,
        event_date: eventDate,
        max_participants: maxParticipants,
        approval_status: 'Pending',
        event_status: 'Upcoming'
    });

    persistDB();
    showToast(`Event proposal for "${name}" submitted for approval!`, 'success');
    switchTab('approvals');
}

// ============================================================================
// TAB 6: FACULTY / ADMIN APPROVALS DESK
// ============================================================================
function renderApprovalsTab(container) {
    const user = getUser(currentUserId);
    const role = getRole(user.role_id);
    const isApprover = role.role_name === 'Faculty' || role.role_name === 'Administrator';

    const pendingEvents = appDB.events.filter(e => e.approval_status === 'Pending');
    const reviewedEvents = appDB.events.filter(e => e.approval_status !== 'Pending');

    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>Event Approvals & Venue Conflict Audit</span>
                    </h2>
                    <p class="section-subtitle">Evaluated by Faculty Advisors (Dr. Godbole) and College Administration (Dr. Chaudhari)</p>
                </div>
                <div>
                    ${!isApprover ? `
                        <span class="badge badge-pending">Current User (${role.role_name}) is View-Only. Switch to Faculty/Admin to approve.</span>
                    ` : `
                        <span class="badge badge-approved">${ICONS.check} Authorized Approver: ${user.full_name}</span>
                    `}
                </div>
            </div>

            <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.85rem; color: var(--text-main);">Pending Approval Queue (${pendingEvents.length})</h3>

            ${pendingEvents.length === 0 ? `
                <div style="text-align: center; padding: 2.5rem 1rem; background: var(--bg-input); border-radius: var(--radius-md); margin-bottom: 2rem;">
                    <p style="font-weight: 700; font-size: 0.95rem;">No pending event proposals awaiting review.</p>
                </div>
            ` : `
                <div class="table-responsive" style="margin-bottom: 2rem;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Club</th>
                                <th>Requested Date</th>
                                <th>Venue</th>
                                <th>Participants</th>
                                <th>Proposer</th>
                                <th>Venue Conflict Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingEvents.map(e => {
                                const org = getOrg(e.organization_id);
                                const venue = getVenue(e.venue_id);
                                const creator = getUser(e.created_by);

                                const clash = appDB.events.find(other => 
                                    other.event_id !== e.event_id &&
                                    other.venue_id === e.venue_id &&
                                    other.event_date === e.event_date &&
                                    other.approval_status === 'Approved' &&
                                    other.event_status !== 'Cancelled'
                                );

                                let clashBadge = clash 
                                    ? `<span class="badge badge-rejected">Conflict: "${clash.event_name}" booked</span>`
                                    : `<span class="badge badge-approved">${ICONS.check} Venue Available</span>`;

                                return `
                                    <tr>
                                        <td><strong>${e.event_name}</strong></td>
                                        <td><span class="badge badge-club">${org ? org.org_name : 'Club'}</span></td>
                                        <td>${e.event_date}</td>
                                        <td>${venue ? venue.venue_name : 'Venue'}</td>
                                        <td>${e.max_participants} seats</td>
                                        <td>${creator ? creator.full_name : 'Student'}</td>
                                        <td>${clashBadge}</td>
                                        <td>
                                            <div style="display: flex; gap: 0.4rem;">
                                                <button class="btn btn-success btn-sm" onclick="approveEventProposal(${e.event_id})" ${!isApprover ? 'disabled' : ''}>Approve</button>
                                                <button class="btn btn-danger btn-sm" onclick="rejectEventProposal(${e.event_id})" ${!isApprover ? 'disabled' : ''}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}

            <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.85rem; color: var(--text-main);">Reviewed Events Log</h3>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Club</th>
                            <th>Date</th>
                            <th>Venue</th>
                            <th>Approval Status</th>
                            <th>Approved By</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reviewedEvents.map(e => {
                            const org = getOrg(e.organization_id);
                            const venue = getVenue(e.venue_id);
                            const approver = getUser(e.approved_by);

                            return `
                                <tr>
                                    <td>${e.event_name}</td>
                                    <td>${org ? org.org_name : '-'}</td>
                                    <td>${e.event_date}</td>
                                    <td>${venue ? venue.venue_name : '-'}</td>
                                    <td><span class="badge ${e.approval_status === 'Approved' ? 'badge-approved' : 'badge-rejected'}">${e.approval_status}</span></td>
                                    <td>${approver ? approver.full_name : 'N/A'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function approveEventProposal(eventId) {
    const e = getEvent(eventId);
    if (!e) return;

    const clash = appDB.events.find(other => 
        other.event_id !== e.event_id &&
        other.venue_id === e.venue_id &&
        other.event_date === e.event_date &&
        other.approval_status === 'Approved' &&
        other.event_status !== 'Cancelled'
    );

    if (clash) {
        showToast(`Trigger trg_prevent_venue_clash_update: Cannot approve. Venue is already booked on ${e.event_date} by "${clash.event_name}".`, 'error');
        return;
    }

    e.approval_status = 'Approved';
    e.approved_by = currentUserId;
    persistDB();
    showToast(`Event "${e.event_name}" approved successfully! Registrations are now active.`, 'success');
    renderActiveTab();
}

function rejectEventProposal(eventId) {
    const e = getEvent(eventId);
    if (!e) return;
    e.approval_status = 'Rejected';
    persistDB();
    showToast(`Event proposal for "${e.event_name}" was rejected.`, 'info');
    renderActiveTab();
}

// ============================================================================
// TAB 7: ATTENDANCE DESK (ORGANIZER MARKING INTERFACE)
// ============================================================================
let selectedAttendanceEventId = 2; // Default to Design & UI/UX Sprint

function renderAttendanceTab(container) {
    const events = appDB.events;
    const currentEv = getEvent(selectedAttendanceEventId) || events[0];
    const regs = appDB.registrations.filter(r => r.event_id === currentEv.event_id);

    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                        <span>Event Attendance Desk</span>
                    </h2>
                    <p class="section-subtitle">Mark participant attendance to enable post-event feedback eligibility</p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <label style="font-size: 0.85rem; font-weight: 700;">Select Event:</label>
                    <select id="attendanceEventSelect" class="select-filter" onchange="changeAttendanceEvent(this.value)">
                        ${events.map(ev => `<option value="${ev.event_id}" ${ev.event_id === currentEv.event_id ? 'selected' : ''}>${ev.event_name} (${ev.event_date})</option>`).join('')}
                    </select>
                </div>
            </div>

            <div style="background: var(--bg-input); padding: 1.15rem 1.4rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <strong>Event:</strong> ${currentEv.event_name} | 
                    <strong>Date:</strong> ${currentEv.event_date} | 
                    <strong>Status:</strong> <span class="badge ${currentEv.event_status === 'Completed' ? 'badge-completed' : 'badge-upcoming'}">${currentEv.event_status}</span>
                </div>
                <div>
                    <span>Total Registered: <strong>${regs.length}</strong></span> |
                    <span>Attended: <strong>${regs.filter(r => r.participation_status === 'Attended').length}</strong></span>
                </div>
            </div>

            ${regs.length === 0 ? `
                <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <p>No registered students found for this event yet.</p>
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Full Name</th>
                                <th>Roll Number</th>
                                <th>Department</th>
                                <th>Registration Date</th>
                                <th>Current Status</th>
                                <th>Attendance Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${regs.map((r, i) => {
                                const u = getUser(r.user_id);
                                return `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td><strong>${u ? u.full_name : 'Unknown'}</strong></td>
                                        <td>${u ? (u.roll_no || 'Faculty/Admin') : '-'}</td>
                                        <td>${u ? u.department : '-'}</td>
                                        <td>${r.registered_at || 'Recorded'}</td>
                                        <td>
                                            <span class="badge ${r.participation_status === 'Attended' ? 'badge-approved' : (r.participation_status === 'Absent' ? 'badge-rejected' : 'badge-upcoming')}">${r.participation_status}</span>
                                        </td>
                                        <td>
                                            <div style="display: flex; gap: 0.45rem;">
                                                <button class="btn btn-success btn-sm" onclick="setAttendanceStatus(${r.registration_id}, 'Attended')">Mark Attended</button>
                                                <button class="btn btn-secondary btn-sm" onclick="setAttendanceStatus(${r.registration_id}, 'Absent')">Mark Absent</button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

function changeAttendanceEvent(newId) {
    selectedAttendanceEventId = Number(newId);
    renderActiveTab();
}

function setAttendanceStatus(regId, status) {
    const reg = getRegistration(regId);
    if (!reg) return;

    reg.participation_status = status;
    persistDB();
    showToast(`Participant marked as "${status}".`, 'success');
    renderActiveTab();
}

// ============================================================================
// TAB 8: ANALYTICS & FEEDBACK (VIEW: vw_event_feedback_analytics)
// ============================================================================
function renderAnalyticsTab(container) {
    const completedEvents = appDB.events.filter(e => e.event_status === 'Completed' || appDB.feedback.some(f => {
        const reg = getRegistration(f.registration_id);
        return reg && reg.event_id === e.event_id;
    }));

    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        <span>Event Analytics & Participant Feedback</span>
                    </h2>
                    <p class="section-subtitle">Real-time aggregate data mirroring database view <code>vw_event_feedback_analytics</code></p>
                </div>
            </div>

            <div class="table-responsive" style="margin-bottom: 2rem;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Organizing Club</th>
                            <th>Total Registered</th>
                            <th>Turnout (Attended)</th>
                            <th>Feedback Count</th>
                            <th>Average Star Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${completedEvents.map(e => {
                            const org = getOrg(e.organization_id);
                            const regs = appDB.registrations.filter(r => r.event_id === e.event_id);
                            const attendees = regs.filter(r => r.participation_status === 'Attended').length;
                            
                            const feedbacks = appDB.feedback.filter(f => {
                                const reg = getRegistration(f.registration_id);
                                return reg && reg.event_id === e.event_id;
                            });

                            const avgRating = feedbacks.length > 0 
                                ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
                                : 'N/A';

                            return `
                                <tr>
                                    <td><strong>${e.event_name}</strong></td>
                                    <td><span class="badge badge-club">${org ? org.org_name : 'Club'}</span></td>
                                    <td>${regs.length}</td>
                                    <td>${attendees} (${regs.length > 0 ? Math.round((attendees/regs.length)*100) : 0}%)</td>
                                    <td>${feedbacks.length} reviews</td>
                                    <td>
                                        <span style="color: #b45309; font-weight: 800;">★ ${avgRating}</span> / 5.0
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">Verified Participant Feedback Reviews</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
                ${appDB.feedback.map(f => {
                    const reg = getRegistration(f.registration_id);
                    const student = reg ? getUser(reg.user_id) : null;
                    const ev = reg ? getEvent(reg.event_id) : null;

                    return `
                        <div class="event-card" style="padding: 1.15rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.45rem;">
                                <strong>${ev ? ev.event_name : 'Event'}</strong>
                                <span style="color: #b45309; font-weight: 800;">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
                            </div>
                            <p style="font-size: 0.86rem; color: var(--text-main); font-style: italic; margin-bottom: 0.65rem;">"${f.comments}"</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">- ${student ? student.full_name : 'Verified Attendee'} (${student ? student.department : ''})</span>
                                <button class="btn-icon-danger" style="font-size: 0.7rem; padding: 0.15rem 0.45rem;" onclick="deleteFeedbackAction(${f.feedback_id})" title="Delete Feedback Review">
                                    ${ICONS.trash} <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}
// ============================================================================
// TAB 9: DBMS 3NF RELATIONAL SCHEMA & LIVE TABLE EXPLORER
// ============================================================================
function renderDbmsSchemaTab(container) {
    const tableKeys = ['roles', 'users', 'organizations', 'venues', 'memberships', 'events', 'registrations', 'feedback', 'announcements'];

    container.innerHTML = `
        <div class="section-card">
            <div class="section-header">
                <div>
                    <h2 class="section-title">
                        <svg class="icon icon-md" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                        <span>Relational DBMS 3NF Schema & Live Tables</span>
                    </h2>
                    <p class="section-subtitle">Examine the 9 normalized entities, foreign key graphs, and live database state</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="resetDatabaseToDefault()">
                    ${ICONS.refresh}
                    <span>Reset Abstract Data</span>
                </button>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                ${tableKeys.map((tbl) => `
                    <button class="btn btn-secondary btn-sm" onclick="showTableData('${tbl}')">
                        <strong>${tbl}</strong> (${appDB[tbl].length})
                    </button>
                `).join('')}
            </div>

            <div id="tableDataDisplayArea">
                <!-- Injected via showTableData() -->
            </div>
        </div>
    `;

    showTableData('events');
}

function showTableData(tableName) {
    const area = document.getElementById('tableDataDisplayArea');
    if (!area) return;

    const rows = appDB[tableName] || [];
    if (rows.length === 0) {
        area.innerHTML = `<p style="padding: 1rem; color: var(--text-muted);">Table <strong>${tableName}</strong> is empty.</p>`;
        return;
    }

    const cols = Object.keys(rows[0]);

    area.innerHTML = `
        <div style="margin-bottom: 0.65rem; display: flex; justify-content: space-between; align-items: center;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Table: <code>${tableName}</code> <span style="font-weight: normal; color: var(--text-muted);">(${rows.length} records)</span></h4>
        </div>
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        ${cols.map(c => `<th>${c}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            ${cols.map(c => `<td>${row[c] !== null && row[c] !== undefined ? String(row[c]) : '<span style="color: #94a3b8;">NULL</span>'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function resetDatabaseToDefault() {
    if (confirm('Reset entire database state back to initial abstract data?')) {
        appDB = resetStoredDB();
        persistDB();
        showToast('Database reset to original abstract specification.', 'info');
        renderActiveTab();
    }
}

// ============================================================================
// INITIALIZATION & BACKEND API SYNC
// ============================================================================
const API_BASE = window.location.origin.includes('5000') ? '/api' : 'http://localhost:5000/api';
let isBackendLive = false;

async function checkBackendConnection() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    try {
        const res = await fetch(`${API_BASE}/dbms/status`, { method: 'GET' });
        if (res.ok) {
            const data = await res.json();
            isBackendLive = true;
            if (dot) dot.style.background = '#1b7a48';
            if (text) text.innerText = data.isLive ? 'Live MySQL 8.0' : 'Backend Connected';
        } else {
            throw new Error('Non-200');
        }
    } catch (e) {
        isBackendLive = false;
        if (dot) dot.style.background = '#c45d2c';
        if (text) text.innerText = 'Offline / Standalone';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    checkBackendConnection();
    refreshUserDropdown();
    renderGateway();
    initAuthGate();
});
