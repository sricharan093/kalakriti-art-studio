# KalaKriti Art Studio — Full-Stack MERN Web Application

A full-stack art studio website and administrative operations platform built for the **GDGC Full-Stack Assignment**. The application showcases handcrafted Indian folk paintings, automated mural wall painting bookings, and custom wheel-thrown pottery commissions.

---

## 🎨 Discovered Seed Dataset Structure

The application was built from the ground up after inspecting and extracting `seedData.zip` (`seed-data/seedData/seed.json`):

1. **Paintings Catalogue (`paintings`)**:
   - 12 authentic Indian folk paintings (`p-001` through `p-012`) including Madhubani, Warli, Tanjore, Pattachitra, Kalamkari, Gond, Cheriyal, Rajasthani Miniature, Pichwai, Nirmal, and Kerala Mural styles.
   - Fields: `id`, `title`, `artist`, `description`, `price` (in INR), `imageUrl` (`images/p-001.jpg` ... `p-012.jpg`), and `status` (`available` or `sold`).
2. **Pottery Forms (`potteryItems`)**:
   - 5 classical clay items: `i-01: Kulhad (clay cup)`, `i-02: Surahi (water jug)`, `i-03: Matka (water pot)`, `i-04: Diya set`, `i-05: Gamla (planter)`.
3. **Mineral Glazes (`glazes`)**:
   - 6 natural glazes: `g-01: Kumkum Red`, `g-02: Haldi Yellow`, `g-03: Mehendi Green`, `g-04: Indigo Blue`, `g-05: Sandalwood Beige`, `g-06: Charcoal Black`.
4. **Wall Mural Pricing (`mural`)**:
   - Flat rate: `ratePerSqFt: 150` (₹150 per sq. ft.).
5. **Initial Studio Account (`studioAccount`)**:
   - Email: `studio@artstudio.in`
   - Password: `Studio@123`
   - Role: `ADMIN` / Studio Manager

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide React icons
- **Styling**: Vanilla CSS design system with an earthy artisan palette (ivory, terracotta, charcoal, ochre, sage)
- **Backend**: Node.js v24+, Express 4
- **Database**: MongoDB / MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT stored in `HttpOnly`, `SameSite=Lax` secure cookies
- **Password Security**: Salted bcrypt password hashing (`bcryptjs`)
- **Input Validation**: Zod runtime schema validation
- **Automated Testing**: Vitest, Supertest, and `mongodb-memory-server` (56/56 automated backend integration tests and 55/55 frontend tests passing)

---

## 📂 Project Architecture

```
gdgc/
├── seedData.zip              # Original seed archive preserved
├── seed-data/                # Extracted seed JSON and image assets
├── client/                   # Vite + React Frontend
│   ├── public/images/        # High-resolution painting images
│   ├── src/
│   │   ├── api/              # Axios API clients (auth, paintings, orders, bookings, pottery, stats)
│   │   ├── components/       # Navbar, Footer, StatusBadge, Modal, LoadingSpinner, EmptyState
│   │   ├── context/          # AuthContext (session restoration, login, register, logout)
│   │   ├── layouts/          # MainLayout, CustomerDashboardLayout, AdminDashboardLayout
│   │   ├── pages/            # Home, Catalogue, PaintingDetail, Login, Register, NotFound
│   │   │   ├── customer/     # Overview, Orders, Wall Booking, Wall History, Pottery Request & History
│   │   │   └── admin/        # Overview, Paintings Management, Add Painting, Orders, Bookings, Pottery
│   │   ├── routes/           # ProtectedRoute (role guards) & AppRoutes
│   │   └── styles/           # index.css design tokens & responsive utilities
│   ├── package.json
│   └── vite.config.js
├── server/                   # Express + Node.js Backend
│   ├── config/               # db.js (MongoDB connection)
│   ├── controllers/          # Business logic (auth, paintings, orders, bookings, pottery, stats)
│   ├── middleware/           # auth.js (JWT & RBAC), errorHandler.js, rateLimiter.js
│   ├── models/               # User, Painting, Order, WallBooking, PotteryRequest, StudioMeta
│   ├── routes/               # Express REST route endpoints
│   ├── scripts/              # seedData.js, seedAdmin.js
│   ├── tests/                # Vitest test suites (auth, paintings, wallBookings, pottery)
│   ├── app.js                # Express app setup
│   ├── server.js             # HTTP server entrypoint
│   └── package.json
├── package.json              # Monorepo root scripts
├── .env.example              # Environment variables template
├── README.md                 # Project guide & 5-minute demo script
└── DESIGN.md                 # Engineering design rationale & answers
```

---

## 🏛️ Jury Evaluation and Demo Access

### Customer Access
Evaluators can evaluate the customer experience by self-registering through the public Customer Registration interface:
- Navigate to `http://localhost:5173/login`.
- Select the **[ Customer Login ]** tab and click **Register as Customer** (or open `http://localhost:5173/register` directly).
- Register with any valid email and a password of at least 8 characters (e.g., `pooja@example.com` / `Password@123`).
- **Role Security**: Public registration strictly creates accounts with `role: 'CUSTOMER'`. Any client-side role tampering attempts are ignored on the server.

---

### Administrator Access

A dedicated jury administrator account is configured for local evaluation:

- **Account Name**: `Administrator 1`
- **Email**: `demo.admin@kalakriti.in`
- **Role**: `ADMIN`
- **Demo Password**: `KalaDemo@123`

> **⚠️ Provisioning Prerequisite & Verification:**
> - These credentials work **only after the administrator account has been successfully provisioned** in the database used by the application.
> - This account was successfully created and locally verified using the secure server-side provisioning script against the local MongoDB database (`artstudio`). Password verification and authentication via `POST /api/auth/login` were tested and confirmed.
> - **Demo-Only Notice**: These credentials are for **local evaluation only**. They must **never** be used for a production administrator on a public deployment.
> - **Customizing Passwords for Deployment**: To configure a different administrator password for deployment, define `DEMO_ADMIN_PASSWORD` in your production environment variables or use the server-side provisioning command (`npm run create:admin -- --name "..." --email "..." --password "..."`) with a strong, unique secret.

---

### Local Evaluation Instructions

Follow these exact 10 steps to set up, initialize, provision, and evaluate the application locally:

1. **Install Dependencies**:
   Install root, backend, and frontend packages:
   ```bash
   npm run install:all
   ```
2. **Configure Environment Variables**:
   Copy the provided configuration template to `server/.env`:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example server/.env
   # On macOS / Linux:
   cp .env.example server/.env
   ```
   *Verify that `server/.env` contains valid values for `PORT=5000`, `MONGODB_URI=mongodb://localhost:27017/artstudio`, and `JWT_SECRET`.*
3. **Start MongoDB**:
   Ensure a local MongoDB server is running on `mongodb://localhost:27017/artstudio` (e.g., via Windows Services `net start MongoDB` or `mongod`), or specify an active MongoDB Atlas connection URI in `server/.env`.
4. **Initialize Database Safely**:
   Seed the 12 Indian folk paintings, pottery forms, mineral glazes, and mural config:
   ```bash
   npm run seed
   ```
   *(Note: This operation is non-destructive and idempotent; existing records and passwords are preserved).*
5. **Provision Administrator 1**:
   Run the dedicated, secure server-side provisioning script to create the `Administrator 1` account in your local database:
   ```bash
   npm run seed:demo-admin
   ```
   *Alternatively, provision via the general CLI tool:*
   ```bash
   npm run create:admin -- --name "Administrator 1" --email "demo.admin@kalakriti.in" --password "KalaDemo@123"
   ```
6. **Start the Backend**:
   Launch the Express server (in Terminal 1):
   ```bash
   npm run dev:server
   ```
   *Runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*
7. **Start the Frontend**:
   Launch the Vite React client (in Terminal 2):
   ```bash
   npm run dev:client
   ```
   *Runs at `http://localhost:5173`.*
8. **Open the Login Page**:
   Open your browser and navigate to `http://localhost:5173/login`.
9. **Select Administrator Login**:
   Click the **[ Administrator Login ]** tab. Notice the active terracotta pill indicator and the studio personnel description. Enter:
   - **Email**: `demo.admin@kalakriti.in`
   - **Password**: `KalaDemo@123`
   - Click **Sign In as Administrator**.
10. **Access the Studio Dashboard**:
    Upon successful authentication, the backend validates the `ADMIN` role and redirects you directly to the **Studio Dashboard** (`http://localhost:5173/admin/dashboard`).

---

### Features for the Jury to Test

#### Customers
- **Register and Log In**: Create an account via `/register` and sign in using the Customer Login tab.
- **Browse Paintings**: Explore the curated collection of 12 Indian folk paintings (`/catalogue`) with filtering by art style and price sorting.
- **View Painting Details**: Inspect high-resolution artwork, dimensions, medium, authenticity badge, and background notes (`/paintings/:id`).
- **Purchase Available Paintings**: Acquire paintings using the atomic purchase modal with structured 7-field Indian delivery address capture.
- **Manage Orders**: Review order history, purchase price snapshots, and delivery address details (`/customer/orders`). Test order cancellation, which instantly restores painting availability in the public catalogue.
- **Book Wall Murals**: Calculate authoritative prices (₹150/sq.ft.), select themes, and request custom mural installations (`/customer/wall-booking`).
- **Submit Pottery Requests**: Configure custom wheel-thrown pottery with authentic item forms, natural glazes, quantities (1–12), and delivery dates (`/customer/pottery-request`), complete with interactive 3D and authentic photo previews.
- **Customer Profile**: Update contact details and save default shipping addresses (`/customer/profile`).

#### Administrators
- **Studio Dashboard Overview**: Access real-time database-backed metric cards (revenue, painting counts, order totals, mural requests, pottery commissions) and switch between Dark, Light, and System themes (`/admin/dashboard`).
- **Add, Edit, and Remove Paintings**:
  - Add new paintings with custom image file uploads or device camera capture (`/admin/paintings/new`).
  - Edit existing titles, descriptions, and prices (`/admin/paintings`).
  - Safe painting removal: permanently delete unpurchased paintings, or safely archive purchased paintings to protect customer order history while removing them from the public catalogue.
- **Manage Painting Images**: Upload, preview, and serve artwork images locally or via Cloudinary CDN storage.
- **Review and Manage Orders**: Review all customer purchases, delivery addresses, and payment statuses (`/admin/orders`).
- **Confirm or Decline Wall Mural Bookings**: Process pending customer mural requests with explicit confirmation dialogs (`/admin/wall-bookings`).
- **Manage Pottery Requests**: Accept or decline custom pottery commissions with automated delivery tracking (`/admin/pottery-requests`).
- **Manage Administrator Team**: View all authorized administrators and securely provision new administrator colleagues (`/admin/team`).

---

### Database and Deployment Safety

- **Local vs. Deployed Databases**:
  - Running `npm run seed:demo-admin` provisions `Administrator 1` **exclusively within your local MongoDB database** (`mongodb://localhost:27017/artstudio`). It does **not** create or modify accounts in any cloud or deployed database.
  - If this project is subsequently deployed to cloud hosting (e.g., Render, Railway, AWS, DigitalOcean, MongoDB Atlas), you must provision the administrator account in the deployed environment's database by configuring cloud environment variables (`MONGODB_URI`, `DEMO_ADMIN_PASSWORD`) and executing `npm run seed:demo-admin` or `npm run create:admin` within that environment.
- **Credential Protection**:
  - All passwords are encrypted using salted `bcryptjs` hashing (10 salt rounds) before database persistence. Plaintext passwords are never logged, stored, or exposed.
  - Neither `README.md` nor `.env.example` contains production credentials, private API keys, or live cloud database connection strings. Real environment secrets are stored in `.env`, which is strictly ignored by Git.

---

### H. Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **MongoDB connection error** (`ECONNREFUSED`) | Local MongoDB service is not running or Atlas URI is incorrect | Start local MongoDB (`mongod` / `net start MongoDB`) or verify `MONGODB_URI` in `server/.env`. If using Atlas, ensure IP whitelist includes `0.0.0.0/0`. |
| **Missing environment variables** | `server/.env` was not created | Copy `.env.example` to `server/.env` and ensure `JWT_SECRET` is populated. |
| **Port 5000 or 5173 conflict** (`EADDRINUSE`) | Another process is holding port 5000 or 5173 | Stop existing instances using `npx kill-port 5000 5173` or change `PORT=5001` in `server/.env` and update `client/vite.config.js` proxy. |
| **Failed Administrator Login** | Database not seeded or credentials mismatch | Run `npm run seed` or provision explicitly using `npm run create:admin -- --name "Admin" --email "studio@artstudio.in" --password "Studio@123"`. |
| **Frontend Network Error on API call** | Backend server is not running | Ensure `npm run dev:server` is active in Terminal 1 and `http://localhost:5000/api/health` returns status `OK`. |
| **Customer receives 403 on Admin Login** | Attempted to log into Administrator portal with customer account | This is intended security behavior. Switch to the **[ Customer Login ]** tab. |

---

### I. Evaluation Checklist

- [x] **Redesigned Login Page**: Segmented tabs `[ Customer Login ]` and `[ Administrator Login ]` with dynamic headings and role-specific descriptions.
- [x] **Customer Security**: Customer registration cannot assign `ADMIN` role; customers attempting Admin Login receive clear HTTP 403 error message without leaking sensitive data.
- [x] **Administrator Access**: Default administrator (`studio@artstudio.in` / `Studio@123`) reaches Studio Dashboard with all management privileges.
- [x] **Multi-Admin Support**: Multiple administrators can log in independently, manage shared inventory, and provision additional administrators via UI or CLI.
- [x] **Painting Management**: Uploading new paintings with images, updating prices/details, and safe deletion (permanent deletion vs. archival).
- [x] **Atomic Purchases**: Delivery address modal validation, atomic stock state updates, and double-purchase protection.
- [x] **Mural & Pottery Workflows**: Validated scheduling, pricing formulas, and admin confirm/decline controls.
- [x] **Automated Tests**: 56/56 backend tests and 55/55 frontend tests passing.
- [x] **Production Build**: Clean Vite production build in under 7 seconds.

---

## 🧪 Automated Testing

The backend test suite executes against an isolated, in-memory MongoDB instance via `mongodb-memory-server`. **It does not require active cloud credentials or an external MongoDB instance.**

Run the automated tests:
```bash
# Run backend integration tests (27/27 passing)
npm test --prefix server

# Run frontend tests
npm run test:client

# Validate production build bundle
npm run build:client
```

### Verified Test Results Summary:
- **`auth.test.js`** (13 tests): Registration, duplicate rejection (409), password hashing, login, HttpOnly cookie generation, session restoration (`/api/auth/me`), customer role escalation prevention, expectedRole validation, and 403 RBAC guards.
- **`paintings.test.js`** (11 tests): Public catalogue access, admin painting creation, customer creation prohibition (403), available painting editing, rejection of edits to sold paintings (400), delivery address validation (rejection of missing fields, invalid phone, invalid PIN), atomic single purchase with address snapshot, duplicate purchase rejection (409), **concurrent simultaneous purchase race condition protection**, customer address visibility in order history, admin protected address inspection, order cancellation restoring availability, and customer ownership isolation (404).
- **`wallBookings.test.js`** (6 tests): 7-day minimum rule rejection, 90-day maximum rule, wall size boundary validation (10–500 sq.ft), authoritative price calculation (wallSize × 150), database-level unique date reservation, admin confirmation/decline actions, 3-day cancellation cutoff enforcement, and ownership checks.
- **`pottery.test.js`** (6 tests): Options retrieval, custom request creation, item/glaze validation, quantity limits (1–12), 14-day minimum date rule, customer modification/cancellation restricted strictly to `requested` status, rejection of edits after acceptance/decline, and ownership protection.
- **`paintingManagement.test.js`** (6 tests): Administrator painting management, permanent deletion of unpurchased paintings, safe archival of purchased paintings to preserve customer history, and catalog exclusion.
- **`multiAdmin.test.js`** (7 tests): Multi-admin provisioning, role tampering defense, independent multi-admin logins, and shared database inventory management.
- **`imageUpload.test.js`** (7 tests): Multipart painting image uploads, file format & size validation, upload authorization, and backwards compatibility.
- **Frontend Vitest Suites** (55/55 tests passing across 6 test suites):
  - `App.test.jsx` (3 tests): Application layout and empty states.
  - `PotteryPhotoCustomizer.test.jsx` (5 tests): Full 30-combination authentic photo matrix.
  - `PersonalSpaceAnd3DPottery.test.jsx` (12 tests): Profile Hub, saved addresses, and 3D viewer.
  - `DeliveryAndConfirmationDialogs.test.jsx` (12 tests): Purchase modal, address validation, and admin confirmation dialogs.
  - `NavbarAndAuthNavigation.test.jsx` (16 tests): Navigation active highlights, dual-mode login tabs, customer admin lockout, and role redirection.
  - `AdminDashboardAndUpload.test.jsx` (7 tests): Metric cards, dark/light theme toggle, painting form with image capture, delete modal, and team management.

---

## ⏱️ Five-Minute Demonstration Checklist

Follow this workflow to demonstrate all features:

1. **Customer Registration**:
   - Open `http://localhost:5173/register`.
   - Enter Name: `Rohan Verma`, Email: `rohan@example.com`, Password: `Password@123`, Confirm Password: `Password@123`.
   - Click **Register as Customer**. Notice the confirmation message and automatic redirection to `/login`.
2. **Customer Login**:
   - Enter `rohan@example.com` and `Password@123`. Click **Sign In**.
   - Server validates bcrypt hash and sets an `HttpOnly` JWT cookie.
   - User is redirected to `/customer/dashboard`.
3. **Browse & Purchase a Painting with Delivery Address**:
   - Navigate to **Browse Paintings** (`/catalogue`) or open an artwork's detail page.
   - Find an available piece (e.g. *Royal Bengal Roar*, ₹24,500).
   - Click **Buy Painting** / **Acquire This Original Painting**.
   - A dedicated **Painting Purchase Modal** opens, showing artwork preview, authoritative price, and a structured 7-field Indian delivery address form.
   - Enter recipient name, valid Indian phone (`9876543210`), street address, city, state, and 6-digit PIN (`560001`).
   - Click **Confirm Purchase**. Notice the atomic reservation: status updates to `sold`, inventory reflects changes, and order is created with the address snapshot.
4. **Customer Order History**:
   - Go to **My Orders** (`/customer/orders`).
   - View the placed order with artwork thumbnail, purchase price snapshot (₹24,500), order date, status, recipient name, contact phone, and formatted delivery address.
   - Click **Cancel Order**. Observe that status becomes `cancelled` and the painting availability is restored in the catalogue!
5. **Book a Wall Painting**:
   - Go to **Book Wall Painting** (`/customer/wall-booking`).
   - Select a date at least 7 days ahead.
   - Move the wall size slider to 120 sq.ft. Notice the real-time calculated total updates to ₹18,000 (120 × ₹150).
   - Enter address: `45 Civil Lines, Jaipur`.
   - Submit request. Status becomes `requested`.
6. **Request Custom Pottery**:
   - Go to **Request Custom Pottery** (`/customer/pottery-request`).
   - Select Item: `Surahi (water jug)`, Glaze: `Indigo Blue`, Quantity: 4, Needed-by date (>=14 days).
   - Submit request. Go to **My Pottery Requests** and verify it appears with status `requested` and edit/cancel buttons enabled.
7. **Admin Login**:
   - Log out. Go to `/login`.
   - Sign in with Admin credentials: `studio@artstudio.in` / `Studio@123`.
   - Notice the server-side role redirect sends you to `/admin/dashboard`.
8. **Studio Admin Dashboard & Order Delivery Inspection**:
   - View real live database counts: Total Customers, Available vs Sold Paintings, Pending Wall Bookings, Pending Pottery Requests.
   - Go to **All Client Orders** (`/admin/orders`).
   - Inspect customer orders with recipient name, contact number, and full delivery addresses via the dedicated **View Details** inspection modal.
9. **Admin Wall Booking Decision with Confirmation Dialogs**:
   - Go to **All Wall Bookings** (`/admin/wall-bookings`).
   - Find Rohan's booking for 120 sq.ft.
   - Click **Confirm**. A custom accessible confirmation modal appears titled *"Confirm wall mural booking?"* displaying customer name, booking date, wall size, address, calculated price, and status.
   - Clicking **Cancel** closes the dialog with zero API requests.
   - Clicking **Confirm Booking** disables buttons during API processing, confirms the booking, and updates status to `confirmed`.
   - Similarly, clicking **Decline** opens *"Decline wall mural booking?"* with **Keep Booking** and **Decline Booking** options.
10. **Admin Pottery Decision**:
    - Go to **All Pottery Requests** (`/admin/pottery-requests`).
    - Find the *Surahi (water jug)* with *Indigo Blue* glaze.
    - Click **Accept**. Status updates to `accepted`.
11. **Demonstrate Blocked Unauthorized Actions**:
    - Open Developer Console or Postman.
    - Attempt to call `POST /api/paintings` using customer session: backend returns `403 Forbidden`.
    - Attempt to access or cancel another user's order `PATCH /api/orders/<otherId>/cancel`: backend returns `404 Not Found` without disclosing existence.
12. **Explain Backend Architecture**:
    - Showcase atomic query `Painting.findOneAndUpdate({ id, status: 'available' }, { status: 'sold' })` in `orderController.js` and database-level unique index on `bookingDate` in `WallBooking.js`.

---

## 🎓 Viva & Technical Interview Guide (For 2nd Year CSE Students)

### 1. How does Authentication work with HttpOnly Cookies?
> **Answer**: When the customer logs in, Express signs a JSON Web Token (JWT) containing the user's ID and role (`CUSTOMER` or `ADMIN`) using a secure server secret (`JWT_SECRET`). Instead of saving the token in browser `localStorage` (which is vulnerable to Cross-Site Scripting / XSS attacks), Express sets the token in an `HttpOnly` cookie with `SameSite=Lax`. JavaScript running in the browser cannot read this cookie; the browser automatically attaches it to subsequent requests. On page refresh, `GET /api/auth/me` verifies the token on the server to restore the user session.

### 2. How are Passwords Secured?
> **Answer**: Passwords are never stored as plaintext. We use `bcryptjs` with 10 salt rounds in a Mongoose `pre('save')` hook. Even if the database were compromised, the original passwords cannot be reversed. Password comparison is handled using `bcrypt.compare()`.

### 3. How do you prevent two customers from buying the same painting at the same time (Race Condition)?
> **Answer**: A frontend check (`painting.status === 'available'`) is vulnerable to race conditions if two users click "Buy" simultaneously. Instead, we use MongoDB's **atomic conditional update**:
> ```javascript
> const painting = await Painting.findOneAndUpdate(
>   { id: paintingId, status: 'available' },
>   { $set: { status: 'sold' } },
>   { new: true }
> );
> ```
> In MongoDB, document-level write operations are atomic. Even if 100 requests arrive at the exact same millisecond, MongoDB processes them sequentially for that document. Only the first request matches `{ status: 'available' }` and modifies it to `sold`. The other 99 requests match zero documents, returning `null`, allowing our backend to respond with a clean `409 Conflict` message: *"This painting has just been sold. Please choose another painting."*

### 4. How is the "One Booking Per Date" rule guaranteed?
> **Answer**: In `WallBooking.js`, we define a database-level unique index:
> ```javascript
> bookingDate: {
>   type: String,
>   required: true,
>   unique: true // Database unique index
> }
> ```
> We normalize dates to `YYYY-MM-DD` strings to eliminate timezone conversion issues. MongoDB creates a unique B-Tree index on `bookingDate`. If two concurrent requests try to insert a booking for the same date, MongoDB rejects the second insert with error code `11000 (DuplicateKeyError)`, returning an immediate `409 Conflict`.

### 5. Why do we return 404 instead of 403 when a customer accesses another customer's record?
> **Answer**: Per secure API design principles, if Customer A attempts to access or cancel an order belonging to Customer B, returning `403 Forbidden` confirms to Customer A that the record exists. Returning `404 Not Found` conceals the existence of private customer records and prevents resource enumeration.

---

---

## 🌟 Advanced Features & Enhancements

### 1. Realistic Interactive 3D Pottery Visualization (`Three.js`)
- **Self-Contained Procedural Geometries**: Implemented using `THREE.LatheGeometry` for all 5 traditional forms:
  - **Kulhad (`i-01`)**: Traditional flared clay cup with ribbed potter wheel contouring.
  - **Surahi (`i-02`)**: Slender elongated neck with bulbous vessel body and stable base.
  - **Matka (`i-03`)**: Spherical globular water pot with broad belly and rolled clay rim.
  - **Diya Set (`i-04`)**: Multi-wick ceremonial oil lamp on an artisan clay platter.
  - **Gamla (`i-05`)**: Tapered architectural planter with reinforced collar rim.
- **Physical Mineral Glaze Materials**: Modeled using `THREE.MeshPhysicalMaterial` with clearcoat, roughness, metallic sheen, and studio lighting (key light, cool fill, warm rim, and soft floor contact shadow).
- **Interactive Turntable Controls**: 360° drag rotation, zoom in/out, auto-rotate toggle, and reset view perspective.
- **Graceful WebGL Fallback**: Degrades gracefully to static tactile previews if WebGL context is unavailable without blocking pottery commissions.

### 2. Customer Personal Space (`/customer/profile`)
- Dedicated account hub accessible directly from the customer sidebar.
- **Profile Overview**: Displaying customer name, registered email, contact phone, member since date, initials avatar, and dynamic Profile Completeness bar.
- **Security & Integrity**: Registered email and customer roles remain read-only/protected on the server to prevent role escalation.
- **Direct History Shortcuts**: One-click navigation to purchased paintings, wall mural bookings, and pottery requests.

### 3. Saved Default Address with Checkout & Booking Prefill
- Customers can store a validated default address (recipient name, 10-digit Indian mobile, street address, line 2/landmark, city, state, 6-digit Indian PIN code).
- **Painting Purchase**: Automatically prefills modal fields; distinguishes default vs order-specific edits with tactile status badges; includes an explicit checkbox to save edited addresses as the new default.
- **Wall Mural Booking**: Prefills service address; provides an explicit save-as-default option.
- **Snapshot Immutability**: All orders and bookings preserve immutable address snapshots; editing default addresses later never alters historic order records.

### 4. Comprehensive Light & Dark Theme System
- Built on CSS custom properties (`[data-theme="dark"]` / `[data-theme="light"]`).
- **Curated Palette**:
  - *Light Theme*: Gallery Ivory (`#FCF9F4`), Ink Charcoal (`#29241F`), Terracotta (`#C9572B`), Sand Beige (`#F2E9DE`), Muted Olive (`#36765A`), Muted Rose (`#B94B4B`).
  - *Dark Theme*: Deep Artisan Charcoal (`#181512`), Card Surface (`#231E19`), Warm Off-White (`#FAF6F0`), Terracotta (`#E26E40`).
- **Appearance Selector**: Allows choosing Light, Dark, or System mode with instant live application, persistent storage across refreshes, and profile preference synchronization.

### 5. Explicit Admin Wall Booking Confirmation Dialogs
- In the Studio Administrator Wall Bookings table, clicking **Confirm** or **Decline** opens a custom accessible confirmation modal.
- Displays full booking context: client name, booking date, wall square footage, service address, authoritative price, and current status.
- Disables duplicate clicks during processing, calls the server API exactly once upon explicit confirmation, and makes no network request on cancel.

---

---

## 🎨 Studio Administrator Dashboard & Image Upload System

### 1. Studio Admin Dashboard Overhaul
- **Aesthetic Identity**: Exclusive contemporary Indian art studio combined with a polished business-management dashboard.
  - **Color Palette**:
    - Deep Charcoal: `#1D1916` (Primary dark background)
    - Elevated Dark Surfaces: `#29221D` (Card and panel backgrounds)
    - Terracotta Accent: `#D45F35` / `#E06C42` (Primary brand accent and highlights)
    - Warm Ivory: `#FCF8F2` (Light theme background and dark theme typography)
    - Muted Gold: `#C9A15A` / `#D8B36E` (Secondary accent for revenue and heritage badges)
    - Sage Green: `#2E7D5A` / `#34D399` (Successful and confirmed states)
    - Muted Red: `#C54646` / `#F87171` (Declined, sold, and locked states)
  - **Typography**: Editorial serif headings (`Cinzel`, `Playfair Display`) paired with clean, highly legible sans-serif (`Plus Jakarta Sans`) for quantitative studio metrics.

- **Default Theme & 3-Way Switching**:
  - The Studio Administrator Dashboard automatically opens in **DARK MODE by default** for first-time visitors.
  - A prominent Theme Selector is positioned in both the **Admin Subheader Bar** and the **Sidebar Footer**, offering three distinct modes:
    1. **Dark**: Deep charcoal surfaces (`#1D1916` / `#29221D`) with high-contrast warm ivory typography.
    2. **Light**: Warm ivory surfaces (`#FCF8F2` / `#FFFFFF`) with dark charcoal text and earthy terracotta highlights.
    3. **System**: Automatically matches the user operating system's light/dark mode preference via CSS media queries.
  - The administrator's theme selection is persisted in `localStorage` under `kalakriti_theme_preference_<userId>` and synchronized to the backend user profile.

- **8 Authoritative Database-Backed Metric Cards**:
  Every metric represents live MongoDB collection counts with zero hardcoded statistics or mock numbers:
  1. **Registered Customers**: Active customer accounts (`User.countDocuments({ role: 'CUSTOMER' })`). Clickable, opens orders management.
  2. **Available Paintings**: In-stock canvases (`Painting.countDocuments({ status: 'available' })`). Clickable, opens paintings inventory filtered to available artworks.
  3. **Sold Paintings**: Archived acquisitions (`Painting.countDocuments({ status: 'sold' })`). Clickable, opens paintings inventory filtered to sold artworks.
  4. **Total Orders**: All completed client checkouts (`Order.countDocuments()`). Clickable, opens all orders management.
  5. **Pending Wall Murals**: Mural dates awaiting scheduling (`WallBooking.countDocuments({ status: 'requested' })`). Clickable, opens mural bookings.
  6. **Confirmed Wall Murals**: Confirmed on-site bookings at ₹150/sq.ft (`WallBooking.countDocuments({ status: 'confirmed' })`). Clickable, opens mural bookings.
  7. **Pending Pottery**: Custom commissions awaiting glaze and form review (`PotteryRequest.countDocuments({ status: 'requested' })`). Clickable, opens pottery requests.
  8. **Accepted Pottery**: Commissions accepted and queued for kiln firing (`PotteryRequest.countDocuments({ status: 'accepted' })`). Clickable, opens pottery requests.

- **Real-Time Operational Pipelines & Activity Streams**:
  - **Service Distribution Tracks**: Visual percentage breakdown of mural appointments (Pending vs Confirmed vs Declined) and pottery commissions (Pending vs In Kiln vs Declined).
  - **Live Order Feed**: Displays latest client purchases with collector names, artwork titles, and order values.
  - **Catalogue Inventory Showcase**: Thumbnail previews of the studio's newest folk canvases.
  - **Manual Refresh Action**: Dedicated Refresh button with animated feedback to synchronize metrics on demand without full page reloads.

---

### 2. Complete Painting Image-Upload Workflow

#### A. Opening "Add Painting"
1. Log in as the administrator using the configured credentials (`studio@artstudio.in` / `Studio@123`).
2. In the top navigation, click **Studio Dashboard** or open `/admin/dashboard`.
3. In the left management sidebar, click **Add Painting** (`/admin/add-painting`), or click the **Add Painting** quick-action button in the dashboard header.

#### B. Selecting an Image from Your Computer
1. In the **Upload Painting Image** section, click the **Choose Image from Computer** button (or drag and drop an image file onto the dropzone).
2. The operating system's native file picker opens, filtered to supported image formats:
   - **Supported Formats**: JPG, JPEG, PNG, WebP (`.jpg`, `.jpeg`, `.png`, `.webp`).
   - **Maximum File Size**: 5 MB (`MAX_FILE_SIZE = 5 * 1024 * 1024`).
3. **Instant Live Preview**: An immediate zero-latency local preview thumbnail appears before saving, along with the original filename, file size in KB, and format.
4. **Replace / Remove**: The administrator can click **Replace Image** to pick a different file or **Remove** to clear the selection before publishing.
5. **Client-Side Validation**: Instant feedback is provided if an unsupported file type or a file exceeding 5 MB is selected.

#### C. Local Image Storage Architecture
- **Storage Location**: Uploaded artwork files are saved locally on the Express server in:
  ```
  server/uploads/paintings/
  ```
- **Multer Middleware**: Configured in `server/middleware/upload.js` with sanitized unique filenames:
  ```
  painting-[sanitizedBasename]-[timestamp]-[random].[extension]
  ```
  This prevents filename collisions, path traversal attacks, and arbitrary file writes.
- **Backend Validation**: Multer enforces MIME type checking (`image/jpeg`, `image/png`, `image/webp`), extension validation, and the 5 MB file size limit on the server.
- **Orphan File Prevention**: If database validation or save fails during painting creation, the temporary uploaded file is deleted immediately.
- **Git Protection**: The `uploads/` and `server/uploads/` directories are registered in `.gitignore` to prevent committing binary assets to version control.

#### D. Serving and Viewing Images in the Catalogue
- **Database Storage**: The MongoDB Painting document stores the relative image path:
  ```json
  "imageUrl": "uploads/paintings/painting-madhubani-1740000000000.webp"
  ```
- **Express Static Serving**: Configured in `server/app.js`:
  ```javascript
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { dotfiles: 'ignore', maxAge: '1d' }));
  ```
- **Vite Proxy (Local Development)**: In `client/vite.config.js`, requests starting with `/uploads` proxy to `http://localhost:5000`:
  ```javascript
  '/uploads': { target: 'http://localhost:5000', changeOrigin: true, secure: false }
  ```
- **Backwards Compatibility**: Both seeded images (`images/p-001.jpg` ... `p-012.jpg`) and newly uploaded images (`uploads/paintings/...`) resolve through the centralized `getArtworkUrl` utility.
- **Catalogue Visibility**: As soon as the administrator publishes the painting:
  1. The artwork appears in the **Admin Inventory** (`/admin/paintings`) with live thumbnail.
  2. The artwork appears in the public **Paintings Catalogue** (`/catalogue`) with "One of a kind" badge.
  3. The artwork is viewable on the public **Painting Details Page** (`/paintings/:id`) with style, dimensions, and medium details.
  4. The image persists across browser refreshes and server restarts.

#### E. Local Development vs. Production Cloud Storage
- **Local Development**: Storing images on local disk (`server/uploads/paintings/`) is ideal for local development and offline assignments because it requires zero external API keys or cloud subscriptions.
- **Production Deployment**: Cloud hosting platforms (such as Render, Heroku, or Vercel) often use **ephemeral filesystems**, where locally saved files are discarded on server restarts or container redeploys. For production deployment, the Multer storage engine can be swapped with a persistent cloud storage adapter:
  - **AWS S3 / Google Cloud Storage**: Using `multer-s3` or `@google-cloud/storage`.
  - **Cloudinary**: Using `multer-storage-cloudinary` for automatic image transformation and CDN delivery.
  The rest of the application code remains completely unchanged, as the MongoDB `imageUrl` field stores the full cloud URL.

---

### 3. Paintings Inventory Management & Safe Deletion (`/admin/paintings`)
- **Inventory Search & Filtering**: Instant search by painting title, master artist name, style, or catalogue identifier. Quick filters for `All`, `Available`, `Sold`, and `Archived` artworks with dynamic count badges.
- **Dual Display Modes**: Toggle between dense **Table View** and visual **Gallery Grid View** displaying artwork thumbnail, title, artist, style, dimensions, price in INR, and status.
- **Safe Painting Deletion & Historical Order Preservation**:
  - Clicking **Remove** on any painting opens an explicit confirmation dialog displaying the painting thumbnail, title, artist, price, and customer catalogue impact.
  - **Order Protection Rule**: If a painting has existing customer orders, the backend **safely archives** it (`status: 'archived'`, `isArchived: true`) rather than hard-deleting it, ensuring order histories and invoices are preserved forever.
  - If a painting has no existing customer orders, it is **permanently deleted** from MongoDB and its uploaded image file is safely cleaned up from disk/cloud storage.
  - **Immediate Customer Catalogue Sync**: In either case, the painting immediately disappears from the customer catalogue (`/catalogue`), active searches, and category filters. Customers cannot purchase archived or deleted paintings.
  - **Restoration**: Administrators can filter to **Archived** paintings and click **Restore** to unarchive any artwork back to `available`.
- **Artwork Previews**: Clicking any thumbnail opens a high-resolution inspection modal displaying the full canvas, artisan details, price, dimensions, and curatorial notes.
- **Editing Eligible Artworks**:
  - Administrators can edit available paintings (title, artist, price, category, dimensions, medium, description, availability status).
  - Built-in **image replacement picker** allows selecting a new photo from computer or phone without leaving the edit modal.
- **Integrity Rule for Sold Artworks**: Sold paintings display a locked status badge (`Sold (Locked)`) and cannot be edited, preserving historic purchase integrity.

---

### 4. Mobile Device Uploads & Camera Capture Workflow
- **Desktop & Mobile Compatibility**:
  - **Choose Image / Gallery**: Standard file picker input (`accept="image/*,.jpg,.jpeg,.png,.webp"`) allows selecting saved artwork photos from an Android gallery, iPhone photo library, or computer file explorer.
  - **Take Photo with Camera**: Direct mobile camera capture input (`accept="image/*" capture="environment"`) prompts the device camera directly on Android and iOS devices, enabling instant photo capture of fresh studio canvases.
  - Responsive layout adapts smoothly to phones and tablets.
  - Instant client-side preview with image dimensions, file size, and Replace/Retake options before publishing.

---

### 5. Persistent Image Storage Architecture (Cloudinary + Local Disk Fallback)
- **Automatic Multi-Target Storage**:
  - When Cloudinary environment variables are configured (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), paintings are uploaded securely to Cloudinary CDN storage with automated responsive compression (`folder: 'kalakriti/paintings'`).
  - When Cloudinary credentials are not present (local dev / offline testing), the system automatically and cleanly falls back to local disk storage (`server/uploads/paintings/`).
  - Safe image cleanup (`removeStoredImage`) destroys cloud or local assets when a painting is deleted, while strictly protecting seeded image assets (`images/*`).

---

### 6. Multiple Administrator Accounts & Shared Studio Management
- **Full Multi-Admin Architecture**:
  - Multiple registered accounts can hold the `ADMIN` role concurrently with independent email addresses and passwords.
  - All authorized administrators share the same database and inventory: changes made by one administrator (uploading, editing, removing canvases, confirming wall bookings, accepting pottery commissions) immediately reflect across all administrator dashboards and the customer catalogue.
- **Two Secure Provisioning Pathways**:
  1. **Protected In-Dashboard Team Management (`/admin/team`)**:
     - Logged-in administrators can navigate to **Studio Administrators** in the sidebar.
     - View all registered studio administrators with active status indicators.
     - Click **Add Administrator** to provision a new administrator with their Full Name, unique Email Address, secure Password (min 8 chars), and optional contact phone.
     - Only accessible by authenticated administrators (`requireAdmin` backend guard).
  2. **Server-Side CLI Provisioning Script**:
     - Secure command-line tool for devops or studio owners:
       ```bash
       # From project root:
       npm run create:admin -- --name "Curator Ananya" --email "ananya@artstudio.in" --password "AnanyaSecure@2026"
       
       # Or inside server directory:
       node scripts/createAdmin.js --name "Curator Ananya" --email "ananya@artstudio.in" --password "AnanyaSecure@2026"
       ```
     - Validates inputs, creates new administrator with bcrypt-hashed password, or promotes existing customer account to `ADMIN`.
     - Preserves all pre-existing administrator accounts (`studio@artstudio.in`) and database collections.
- **Strict Role-Tampering Protection**:
  - Public registration (`POST /api/auth/register`) strictly forces `role = 'CUSTOMER'` and ignores client-supplied `role` values.
  - Profile updates (`PUT /api/auth/profile`) reject any attempt by customers to alter their role (`403 Forbidden`).

---

## 🛡️ Security Implementation Highlights

- **Admin Role Verification**: All image upload (`POST /api/paintings/upload-image`), creation (`POST /api/paintings`), update (`PATCH /api/paintings/:id`), restore (`PATCH /api/paintings/:id/restore`), and deletion (`DELETE /api/paintings/:id`) endpoints require `authenticate` and `requireAdmin` middleware. Customer accounts and unauthenticated visitors receive strict `401 Unauthorized` or `403 Forbidden` responses.
- **Role Tampering Prevention**: The registration endpoint enforces `role = 'CUSTOMER'` on the server and discards any client-supplied `role` parameter.
- **CSRF & Cookie Protection**: Cookies are configured with `httpOnly: true`, `sameSite: 'lax'`, and `secure: process.env.NODE_ENV === 'production'`.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts (50 requests per 15 minutes per IP).
- **Zod Runtime Schema Validation**: Rejects malformed requests and invalid data types before hitting database controllers.
- **No Hardcoded Secrets**: Secrets and database credentials are read exclusively from environment variables.

---

## 🚀 Production Deployment Readiness Guide

Before publishing KALAKRITI to production hosting (e.g., Render, Railway, Vercel, AWS):

1. **Environment Variables Configuration**:
   - `PORT`: Server port (e.g., `5000` or assigned by cloud platform).
   - `NODE_ENV`: Set to `production`.
   - `MONGODB_URI`: Production MongoDB Atlas connection URI (`mongodb+srv://...`).
   - `JWT_SECRET`: High-entropy random secret key (minimum 32 characters).
   - `CLIENT_URL`: Production domain of frontend (e.g., `https://kalakriti-artstudio.com`).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Required for persistent image storage on ephemeral cloud hosts.
2. **CORS & Cookies**:
   - Ensure `credentials: true` and `CLIENT_URL` match the deployed frontend URL.
   - For cross-origin production domains using HTTPS, set cookie options `sameSite: 'none'` and `secure: true`.
3. **Seed Initial Admin**:
   - Run `npm run seed:admin` once against the production database to initialize the studio administrator account.


