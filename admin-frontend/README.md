# 🎓 College Diaries — Admin Dashboard

> Full-stack admin dashboard for **College Diaries by Path Finder**, built with the **MERN stack** (React + Vite + Express + Supabase).

---

## 📁 Project Structure

```
admin-dashboard/
├── backend/          # Express.js (ESM) API server
│   ├── controllers/  # Route handlers & business logic
│   ├── db/           # Supabase client setup
│   ├── middleware/   # JWT auth middleware
│   ├── routes/       # API route definitions
│   ├── service.js    # Express entry point
│   └── .env          # Environment variables (git-ignored)
│
└── frontend/         # React + Vite + Tailwind CSS app
    ├── src/
    │   ├── pages/    # Admin pages (Login, Dashboard, etc.)
    │   ├── context/  # React Context API (auth state)
    │   └── components/
    └── index.html
```

---

## ⚡ Quick Start

### Backend

```bash
cd backend
npm install
cp .envExample .env    # fill in your values
npm run dev            # starts on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # starts on http://localhost:5173
```

---

## 🔧 Environment Variables (`backend/.env`)

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
JWT_SECRET="your-jwt-secret"
PORT=3000
```

| Variable                    | Required | Description                      |
| --------------------------- | -------- | -------------------------------- |
| `SUPABASE_URL`              | ✅       | Your Supabase project URL        |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅       | Service role key (bypasses RLS)  |
| `JWT_SECRET`                | ✅       | Secret key used to sign JWTs     |
| `PORT`                      | ❌       | Server port (defaults to `3000`) |

---

## 🔐 Authentication Flow

Admin authentication uses **JWT-based sessions**.

1. Admin submits email + password via `POST /api/admin/login`
2. Backend fetches admin record from the `admin_users` table in Supabase
3. Password is verified with a **plain string comparison** against the stored value
4. On success, a signed JWT (valid 7 days) is returned
5. All protected routes require the `Authorization: Bearer <token>` header
6. The `verifyToken` middleware decodes and attaches `req.admin` for downstream handlers

> **Note:** Passwords are stored as plain text in the `admin_users` table.
> Consider migrating to bcrypt hashing for production deployments.

---

## 📡 API Endpoints

### Admin Auth

| Method | Endpoint              | Description                         | Auth |
| ------ | --------------------- | ----------------------------------- | ---- |
| POST   | `/api/admin/login`    | Login and receive JWT token         | ❌   |
| GET    | `/api/admin/profile`  | Get logged-in admin profile         | ✅   |

### College Data

| Method | Endpoint                    | Description                             | Auth |
| ------ | --------------------------- | --------------------------------------- | ---- |
| GET    | `/api/colleges`             | List all colleges (lightweight)         | ✅   |
| GET    | `/api/college/:code`        | Full college master table by code       | ✅   |

### Users / Applications

| Method | Endpoint         | Description                  | Auth |
| ------ | ---------------- | ---------------------------- | ---- |
| GET    | `/api/users`     | List all user applications   | ✅   |

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

### `admin_users`
| Column       | Type    | Notes                |
| ------------ | ------- | -------------------- |
| `admin_id`   | UUID PK | Auto-generated       |
| `email`      | TEXT    | Unique, lowercase    |
| `password`   | TEXT    | Plain text (see note)|
| `full_name`  | TEXT    |                      |
| `role`       | TEXT    | Defaults to `admin`  |
| `created_at` | TIMESTAMPTZ | Auto                |

### `colleges`
| Column            | Type        | Notes               |
| ----------------- | ----------- | ------------------- |
| `college_code`    | VARCHAR(20) | PK                  |
| `college_name`    | TEXT        |                     |
| `college_address` | TEXT        |                     |

### `cutoff_data`
| Column              | Type          | Notes                              |
| ------------------- | ------------- | ---------------------------------- |
| `id`                | SERIAL PK     |                                    |
| `college_code`      | VARCHAR(20)   | FK → colleges                      |
| `dept_id`           | INTEGER       | FK → departments                   |
| `caste_category`    | VARCHAR(10)   | OC, BC, BCM, MBC, SC, SCA, ST     |
| `cutoff_mark`       | DECIMAL(10,2) | Avoids float rounding errors       |
| `rank`              | INTEGER       |                                    |
| `seats_filling`     | TEXT          |                                    |
| `total_seats_in_dept` | INTEGER     |                                    |

---

## 📝 Changelog

### v1.6.0 — 2026-04-24
**Typography, Fonts, and Animation Upgrades**
- Upgraded the font system to use a dual-font premium layout: **Outfit** for headings and **Plus Jakarta Sans** for body text.
- Enhanced Navbar styling with bolder (`font-bold`) and larger (`text-base`) texts for better presence.
- Increased readability in the `DataTable` by bumping the data row text size to `text-base` and the column headings to `font-extrabold text-sm`.
- Implemented **Framer Motion staggered row animations** in the `DataTable`, allowing rows to beautifully slide and fade in one-by-one.
- Enabled global smooth scrolling behavior across the entire application.

---

### v1.5.0 — 2026-04-24
**DataTable Premium Overhaul & Readability Improvements**
- Completely redesigned `DataTable.jsx` for a premium, modern aesthetic.
- Added sticky headers with a glassmorphism effect (`backdrop-blur-sm`).
- Enhanced row readability with better contrast (`text-gray-700`, `font-medium`) and soft hover effects (`hover:bg-blue-50/40`).
- Implemented a custom scrollbar (`.custom-scrollbar`) in `index.css` for elegant horizontal scrolling without squishing text.
- Upgraded the search bar with focus rings, icons, and a floating appearance.

---

### v1.4.0 — 2026-04-24
**UI Enhancements & Global Font Change**
- Changed global font family to **Poppins** for a modern, cleaner look across the dashboard.
- Removed the `user_id` column from the Users table display for better clarity.
- Enhanced `UsersPage` typography with dynamic sizing, gradients, and better responsive padding for mobile screens.
- Upgraded `LoadingSpinner` with a beautiful animated Framer Motion loader and pulsing ring.

---

### v1.3.0 — 2026-04-24
**Admin Login: Removed bcrypt, switched to plain password comparison**
- Removed `bcrypt` import and `bcrypt.compare()` call from `adminController.js`
- Password is now verified using a direct string equality check (`password !== admin.password`)
- Simplifies the auth flow for development; passwords stored as-is in `admin_users` table
- Removed the `bcrypt` dependency from the login path entirely

---

### v1.2.0 — 2026-04-24
**Git Merge Conflict Resolution in `collegeRoutes.js`**
- Resolved syntax errors caused by Git merge conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`)
- Kept the "Latest commit" version that uses `GET` requests for college endpoints
- Backend server starts successfully without route-level errors

---

### v1.1.0 — 2026-04-21
**Admin Auth Audit — bcrypt verification confirmed**
- Audited admin login flow for security vulnerabilities
- Confirmed bcrypt was correctly applied to password comparison at login time
- No changes needed at the time; auth flow was operational

---

### v1.0.0 — 2026-04-14
**Initial Project Setup**
- Initialized MERN-stack admin dashboard for "College Diaries by Path Finder"
- Backend: Express.js with ESM (`"type": "module"`), connected to Supabase
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Implemented admin login with JWT (7-day expiry) and `verifyToken` middleware
- Built `GET /api/colleges` and `GET /api/college/:code` (College Master Table)
- Added React Context API for auth state management (avoid prop-drilling)
- Created `admin_users`, `colleges`, `departments`, `cutoff_data` tables in Supabase
- Used `DECIMAL(10,2)` for cutoff marks to prevent floating-point precision issues
- Added B-Tree indexes on `college_code`, `cutoff_mark`, `caste_category` for performance

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express.js (ESM)               |
| Database   | PostgreSQL via Supabase                 |
| Auth       | JWT (`jsonwebtoken`)                    |
| State Mgmt | React Context API                       |

---

## 👤 Author

**Praveen Kumaran** — College Diaries by Path Finder
