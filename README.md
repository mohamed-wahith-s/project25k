# 🎓 College Diaries by PathFinder — Admin & Counseling Platform

A full-stack MERN-style web application for TNEA college counseling, featuring an admin dashboard, college/department search, cutoff analytics, and subscription management.

---

## 📁 Project Structure

```
Counceling-Project/
├── backend/                        # Node.js + Express API server
│   ├── controllers/
│   │   ├── authController.js       # Admin authentication (JWT + bcryptjs)
│   │   ├── collegeController.js    # College CRUD & search logic
│   │   ├── departmentController.js # Department data logic
│   │   └── paymentController.js    # Razorpay payment integration
│   ├── middlewares/
│   │   └── authMiddleware.js       # JWT token verification middleware
│   ├── models/                     # Data models / schema definitions
│   ├── routes/
│   │   ├── authRoutes.js           # POST /api/auth/*
│   │   ├── collegeRoutes.js        # GET  /api/colleges/*
│   │   ├── departmentRoutes.js     # GET  /api/departments/*
│   │   └── paymentRoutes.js        # POST /api/payment/*
│   ├── db.js                       # Supabase connection setup
│   ├── server.js                   # Express entry point
│   ├── .env                        # Environment variables (gitignored)
│   ├── package.json
│   └── requirement.txt             # Python deps (for parser.py)
│
├── frontend/                       # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Responsive navbar with hamburger menu
│   │   │   ├── Footer.jsx
│   │   │   ├── SearchSidebar.jsx
│   │   │   ├── CollegeRow.jsx
│   │   │   ├── CollegeWizard.jsx
│   │   │   ├── TNEAResultRow.jsx
│   │   │   ├── FloatingCallButton.jsx
│   │   │   ├── UnlockProCard.jsx
│   │   │   ├── row/
│   │   │   ├── search/
│   │   │   ├── subscription/
│   │   │   ├── ui/
│   │   │   └── wizard/
│   │   ├── context/                # React Context API for global state
│   │   ├── data/                   # Static JSON data files
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CollegeSearch.jsx
│   │   │   ├── Dashboard.jsx       # Admin dashboard
│   │   │   ├── LoginPage.jsx       # Admin login
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SubscriptionPage.jsx
│   │   │   └── TNEADashboard.jsx
│   │   ├── utils/
│   │   │   ├── apiBase.js          # Centralized Axios instance
│   │   │   └── razorpayUtils.js    # Razorpay payment helpers
│   │   ├── App.jsx                 # Routes & layout
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express v5 | REST API server |
| Supabase (`@supabase/supabase-js`) | PostgreSQL database & auth |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT-based admin session management |
| Razorpay SDK | Payment order creation & verification |
| dotenv | Environment variable management |
| CORS | Cross-origin request handling |
| nodemon | Development auto-reload |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Router DOM v6 | Client-side routing |
| lucide-react | Icon library |
| Axios (via `apiBase.js`) | Centralized HTTP requests |

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> ⚠️ Never commit `.env` to version control.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- A Supabase project (with tables: `colleges`, `departments`, `applications`, etc.)

### 1. Clone the repository
```bash
git clone <repo-url>
cd Counceling-Project
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev        # Starts nodemon on port 5000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server (typically port 5173)
```

> **Note:** Always run `cd backend` or `cd frontend` before `npm run dev`. Running `npm run dev` from the root `Counceling-Project/` folder will fail — there is no root-level `package.json` with scripts.

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Admin login, returns JWT | ❌ |
| POST | `/api/auth/signup` | Register new admin | ❌ |

### Colleges — `/api/colleges`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/colleges` | List all colleges | ❌ |
| GET | `/api/colleges/search` | Search colleges by filters | ❌ |
| GET | `/api/colleges/:id` | Get college by ID | ❌ |

### Departments — `/api/departments`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/departments` | List departments (filterable by college) | ❌ |

### Payments — `/api/payment`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payment/create-order` | Create Razorpay order | ✅ JWT |
| POST | `/api/payment/verify` | Verify Razorpay payment signature | ✅ JWT |

---

## 🔐 Authentication Flow

1. Admin submits credentials via `POST /api/auth/login`
2. `authController.js` looks up the user in Supabase, verifies password with `bcryptjs.compare()`
3. On success, signs a JWT with `jsonwebtoken` and returns it
4. Frontend stores JWT (via Context API) and attaches it as `Authorization: Bearer <token>` on protected requests
5. `authMiddleware.js` verifies the token on every protected route

---

## 💳 Payment Flow (Razorpay)

1. Frontend calls `POST /api/payment/create-order` to create an order on Razorpay
2. Razorpay Checkout opens on the client
3. On successful payment, frontend sends signature + payment details to `POST /api/payment/verify`
4. Backend verifies HMAC signature and updates subscription status in Supabase

---

## 🌐 Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `Home.jsx` | Landing page |
| `/search` | `CollegeSearch.jsx` | General college and department directory |
| `/eligible-colleges` | `EligibleColleges.jsx` | Pro-exclusive personalized cutoff matching |
| `/tnea` | `TNEADashboard.jsx` | TNEA cutoff data dashboard |
| `/login` | `LoginPage.jsx` | Admin login |
| `/signup` | `SignupPage.jsx` | User registration |
| `/dashboard` | `Dashboard.jsx` | Admin dashboard (protected) |
| `/profile` | `ProfilePage.jsx` | User/admin profile |
| `/subscription` | `SubscriptionPage.jsx` | Subscription plans & payment |

---

## 🗂️ Key Frontend Utilities

### `src/utils/apiBase.js`
Centralized Axios instance. All API calls across components and context files must use this instead of hardcoding URLs.

```js
import api from '../utils/apiBase';
const res = await api.get('/colleges');
```

---

## 📱 Responsive Design

The frontend is fully responsive across all screen sizes:
- **Desktop**: Full navbar, multi-column layouts
- **Mobile**: Hamburger menu (`☰`) toggles a slide-in nav drawer; single-column layouts

---

## 🔄 Changelog

### 2026-04-27 — Eligible Colleges Feature & Search Optimization
- **`EligibleColleges.jsx`** *(new)* — Created a dedicated, Pro-exclusive page for matching students with eligible colleges based on their saved `cutoff` mark and `caste` category.
  - Automatically fetches the user's profile data to provide a personalized matching experience.
  - Client-side filtering ensures users only see departments where their cutoff is greater than or equal to the requirement.
  - Handles incomplete profile states by prompting the user to update their academic details.
- **`CollegeSearch.jsx`** — Reverted the global college search page to act as a general directory, removing manual cutoff and caste filter inputs to simplify the browsing experience. Fixed rendering bugs associated with removed state.
- **`Navbar.jsx`** — Added desktop and mobile navigation links for "Eligible Colleges", visible only to Pro subscribers.

### 2026-04-25 — Navbar Profile Dropdown & TNEA Rank Edit
- **`Navbar.jsx`** — Replaced static user name badge with a **clickable avatar button** (shows user initials)
- Clicking the avatar opens an animated dropdown panel showing:
  - Full name + Pro/Free badge
  - 📧 Email
  - 📱 Mobile number
  - 🏆 TNEA Rank — displayed as `#<rank>` if set; otherwise shows **"Set your TNEA rank"** edit button
- Inline rank editor: input field + ✓ Save / ✗ Cancel buttons; pressing `Enter` saves, `Escape` cancels
- Clicking outside the dropdown closes it cleanly (via `useRef` + `useEffect`)
- **`authController.js`** — Added `updateTneaRank` controller: `PATCH /api/auth/profile/tnea-rank` (JWT-protected), validates & updates `tnea_ranking` in `user_applications`
- **`authController.js`** — `loginUser` and `registerUser` now include `tnea_ranking` in their response payloads
- **`authRoutes.js`** — Registered `router.patch('/profile/tnea-rank', protect, updateTneaRank)`

### 2026-04-25 — Dashboard (Home Page) Redesign & Mobile Responsiveness

- **Removed** Eligibility stat card and old Edit Profile button + `EditProfileModal` (replaced by Navbar Settings drawer)
- **New sections added to `Dashboard.jsx`:**
  - **Hero Banner** — dark gradient, personalized welcome, Pro status widget (with expiry date) or Upgrade CTA
  - **Floating Stat Cards** — **TNEA Cutoff** (Calculated from Physics, Chemistry, Maths), Caste Category, TNEA Rank (3 cards, no Eligibility)
  - **Quick Actions** — College Search card + Pro upgrade card (free users) or Active Pro card (subscribed users)
  - **Platform Features** — 3 cards (Smart College Search · Free, Cutoff Analytics · Pro, Expert Counseling · Pro)
  - **TNEA 2026 Timeline** — 6 key milestones with done/upcoming states and official source note
  - **Stats Band** — dark gradient strip with 10K+ students, 500+ colleges, 98% success, 20+ counselors
  - **Upgrade CTA** — full-width premium banner (only shown to free users) with pricing + feature list
- **Mobile Responsiveness Enhancements:**
  - Extensively revised `Dashboard.jsx` with mobile-first `sm:`, `md:`, and `lg:` tailwind classes.
  - Reduced paddings, font sizes, gap sizes, and icon dimensions across mobile and tablet breakpoints for optimal readability and lack of overflow.



#### Backend
- **`authController.js` `updateProfile`** — Extended to accept and persist: `email`, `phone` (→ `mobile_number`), `dob` (→ `date_of_birth`), `tnea_ranking`, `physics_mark`, `chemistry_mark`, `maths_mark`, `caste` (→ `caste_category`). Now returns the full user object including all academic fields + `subscriptionExpiry`.

#### Frontend
- **`SettingsModal.jsx`** *(new)* — Right-side slide-in drawer with two sections:
  - **Basic Info** (all users): Full Name, Email, Mobile, Date of Birth — always editable
  - **Academic Details** (Pro only): Physics, Chemistry, Maths marks (3-column grid), TNEA Rank, Caste Category dropdown — Pro members can edit; free users see a lock screen with an "Upgrade to Pro" CTA
  - Saves via `PUT /api/auth/profile` → updates global user state via `updateUser()`
  - Pre-fills fields with existing user values on open
- **`Navbar.jsx`** — Dropdown now has a **Settings** button (opens `SettingsModal`) and a **Sign out** button, both with icon badges. `SettingsModal` is rendered outside the `<nav>` so it overlays the full page correctly.



#### Backend
- **`paymentController.js`** — `verifyPayment` now does **one thing only**: verify Razorpay HMAC signature → flip `is_paid = true` + set `last_paid_date`. Metadata (marks/caste/rank) completely removed from payment flow.
- **`authController.js`** — `loginUser` now checks `is_paid + last_paid_date + 3-month window` to compute `isSubscribed`. Returns `subscriptionExpiry` date. If expired, **auto-flips `is_paid = false`** in Supabase at login time.
- **`authMiddleware.js`** — Added `requirePaid` middleware: fetches `is_paid` + `last_paid_date` from DB on every premium request, auto-expires (flips `is_paid = false`) if 3-month window has passed, returns `403 { expired: true }` for the frontend to handle.
- **`collegeRoutes.js`** — Full cutoff list and college detail routes now require `protect + requirePaid`. Catalog and departments remain public.
- **`jobs/subscriptionExpiry.js`** *(new)* — `node-cron` daily job (00:00) that bulk-expires all `user_applications` where `is_paid = true` and `last_paid_date` is older than 3 months.
- **`server.js`** — Registers the cron job at startup. Added `/health` endpoint.

#### Frontend
- **`SubscriptionPage.jsx`** — Three distinct states:
  1. **Guest (not logged in)**: Plan preview with locked button + "**Login & Proceed**" CTA card with link to `/login?from=/subscribe`
  2. **Logged in, not subscribed**: Clean payment card with user greeting, pays via Razorpay, calls `updateUser(vData.user)` after verify
  3. **Subscribed**: Shows ✅ confirmation + subscription **expiry date** from `subscriptionExpiry`
- **`LoginPage.jsx`** — After login, redirects back to `location.state.from` (e.g. `/subscribe`) so the Login & Proceed flow works end-to-end.


- Implemented hamburger menu in `Navbar.jsx` for mobile screen sizes
- Added slide-in mobile nav drawer with smooth open/close animation
- Ensured all layout components adjust seamlessly across breakpoints
- Updated `README.md` to reflect project-wide changes

### 2026-04-25 — Centralized Backend API Configuration
- Created `src/utils/apiBase.js` as a single Axios instance with base URL + interceptors
- Refactored all frontend components and context files to import from `apiBase.js`
- Eliminated all hardcoded backend URLs across the codebase

### 2026-04-24 — Profile Page UI & Keep-Alive Cron Job
- Resolved UI collision issues on `ProfilePage.jsx` with a responsive, clean layout
- Implemented a `node-cron` job pinging the health endpoint and Supabase every 7 minutes to prevent platform idling

### 2026-04-24 — Dashboard UI & Typography Overhaul
- Applied bold, premium typography (larger font sizes) to navbar and table headers in `Dashboard.jsx`
- Increased row font size for better accessibility
- Added stagger-based scroll animations using Framer Motion

### 2026-04-24 — Removed Bcrypt Dependency Conflicts
- Replaced `bcrypt` (native bindings) with `bcryptjs` (pure JS) for cross-platform compatibility
- Updated `authController.js` to use `bcryptjs`

### 2026-04-24 — Resolved Git Merge Conflicts
- Resolved merge conflict markers in `collegeRoutes.js` and `collegeController.js`
- Kept the latest `GET`-based API version as the resolved implementation

### 2026-04-21 — Admin Authentication Audit
- Audited `authController.js` for correct bcrypt password hashing
- Verified JWT signing and verification end-to-end

### 2026-04-16 — Email Notification Setup
- Fixed `emailTest.js` configuration to correctly send transactional emails

### 2026-04-14 — Initial Project Build
- Bootstrapped backend with Express + Supabase integration
- Scaffolded React frontend with Vite + Tailwind CSS + Framer Motion
- Implemented admin auth, college/department APIs, and Razorpay payment flow
- Parsed TNEA 2025 cutoff PDF into structured JSON using `parser.py`

---

## 🧑‍💻 Development Notes

- Run `npm run dev` **from inside** `backend/` or `frontend/` — not from the project root
- The backend uses **Express v5** (`^5.2.1`) — async error handling works without `try/catch` wrappers in some cases
- Supabase client is initialized once in `db.js` and shared across controllers
- All environment variables are loaded at server startup via `dotenv.config()`

---

## 📄 License

ISC — PathFinder College Diaries
