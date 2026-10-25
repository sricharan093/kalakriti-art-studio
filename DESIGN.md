# KalaKriti Art Studio — System Design Document

This document answers the four architectural questions specified in the GDGC Full-Stack Assignment.

---

## 1. How Do Login and the Two Roles Work?

### Registration and Account Creation
The system enforces role segregation at the server API layer:
- **Customer Registration (`POST /api/auth/register`)**: Open to the public. The incoming payload requires `name`, `email`, `password`, and `confirmPassword`. The server normalizes the email to lowercase and trims whitespace, checks for duplicate email entries via a unique database index, and uses `bcryptjs` with 10 salt rounds to hash the password before saving. 
- **Strict Role Assignment**: Regardless of any role field submitted in the request body, the server unconditionally overrides and sets `role: 'CUSTOMER'`.
- **Admin Creation (`scripts/seedAdmin.js`)**: There is deliberately **no public admin registration endpoint**. Administrators are provisioned via a server-side CLI script that reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from environment variables (or the seed data file). The script verifies password strength (>= 8 characters), creates the account with `role: 'ADMIN'`, and never overwrites an existing administrator's credentials.

### Authentication & Session Management
- **Login (`POST /api/auth/login`)**: The server looks up the user by normalized email, verifies the password against the bcrypt hash using `bcrypt.compare()`, and signs a JSON Web Token (JWT) containing `{ userId, role }` with a 7-day expiration.
- **HttpOnly Cookies**: The JWT is set into an `HttpOnly` cookie with `SameSite=Lax` and `secure: process.env.NODE_ENV === 'production'`. The token is never stored in `localStorage` or `sessionStorage`, mitigating Cross-Site Scripting (XSS) credential theft.
- **Session Restoration (`GET /api/auth/me`)**: On browser refresh or initial load, the client queries this endpoint. The `authenticate` middleware inspects the incoming cookie, validates the JWT signature and expiration, retrieves the user from the database, and returns safe user data (omitting the password hash). If the cookie is absent, expired, or invalid, a `401 Unauthorized` response is returned, and the user state is reset to unauthenticated.
- **Logout (`POST /api/auth/logout`)**: Clears the authentication cookie using matching options and resets client authentication state.

### Role-Based Authorization and Ownership Isolation
Authorization is guarded by three complementary layers:
1. **`authenticate` middleware**: Validates the JWT and attaches `req.user`. Returns `401 Unauthorized` if unauthenticated.
2. **`requireCustomer` & `requireAdmin` middleware**: Compares `req.user.role` to the required role. If a customer attempts to access `/api/admin/*`, the server returns `403 Forbidden`. If an admin attempts customer operations (such as purchasing a painting), the server rejects it.
3. **Ownership Verification**: For private customer resources (orders, bookings, pottery requests), the database query filters by `{ _id, customer: req.user._id }`. If a customer attempts to access or cancel another customer's record, the server returns `404 Not Found` (rather than 403) to prevent leaking information about the existence of other records.
4. **Client Route Guards (`ProtectedRoute.jsx`)**: Enforces navigation guards in React Router. Unauthenticated users are redirected to `/login`, while authenticated users accessing the opposite role's dashboard are redirected to their authorized dashboard.

---

## 2. Which Database Did You Choose, and Why?

### Choice: MongoDB with Mongoose ODM (MongoDB Atlas in Production)

### Rationale:
1. **Document-Oriented Representation for Studio Datasets**:
   The supplied seed data (`seed.json`) contains heterogeneous structures: paintings with artist mediums and image paths, pottery items, glaze types, and mural pricing metadata. MongoDB stores these as JSON-like BSON documents, matching the native JavaScript object structure of the Node.js/Express backend.
2. **Atomic In-Place Modifications**:
   MongoDB guarantees document-level atomicity on update operations (such as `findOneAndUpdate`). This enables race-condition-proof painting purchases without needing complex distributed locks.
3. **Database-Level Unique Indexes**:
   MongoDB's B-Tree indexing engine provides strict uniqueness enforcement across single fields (`email`, `painting.id`, and `bookingDate`).
4. **Schema Validation and Lifecycle Hooks via Mongoose**:
   Mongoose provides schema constraints, default values, pre-save middleware (e.g. automatic bcrypt hashing), and virtual helpers (`toSafeObject()`).

### Core Collections and Schema Design:
- **`User`**: `name`, `email` (unique index), `password` (bcrypt hash), `role` (`CUSTOMER` | `ADMIN`), `timestamps`.
- **`Painting`**: `id` (unique, e.g. `p-001`), `title`, `artist`, `description`, `price`, `imageUrl`, `status` (`available` | `sold`, indexed), `timestamps`.
- **`Order`**: `customer` (ref: User), `painting` (ref: Painting), `paintingId`, `price` (snapshot at time of purchase), `status` (`placed` | `cancelled`), `timestamps`.
- **`WallBooking`**: `customer` (ref: User), `bookingDate` (string `YYYY-MM-DD`, unique index), `address`, `wallSize` (10–500 sq.ft), `appliedRate` (₹150/sq.ft snapshot), `totalPrice` (snapshot), `status` (`requested` | `confirmed` | `declined` | `cancelled`), `timestamps`.
- **`PotteryRequest`**: `customer` (ref: User), `item` (`{ id, name }`), `glaze` (`{ id, name }`), `quantity` (1–12), `neededByDate` (`YYYY-MM-DD`), `notes`, `status` (`requested` | `accepted` | `declined` | `cancelled`), `timestamps`.
- **`StudioMeta`**: Centralized configuration document storing the official mural rate (`₹150`), currency (`INR`), and validated pottery items and glazes.

---

## 3. How Do You Stop Two People from Taking the Same Painting or Date?

### A. Preventing Duplicate Painting Purchases (Atomic Conditional Mutation)
Paintings are unique, original works that can only be purchased once. Checking availability in the frontend or performing a non-atomic `find` followed by `save` is vulnerable to race conditions where two simultaneous requests see `status: 'available'`.

We solve this using **MongoDB's atomic conditional update (`findOneAndUpdate`)**:

```javascript
const painting = await Painting.findOneAndUpdate(
  {
    id: paintingId,
    status: 'available' // Atomic precondition
  },
  {
    $set: { status: 'sold' }
  },
  { new: true }
);
```

#### How it works:
1. When two purchase requests execute concurrently for the same painting, MongoDB processes the document update lock sequentially.
2. The **first** request matches the query condition `{ status: 'available' }`, atomically transitions `status` to `'sold'`, and receives the updated document. An `Order` record is then created with a price snapshot.
3. The **second** request arrives and evaluates the filter `{ status: 'available' }`. Since the document was modified by the first transaction, the filter returns no match (`null`).
4. The server detects `!painting`, queries whether the painting exists, and returns an immediate `409 Conflict` with the user-friendly message:
   *"This painting has just been sold. Please choose another painting."*
5. Verified by automated test: `protects against concurrent simultaneous purchases with atomic updates` in `paintings.test.js` passes cleanly.

### B. Preventing Duplicate Wall Booking Dates (Database-Level Unique Index)
The studio can only paint one client's wall per calendar date. Application-level checks cannot guarantee safety against simultaneous concurrent requests.

We enforce this at the database engine level by defining a unique index on the date field in `WallBooking.js`:

```javascript
bookingDate: {
  type: String,
  required: true,
  unique: true, // MongoDB B-Tree Unique Index
  match: [/^\d{4}-\d{2}-\d{2}$/, 'Booking date must be in YYYY-MM-DD format']
}
```

#### Timezone Normalization:
Booking dates are normalized to studio calendar strings (`YYYY-MM-DD`). This prevents UTC vs. local browser timezone offsets from accidentally booking the wrong day or causing duplicate shifts.

#### Concurrency Behavior:
If two customers submit a booking for the same date at the exact same moment:
1. One write operation acquires the index key first and succeeds.
2. The losing write is aborted by MongoDB's unique index constraint, throwing error code `11000 (DuplicateKeyError)`.
3. Our global `errorHandler.js` intercepts error code `11000` and converts it into a `409 Conflict`:
   *"This date has already been booked. Please choose another date."*

#### Conservative Cancellation Interpretation:
Per assignment instructions:
> *"For this assignment, retain the unique date reservation after cancellation unless the assignment explicitly specifies otherwise. Explain this conservative interpretation in DESIGN.md."*

**Design Rationale**: When a wall booking is cancelled, its document status changes to `'cancelled'`, but the record and its `bookingDate` unique index entry remain in the database. In a professional art studio, artist schedules, logistics, and material staging are committed weeks in advance. Once a date is reserved and subsequently cancelled, the studio does not automatically reopen the slot to prevent logistical conflicts and short-notice operational strain. Reopening a cancelled date can only be performed via administrative override.

---

## 4. What Did You Finish, What Did You Leave Out, and What Would You Do Next?

### What Was Completely Implemented and Verified:
- **Seed Data Extraction & Importer**: Inspected `seedData.zip`, extracted `seed.json`, and implemented an idempotent data importer (`scripts/seedData.js`) that imports all 12 paintings, 5 pottery forms, 6 glazes, the ₹150/sq.ft mural rate, and the default admin account without creating duplicates on rerun.
- **Authentication & RBAC**: Real database accounts, salted bcrypt hashing, JWT issuance in HttpOnly cookies, session restoration (`GET /api/auth/me`), server-side role enforcement (CUSTOMER vs ADMIN), customer role tampering rejection, and admin initialization via `scripts/seedAdmin.js`.
- **Paintings Store**: Public catalogue with status filtering (all, available, sold) and search; painting detail view; atomic single-purchase protection against race conditions; order cancellation restoring painting availability; admin painting creation and editing restricted to available paintings only.
- **Wall Murals System**: Calendar date validation (7 to 90 days), wall size boundary enforcement (10 to 500 sq.ft), authoritative backend price calculation (wallSize × ₹150), database-level unique date index preventing concurrent duplicate bookings, 3-day cancellation cutoff enforcement, and admin confirmation/decline workflows.
- **Custom Pottery Requests**: Validated seed items (`i-01` to `i-05`) and glazes (`g-01` to `g-06`), quantity limit (1 to 12 pieces), 14-day minimum date rule, customer edit and cancellation privileges restricted strictly to `requested` status, and admin accept/decline actions.
- **Separate Dashboards & UI**: Customer space with overview stats, orders, booking history, and pottery history; Admin Studio space with real live statistics and management tables; warm artistic design system in vanilla CSS.
- **Automated Testing Suite**: 27 backend integration tests across 4 test suites running via Vitest, Supertest, and `mongodb-memory-server`; client component tests; verified production build via Vite.

### What Was Intentionally Left Out:
- **Payment Gateway Integration**: Real monetary payment processing (Stripe / Razorpay) was explicitly excluded by assignment requirements; orders are placed and tracked via internal studio order records.
- **File / Image Uploads**: The application uses the high-resolution images provided in the seed archive (`images/p-001.jpg` through `p-012.jpg`); custom image uploads were not required.
- **Email Notifications**: Outbound SMTP email notifications (e.g. SendGrid / Nodemailer) were omitted to avoid requiring third-party API keys.
- **Multi-Slot Murals**: Booking allows one mural per date; multi-artist teams supporting multiple bookings per day were out of scope.

### What Would Be Done Next in Production:
1. **Refresh Token Rotation**: Implement short-lived access tokens (15 minutes) paired with rotating refresh tokens stored in a Redis session store for immediate token revocation.
2. **WebSocket Real-Time Updates**: Introduce Socket.io to broadcast painting purchases and booking date selections in real-time, instantly disabling the "Buy" or "Book" button on all connected client browsers without requiring a manual refresh.
3. **Automated Notification Webhooks**: Integrate transactional email/SMS notifications notifying customers when their wall mural is confirmed or their pottery commission enters the bisque kiln firing stage.
4. **Artist Profile Attribution**: Extend the database schema to include dedicated `Artist` profiles with artisan bios, master traditions (e.g. Madhubani lineage), and portfolio galleries.
