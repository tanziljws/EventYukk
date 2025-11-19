# 🚀 EventYukk - Laravel Migration Plan

## 📋 Overview

Migrasi dari **React + Express.js** ke **Laravel Monolith** dengan **Inertia.js + React**.

---

## ✅ Progress

- [x] Install Laravel 12
- [x] Install Inertia.js Laravel
- [ ] Setup React + Vite untuk frontend
- [ ] Migrate database schema
- [ ] Migrate routes & controllers
- [ ] Migrate authentication
- [ ] Migrate file uploads
- [ ] Migrate payment gateway
- [ ] Migrate email service
- [ ] Migrate cron jobs
- [ ] Test semua fitur

---

## 🏗️ Struktur Baru

```
laravel-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # Migrate dari server/routes/
│   │   ├── Middleware/         # Migrate dari server/middleware/
│   │   └── Requests/           # Form requests untuk validation
│   ├── Models/                 # Eloquent models
│   ├── Services/               # Business logic (email, payment, etc)
│   └── Jobs/                   # Queue jobs
├── database/
│   ├── migrations/             # Migrate dari server/migrations/
│   └── seeders/               # Database seeders
├── resources/
│   ├── js/                    # React components (dari frontend/src/)
│   │   ├── Pages/             # Page components
│   │   ├── Components/        # Reusable components
│   │   └── Layouts/           # Layout components
│   └── css/                   # Styles (dari frontend/src/styles/)
├── routes/
│   ├── web.php                # Web routes (Inertia)
│   └── api.php                # API routes (jika perlu)
└── storage/
    └── app/
        └── public/
            └── uploads/       # File uploads (dari server/uploads/)
```

---

## 📦 Dependencies yang Perlu Diinstall

### Backend (Laravel)
```bash
composer require inertiajs/inertia-laravel
composer require laravel/sanctum          # Authentication
composer require intervention/image       # Image processing
composer require maatwebsite/excel       # Excel export
composer require barryvdh/laravel-dompdf # PDF generation
```

### Frontend (React)
```bash
npm install @inertiajs/react @inertiajs/react
npm install react react-dom
npm install @vitejs/plugin-react
npm install axios
npm install react-router-dom  # Jika perlu
npm install framer-motion
npm install react-hot-toast
npm install chart.js react-chartjs-2
```

---

## 🔄 Migration Steps

### 1. Database Schema Migration

**From:** `server/migrations/*.sql`  
**To:** `database/migrations/*.php`

**Tables to migrate:**
- users
- categories
- events
- event_registrations
- payments
- attendance_tokens
- attendance_records
- certificates
- certificate_templates
- reviews
- articles
- contacts
- email_otps
- password_resets
- analytics
- performers

### 2. Routes Migration

**From:** `server/routes/*.js`  
**To:** `routes/web.php` + `app/Http/Controllers/*.php`

**Routes to migrate:**
- `/api/auth/*` → AuthController
- `/api/events/*` → EventController
- `/api/registrations/*` → RegistrationController
- `/api/payments/*` → PaymentController
- `/api/attendance/*` → AttendanceController
- `/api/certificates/*` → CertificateController
- `/api/admin/*` → AdminController
- `/api/users/*` → UserController
- `/api/categories/*` → CategoryController
- `/api/reviews/*` → ReviewController
- `/api/articles/*` → ArticleController
- `/api/contacts/*` → ContactController
- `/api/analytics/*` → AnalyticsController
- `/api/reports/*` → ReportController
- `/api/performers/*` → PerformerController
- `/api/upload/*` → UploadController

### 3. Authentication Migration

**From:** JWT (Express.js)  
**To:** Laravel Sanctum (Session-based untuk web, Token untuk API)

**Changes:**
- Remove JWT middleware
- Use Laravel's built-in authentication
- Migrate user model
- Update frontend auth context

### 4. File Upload Migration

**From:** Multer (Express.js)  
**To:** Laravel Storage

**Changes:**
- Move uploads to `storage/app/public/uploads/`
- Update file paths in database
- Configure storage link

### 5. Payment Gateway Migration

**From:** Midtrans Node.js SDK  
**To:** Midtrans PHP SDK atau HTTP requests

**Changes:**
- Install Midtrans PHP SDK
- Migrate payment service
- Update webhook handler

### 6. Email Service Migration

**From:** Nodemailer  
**To:** Laravel Mail

**Changes:**
- Configure SMTP in `.env`
- Create Mail classes
- Migrate email templates

### 7. Cron Jobs Migration

**From:** `node-cron`  
**To:** Laravel Scheduler

**Changes:**
- Move cron logic to `app/Console/Kernel.php`
- Create Artisan commands
- Setup cron schedule

### 8. Frontend Migration

**From:** React SPA dengan API calls  
**To:** Inertia.js + React

**Changes:**
- Setup Inertia root component
- Convert pages to Inertia pages
- Use Inertia router instead of React Router
- Update API calls to use Inertia forms/links

---

## 🔧 Configuration Files

### `.env` Setup
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=event_db
DB_USERNAME=root
DB_PASSWORD=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="Event Yukk"
```

---

## 📝 Next Steps

1. **Setup React + Vite frontend**
2. **Migrate database migrations**
3. **Create Eloquent models**
4. **Migrate controllers satu per satu**
5. **Migrate frontend pages**
6. **Test dan fix issues**

---

## ⚠️ Important Notes

- Keep old code in `server/` and `frontend/` until migration complete
- Test each migration step before moving to next
- Backup database before migration
- Update environment variables
- Test all features after migration

