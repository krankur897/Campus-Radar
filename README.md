# CampusRadar 📡

> **TAGLINE:** *"Everything Happening on Campus, In One Place."*

CampusRadar is a centralized campus information and opportunity discovery platform that organizes **College Events**, **Placement & Internship Opportunities**, **Important Institutional Announcements**, **Campus Clubs**, and **Past Events** into one searchable and dark-mode interface.

This project is designed and built as an **Academic Exhibition Prototype**.

---

## 🎯 Product Positioning & Architecture

Students receive campus information through scattered communication channels such as emails, WhatsApp groups, forms, notices, club messages, placement updates, and institutional announcements. Important information can therefore be missed.

### Conceptual Architecture
```
                 CAMPUS INFORMATION
                         ↓
                    CAMPUSRADAR
                         ↓
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
     EVENTS          PLACEMENTS       ANNOUNCEMENTS
       ↓                 ↓                 ↓
       └─────────────────┼─────────────────┘
                         ↓
                 STUDENT DISCOVERY
                         ↓
              SEARCH / FILTER / EXPLORE
```

### Future Institutional Vision
```
Authorized Publishers → Validation / Moderation → CampusRadar → Personalized Student Discovery
```

> **IMPORTANT ACADEMIC POSITIONING:**
> - **CURRENT IMPLEMENTATION:** Centralized campus information and opportunity discovery platform.
> - **FUTURE VISION:** Two-way, role-based campus communication ecosystem.
> - Authentication is clearly labeled as **"Prototype Authentication"** to reflect academic exhibition standards without falsely claiming real institutional VTOP/SSO database synchronization.

---

## 👥 User Roles & Permissions

1. **Student / Visitor**
   - Browse, search, and filter events, placements, announcements, and clubs.
   - Bookmark events using `localStorage`.
   - Access Student Personal Dashboard with deadline tracking.
   - Register for events/apply for placements via external links (`rel="noopener noreferrer"`).
2. **Club President / Club In-Charge**
   - Access Club Manager portal.
   - Create, edit, and delete events for their affiliated club.
   - Submit events for admin moderation / request Campus Highlights.
3. **Placement Head / Placement Cell**
   - Create, edit, and delete placement & internship drives.
   - Set CTC/stipend compensation, minimum CGPA, eligible branches, backlog rules, and drive dates.
4. **Faculty / Academic In-Charge**
   - Create, edit, and delete official announcements.
   - Assign urgency badges (`URGENT`, `DEADLINE`, `ACADEMIC`, `EXAM`, `HOSTEL`) and department source links.
5. **Super Admin**
   - Manage all events, placements, announcements, clubs, and users.
   - Content Moderation Workflow (Approve or Reject pending club event submissions).
   - Toggle marquee **Campus Highlight** status.

---

## 🔑 Pre-Configured Exhibition Demo Accounts

All demo accounts use the common password: **`demo123`**

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Student** | `student@demo.campusradar.local` | Personal dashboard, bookmarks, discovery hubs |
| **Club President** | `club@demo.campusradar.local` | Club Manager, event creation & submission |
| **Placement Head** | `placement@demo.campusradar.local` | Placement Hub management, job posting |
| **Faculty In-Charge** | `faculty@demo.campusradar.local` | Notice Board management, academic circulars |
| **Super Admin** | `admin@demo.campusradar.local` | Content moderation, highlight toggle, full system stats |

> ⚡ **Quick Login Presets:** The login page (`/login.html`) features one-click demo login buttons for instant role switching during live demonstrations.

---

## 🛠️ Technology Stack & Database Architecture

- **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Design System), JavaScript (ES6 Modules).
- **Styling**: Modern dark palette (`#0B0F17` background, `#131A29` surface, `#00F2FE` cyan sweep accent, `#7F56D9` purple secondary accent), glassmorphism cards, micro-animations, Inter typography.
- **Backend**: Node.js & Express.js REST API.
- **Database**: MongoDB with Mongoose ODM.
- **Zero-Config DB Fallback**: Connects to local MongoDB (`mongodb://127.0.0.1:27017/campusradar`) and automatically falls back to an in-memory MongoDB instance (`mongodb-memory-server`) if local MongoDB is not running, ensuring **100% out-of-the-box startup reliability**.
- **Authentication**: JWT session tokens with `bcryptjs` password hashing.

---

## 📁 Project Structure

```
campusradar/
│
├── client/
│   ├── assets/
│   │   └── logo.png
│   ├── css/
│   │   ├── global.css          # Design tokens, variables, keyframe animations
│   │   ├── components.css      # Navbar, buttons, badges, modals, toasts, radar widget
│   │   ├── pages.css           # Hero section, filter bars, card hybrid grid, admin layout
│   │   └── responsive.css     # Mobile drawer & tablet breakpoints
│   ├── js/
│   │   ├── utils.js            # Date formatting, deadline calculators, HTML escaping, bookmarks
│   │   ├── api.js              # Centralized REST fetch client
│   │   ├── auth.js             # Session storage, role checks, quick demo login
│   │   ├── main.js             # Navbar rendering, footer, toast notifications
│   │   ├── events.js           # Events discovery hub logic
│   │   ├── event-details.js    # Single event view logic
│   │   ├── placements.js       # Placement hub filtering & cards
│   │   ├── announcements.js    # Notice board urgency filters
│   │   ├── clubs.js            # Club directory tabs
│   │   ├── dashboard.js        # Student personal dashboard
│   │   └── admin.js            # Role-aware management portal & moderation workflow
│   ├── index.html              # Home page
│   ├── events.html             # Events Discovery Hub
│   ├── event-details.html      # Event detail view
│   ├── placements.html         # Placement Hub
│   ├── announcements.html      # Important Announcements
│   ├── clubs.html              # Club Directory
│   ├── past-events.html        # Past Events Archive
│   ├── login.html              # Prototype Authentication UI
│   ├── dashboard.html          # Student Dashboard
│   └── admin.html              # Admin & Management Portal
│
├── server/
│   ├── config/
│   │   └── db.js               # MongoDB connection with MongoMemoryServer fallback
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Placement.js
│   │   ├── Announcement.js
│   │   └── Club.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── placementRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── clubRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── seed/
│   │   └── seedData.js         # Comprehensive demo dataset seed script
│   └── server.js               # Express application entry point
│
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js `v18+`
- npm `v9+`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Application
```bash
npm start
```
The application will launch on **`http://localhost:5000`**.
If the database is empty, it will automatically run the seed script on startup!

---

## 🎬 60–90 Second Exhibition Demo Workflow

1. **Step 1 — Home Page (`/index.html`)**: Open CampusRadar. Inspect tagline, brand logo, animated digital radar widget, and Campus Highlights.
2. **Step 2 — Events Discovery (`/events.html`)**: Search `"Hackathon"`, filter by `"Technical"` category and `"This Week"`. Observe dynamic event counter.
3. **Step 3 — Event Details (`/event-details.html`)**: Open event details. Inspect poster, venue, deadline badge, rules, and click **`REGISTER NOW ↗`**.
4. **Step 4 — Clubs Directory (`/clubs.html`)**: Switch tabs between Technical and Cultural clubs. View active event counters.
5. **Step 5 — Placement Hub (`/placements.html`)**: Filter by Full-Time opportunities. Inspect Google, Microsoft, and Cred packages, CGPA cutoff, and branch eligibility.
6. **Step 6 — Notice Board (`/announcements.html`)**: Filter by `URGENT` badge. Read exam timetable circulars.
7. **Step 7 — Login (`/login.html`)**: Click **`🏛️ Club President`** quick login demo button.
8. **Step 8 — Event Submission (`/admin.html`)**: Open Club Manager, click **`+ Create Event`**, submit new workshop details (`Robotics & Drone AI Workshop 2026`).
9. **Step 9 — Account Switch (`/login.html`)**: Click **`⚡ Super Admin`** quick login demo button.
10. **Step 10 — Content Moderation (`/admin.html`)**: Navigate to Content Moderation tab, approve pending submission, and toggle Campus Highlight.
11. **Step 11 — Verification (`/events.html`)**: Verify the newly approved event appears live on the public Events Discovery Hub.

---

## 🔮 Future Scope & Planned Enhancements

- Production integration with college SSO / OAuth2.
- Institutional database synchronization with ERP/VTOP systems.
- Push and email deadline alerts for saved events.
- Advanced analytics for campus engagement and placement metrics.
- Native iOS & Android mobile companion applications.
