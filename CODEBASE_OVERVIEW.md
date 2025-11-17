# 📚 EventYukk Codebase Overview

## 🎯 Project Summary

**EventYukk** is a comprehensive web-based event management platform built with React, Node.js, and MySQL. It provides end-to-end functionality for event creation, participant registration, payment processing, attendance tracking, certificate generation, and analytics.

**Overall Status:** ~71% Complete (17/24 core features implemented)

---

## 🏗️ Architecture Overview

### **Technology Stack**

#### Frontend
- **React 19** with Vite
- **React Router DOM 7** for routing
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **Chart.js & Recharts** for data visualization
- **React Hot Toast** for notifications

#### Backend
- **Node.js** with Express.js
- **MySQL/MariaDB** database
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **Multer** for file uploads
- **Nodemailer** for email services
- **Midtrans** for payment gateway
- **Express Validator** for input validation
- **Helmet & CORS** for security

---

## 📁 Project Structure

```
EventYukk/
├── frontend/              # React Frontend Application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context (Auth, Toast)
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin dashboard pages
│   │   │   ├── auth/      # Login/Register pages
│   │   │   ├── events/    # Event-related pages
│   │   │   ├── main/      # Public pages (Home, etc.)
│   │   │   └── ...
│   │   ├── services/      # API service layer
│   │   └── styles/        # Global styles & themes
│   └── public/            # Static assets
│
├── server/                # Node.js Backend API
│   ├── api/               # Vercel serverless entry point
│   ├── middleware/        # Express middleware
│   │   ├── auth.js        # JWT authentication
│   │   ├── validation.js  # Input validation
│   │   └── response.js    # Standardized API responses
│   ├── migrations/        # Database migration scripts (37 migrations)
│   ├── routes/            # API route handlers (18 routes)
│   ├── services/          # Business logic services
│   │   ├── emailService.js # Email & OTP service
│   │   └── tokenService.js # Attendance token generation
│   ├── uploads/           # Uploaded files (events, performers)
│   ├── utils/             # Utility functions
│   │   ├── cronJobs.js    # Scheduled tasks
│   │   └── eventCleanup.js # Event archival
│   └── server.js          # Main server entry point
│
└── Documentation/
    ├── README.md
    ├── REQUIREMENTS_CHECKLIST.md
    ├── PAYMENT_GATEWAY_SETUP.md
    └── DATABASE_CONNECTION_REPORT.md
```

---

## 🗄️ Database Schema

### **Core Tables**

1. **users** - User accounts (admin, organizer, user roles)
   - Fields: id, username, email, password, full_name, phone, address, education, role, is_active
   - Email normalization for Gmail (removes dots)

2. **events** - Event listings
   - Fields: id, title, description, event_date, event_time, location, price, is_free, category_id, organizer_id, image, is_active, is_highlighted, has_certificate, etc.
   - Supports both free and paid events

3. **event_registrations** - Participant registrations
   - Fields: id, event_id, user_id, status, attendance_required, attendance_status, payment_status, participant data fields
   - Tracks registration status and attendance

4. **payments** - Payment transactions
   - Fields: id, registration_id, order_id, amount, status, payment_method, midtrans_data
   - Integrated with Midtrans payment gateway

5. **attendance_tokens** - Attendance verification tokens
   - Fields: id, registration_id, user_id, event_id, token (10-digit), is_used, expires_at
   - Generated on successful registration

6. **attendance_records** - Attendance tracking
   - Fields: id, token_id, user_id, event_id, attendance_time, ip_address

7. **certificates** - Generated certificates
   - Fields: id, event_id, user_id, certificate_number, certificate_data (JSON), issued_at

8. **email_otps** - Email verification OTPs
   - Fields: id, user_id, email, otp_code, expires_at, is_used
   - 5-minute expiry for registration verification

9. **categories** - Event categories
10. **reviews** - Platform reviews and ratings
11. **articles** - Blog/articles content
12. **contacts** - Contact form submissions
13. **analytics** - Event analytics tracking

**Total:** 13+ core tables with proper foreign key relationships

---

## 🔐 Authentication & Authorization

### **User Roles**
- **admin** - Full system access, no session timeout
- **organizer** - Can create/manage events
- **user** - Regular participant, 5-minute session timeout

### **Authentication Flow**
1. **Registration**: 
   - User submits registration form
   - Account created as `is_active = FALSE`
   - 6-digit OTP sent to email (5-minute expiry)
   - Unverified accounts auto-deleted after 5 minutes

2. **Email Verification**:
   - User enters OTP code
   - Account activated (`is_active = TRUE`)
   - JWT token generated for auto-login

3. **Login**:
   - Email/username + password
   - JWT token generated (24h expiry)
   - Role-based redirect (admin → /admin/dashboard, user → /)

### **Session Management**
- **Admin**: No timeout (permanent sessions)
- **Users**: 5-minute idle timeout (in frontend AuthContext)
- **Token Validation**: Backend middleware checks token expiry and session timeout
- **Gmail Normalization**: Email addresses normalized (removes dots) for Gmail accounts

---

## 💳 Payment System

### **Midtrans Integration**
- **Gateway**: Midtrans Snap (Sandbox/Production modes)
- **Supported Methods**: Credit cards, Virtual accounts, E-wallets
- **Flow**:
  1. User registers for paid event
  2. System creates payment transaction via Midtrans
  3. Payment popup appears (Snap)
  4. User completes payment
  5. Webhook notification updates status
  6. Registration confirmed, attendance token sent via email

### **Payment States**
- `pending` - Payment initiated
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### **Free Events**
- No payment required
- Registration automatically confirmed
- Attendance token sent immediately

---

## 📊 Key Features

### ✅ **Fully Implemented**

1. **Event Management**
   - CRUD operations for events
   - Event categories
   - Event highlighting
   - Image uploads
   - Event status (active, archived)
   - Automatic archival of past events

2. **User Registration & Authentication**
   - Multi-step registration with OTP
   - Email verification (5-minute expiry)
   - Password hashing (bcrypt, salt rounds: 12)
   - Role-based access control

3. **Registration System**
   - Event registration (free & paid)
   - Registration status tracking
   - Participant data collection
   - Duplicate registration prevention

4. **Attendance Tracking**
   - 10-digit attendance tokens
   - Token-based verification
   - Attendance records with IP tracking
   - Attendance status (pending, attended, absent)

5. **Certificate System**
   - Certificate generation
   - Customizable templates
   - Certificate number generation
   - PDF/Image download support

6. **Admin Dashboard**
   - Statistics overview
   - User management
   - Event management
   - Registration management
   - Analytics & reports
   - Export functionality (XLSX, DOCX)

7. **Analytics**
   - Event view tracking
   - Registration analytics
   - Participant statistics
   - Monthly reports

8. **Blog/Articles**
   - Content management
   - Categories and tags
   - Featured articles

9. **Contact Management**
   - Contact form
   - Admin reply functionality
   - Status tracking

### ⚠️ **Partially Implemented**

1. **Dashboard Charts** - Charts exist but not integrated into main dashboard
2. **Registration Auto-Close** - Backend validation exists, frontend needs time-based disable
3. **Attendance Timing** - Works but needs time-based activation check
4. **Certificate Download** - Generation works, download needs completion
5. **Export Formats** - XLSX & DOCX available, CSV missing

### ❌ **Missing Features**

1. **H-3 Event Creation Limit** - Admin can create events less than 3 days away
2. **Password Complexity Validation** - Currently only 6-char minimum
3. **Reset Password** - Forgot password functionality not implemented
4. **Session Timeout** - Frontend timeout exists, but not fully synchronized with backend
5. **PWA Support** - Service worker and manifest not configured
6. **CSV Export** - Only XLSX/DOCX available

---

## 🛣️ API Routes

### **Authentication** (`/api/auth`)
- `POST /register` - User registration
- `POST /verify-email` - Email OTP verification
- `POST /resend-otp` - Resend OTP code
- `POST /login` - User login
- `POST /login/admin` - Admin login

### **Events** (`/api/events`)
- `GET /` - List all events (public)
- `GET /:id` - Get event details
- `POST /` - Create event (authenticated)
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `GET /upcoming/events` - Get upcoming events

### **Registrations** (`/api/registrations`)
- `GET /` - Get registrations
- `POST /` - Create registration
- `PUT /:id` - Update registration
- `GET /stats/overview` - Registration statistics

### **Payments** (`/api/payments`)
- `POST /create-transaction` - Create Midtrans transaction
- `POST /notification` - Midtrans webhook
- `GET /status/:orderId` - Check payment status
- `GET /history` - Payment history

### **Attendance** (`/api/attendance`)
- `POST /verify` - Verify attendance token
- `POST /submit` - Submit attendance
- `GET /event/:eventId` - Get event attendance

### **Certificates** (`/api/certificates`)
- `GET /my-certificates` - Get user's certificates
- `POST /generate` - Generate certificate
- `POST /generate-bulk` - Bulk certificate generation
- `GET /template` - Get certificate template

### **Admin** (`/api/admin`)
- `GET /dashboard/stats` - Dashboard statistics
- `GET /events` - All events (admin view)
- `GET /users` - All users
- `GET /registrations` - All registrations
- `GET /reports/export` - Export reports

**Total:** 18 route files with 100+ endpoints

---

## 🔄 Data Flow Examples

### **Event Registration Flow**
```
User → Event Detail Page → Register Button
  ↓
Registration Form (collect participant data)
  ↓
Backend: Create event_registration (status: pending)
  ↓
If Paid Event:
  → Create Midtrans Transaction
  → Show Payment Popup
  → User Pays
  → Webhook Updates Payment Status
  ↓
If Free Event:
  → Auto-confirm Registration
  ↓
Generate Attendance Token (10-digit)
  ↓
Send Email with Token
  ↓
Registration Complete
```

### **Attendance Flow**
```
User → Attendance Page (/attendance/:eventId)
  ↓
Enter 10-digit Token
  ↓
Backend: Verify Token
  - Check token exists & not used
  - Check event matches
  - Check registration exists
  ↓
If Valid:
  - Mark token as used
  - Create attendance_record
  - Update registration attendance_status = 'attended'
  ↓
Success Message
```

### **Certificate Generation Flow**
```
Admin → Certificate Management
  ↓
Select Event
  ↓
Generate Certificates (Bulk)
  ↓
For Each Participant:
  - Get participant data
  - Get certificate template
  - Replace placeholders
  - Generate certificate_number
  - Store in certificates table
  ↓
Certificates Available for Download
```

---

## 🔧 Configuration

### **Environment Variables** (`server/config.env`)

```env
# Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_db
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=Event Yukk

# Midtrans
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Deployment

### **Supported Platforms**
- **Vercel** - Serverless functions (via `server/api/index.js`)
- **Railway** - Full Node.js deployment
- **Traditional Hosting** - Standard Express.js server

### **Build Process**
```bash
# Frontend build
cd frontend
npm run build
# Output: frontend/dist/

# Copy to server
cd server
node copy-frontend.js
# Copies dist/ to server/dist/
```

### **Database Migrations**
- 37 migration files (001-037)
- Run via: `node migrations/runMigration.js`
- Automatic on server start

---

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing (12 salt rounds)
   - Password validation (6-char minimum - needs improvement)

2. **Authentication**
   - JWT tokens with expiry
   - Role-based access control
   - Session timeout for users

3. **API Security**
   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting (500 req/15min)
   - Input validation (Express Validator)

4. **Data Security**
   - SQL injection prevention (parameterized queries)
   - XSS protection (Helmet)
   - File upload validation (Multer)

---

## 📝 Key Business Rules

1. **Event Creation**
   - Admin can create events (H-3 rule NOT enforced)
   - Events can be free or paid
   - Events have categories
   - Events can be highlighted

2. **Registration**
   - One user = one registration per event
   - Registration closes 1 hour before event start (backend)
   - Paid events require payment before confirmation

3. **Attendance**
   - 10-digit tokens generated on registration
   - Tokens expire (if set)
   - Attendance tracked with IP and timestamp

4. **Certificates**
   - Only for events with `has_certificate = TRUE`
   - Only for participants with `attendance_status = 'attended'`
   - Customizable templates

5. **User Accounts**
   - Inactive until email verified (5-minute OTP expiry)
   - Unverified accounts auto-deleted after 5 minutes
   - Admin accounts have no session timeout

---

## 🐛 Known Issues & Limitations

1. **Email OTP**: Works but requires proper SMTP configuration
2. **Payment Webhook**: Needs public URL for production (use ngrok for local)
3. **Session Timeout**: Frontend timeout exists but not fully synchronized
4. **Password Complexity**: Only 6-char minimum, no complexity rules
5. **H-3 Rule**: Not enforced (admin can create events < 3 days away)
6. **PWA**: Not configured (manifest.json exists but service worker missing)

---

## 📈 Next Steps / Improvements

### **High Priority**
1. Implement H-3 event creation validation
2. Add password complexity validation
3. Complete session timeout synchronization
4. Integrate dashboard charts into main dashboard
5. Add CSV export format

### **Medium Priority**
1. Implement password reset functionality
2. Complete PWA configuration
3. Improve frontend registration close (time-based)
4. Complete certificate download feature
5. Add more comprehensive error handling

### **Low Priority**
1. Add unit tests
2. Improve documentation
3. Add API documentation (Swagger)
4. Optimize database queries
5. Add caching layer

---

## 🎓 Learning Resources

- **React Router**: Route configuration in `App.jsx`
- **Context API**: Authentication state in `AuthContext.jsx`
- **API Integration**: Service layer in `services/api.js`
- **Express Routes**: Route handlers in `server/routes/`
- **Database Migrations**: Migration system in `server/migrations/`
- **Middleware Pattern**: Auth/validation in `server/middleware/`

---

## 📞 Support & Documentation

- Main README: `README.md`
- Requirements Checklist: `REQUIREMENTS_CHECKLIST.md`
- Payment Setup: `PAYMENT_GATEWAY_SETUP.md`
- Database Report: `DATABASE_CONNECTION_REPORT.md`

---

**Last Updated:** Based on current codebase exploration
**Version:** 1.0
**Status:** Active Development (~71% Complete)

