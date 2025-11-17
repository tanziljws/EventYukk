# 🚀 Quick Start Guide - EventYukk

Panduan cepat untuk menjalankan aplikasi EventYukk di local development.

---

## 📋 Prasyarat

Sebelum mulai, pastikan sudah terinstall:

- ✅ **Node.js** v18 atau lebih baru
- ✅ **MySQL/MariaDB** (bisa pakai XAMPP, MAMP, atau MySQL standalone)
- ✅ **Git** (opsional, jika clone dari repo)
- ✅ **Code Editor** (VS Code recommended)

Cek versi Node.js:
```bash
node --version
# Harus v18 atau lebih baru
```

---

## 🔧 Langkah-langkah Setup

### **1. Setup Database**

#### A. Buat Database MySQL
```bash
# Login ke MySQL
mysql -u root -p

# Buat database baru
CREATE DATABASE event_db;

# Keluar dari MySQL
exit;
```

**Atau pakai phpMyAdmin/MySQL Workbench:**
- Buat database baru dengan nama: `event_db`
- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

---

#### B. Jalankan Migrations (Otomatis)

Migrations akan otomatis berjalan saat server start. Atau jalankan manual:

```bash
cd server
node migrations/runMigration.js
```

✅ **Check:** Setelah migrations, database akan punya tabel-tabel seperti `users`, `events`, `registrations`, dll.

---

### **2. Setup Environment Variables**

#### Backend Configuration (`server/config.env`)

Edit file `server/config.env`:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password        # Ganti dengan password MySQL kamu
DB_NAME=event_db
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin seed key (untuk membuat admin pertama kali)
ADMIN_SEED_KEY=change-this-seed-key

# SMTP Configuration (untuk email OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com           # Ganti dengan email Gmail kamu
SMTP_PASS=your_app_password              # Ganti dengan App Password Gmail
SMTP_FROM_NAME=Event Yukk Platform
SMTP_FROM_EMAIL=your_email@gmail.com

# Midtrans Payment Gateway (Opsional - bisa diisi nanti)
MIDTRANS_SERVER_KEY=SB-Mid-server-your-server-key-here
MIDTRANS_CLIENT_KEY=SB-Mid-client-your-client-key-here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**⚠️ Penting:**
- Ganti `DB_PASSWORD` dengan password MySQL kamu
- Untuk SMTP Gmail, gunakan **App Password** (bukan password biasa)
  - Cara dapat App Password: [Google App Passwords](https://support.google.com/accounts/answer/185833)

---

### **3. Install Dependencies**

#### Install Backend Dependencies
```bash
cd server
npm install
```

#### Install Frontend Dependencies
```bash
cd frontend
npm install
```

Atau install keduanya sekaligus:
```bash
# Dari root project
cd server && npm install && cd ../frontend && npm install
```

---

### **4. Buat Admin User**

Setelah server running, buat admin user pertama kali:

```bash
curl -X POST http://localhost:3000/api/auth/seed-admin \
  -H "Content-Type: application/json" \
  -d '{
    "key": "change-this-seed-key",
    "username": "admin@gmail.com",
    "email": "admin@gmail.com",
    "password": "admin123",
    "full_name": "System Administrator"
  }'
```

**Atau pakai Postman/Thunder Client:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/seed-admin`
- Body (JSON):
```json
{
  "key": "change-this-seed-key",
  "username": "admin@gmail.com",
  "email": "admin@gmail.com",
  "password": "admin123",
  "full_name": "System Administrator"
}
```

**Note:** `key` harus sama dengan `ADMIN_SEED_KEY` di `config.env`

---

### **5. Jalankan Aplikasi**

Buka **2 terminal terpisah**:

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

✅ Server akan running di: `http://localhost:3000`
✅ Migrations akan otomatis berjalan saat pertama kali start

---

#### Terminal 2 - Frontend Development
```bash
cd frontend
npm run dev
```

✅ Frontend akan running di: `http://localhost:5173`

---

## 🎉 Selesai!

Aplikasi sekarang berjalan! Akses:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

---

## 🔐 Login Credentials

Setelah seed admin, login dengan:

- **Email/Username:** `admin@gmail.com`
- **Password:** `admin123`

---

## 📝 Script NPM yang Tersedia

### Backend (`server/`)
```bash
npm start        # Production mode
npm run dev      # Development mode (dengan nodemon auto-reload)
npm run migrate  # Jalankan migrations manual
```

### Frontend (`frontend/`)
```bash
npm run dev      # Development server
npm run build    # Build untuk production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🔍 Verifikasi Setup

### Check Database Connection
```bash
curl http://localhost:3000/api/db-test
```

### Check Server Health
```bash
curl http://localhost:3000/api/health
```

---

## 🐛 Troubleshooting

### ❌ Error: Database connection failed

**Solusi:**
1. Pastikan MySQL running:
   ```bash
   # Mac/Linux
   brew services start mysql
   # atau
   sudo systemctl start mysql
   
   # Windows (XAMPP)
   Start MySQL dari XAMPP Control Panel
   ```

2. Cek credentials di `server/config.env`
3. Pastikan database `event_db` sudah dibuat

---

### ❌ Error: Port 3000 already in use

**Solusi:**
1. Cari process yang pakai port 3000:
   ```bash
   # Mac/Linux
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. Kill process atau ubah `PORT` di `config.env`

---

### ❌ Error: Email OTP tidak terkirim

**Solusi:**
1. Pastikan SMTP settings benar di `config.env`
2. Gunakan **App Password** Gmail (bukan password biasa)
3. Aktifkan 2-Step Verification di Google Account
4. Untuk development, cek console - OTP bisa muncul di log

---

### ❌ Error: Module not found

**Solusi:**
```bash
# Reinstall dependencies
cd server && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

---

### ❌ Migrations Error

**Solusi:**
```bash
cd server
node migrations/runMigration.js
```

Atau drop database dan buat ulang:
```sql
DROP DATABASE event_db;
CREATE DATABASE event_db;
```

---

## 🎯 Development Tips

### Auto-reload
- Backend menggunakan **nodemon** - auto restart saat file berubah
- Frontend menggunakan **Vite HMR** - hot reload otomatis

### Database Changes
- Semua perubahan schema ada di `server/migrations/`
- Migrations otomatis berjalan saat server start
- Manual migration: `cd server && node migrations/runMigration.js`

### API Testing
- Gunakan Postman, Thunder Client (VS Code), atau curl
- Base URL: `http://localhost:3000/api`
- JWT token dikirim via header: `Authorization: Bearer <token>`

---

## 📚 Struktur Project

```
EventYukk/
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── pages/     # Halaman aplikasi
│   │   ├── components/# Komponen reusable
│   │   └── services/  # API services
│   └── package.json
│
├── server/            # Node.js Backend
│   ├── routes/        # API routes
│   ├── migrations/    # Database migrations
│   ├── middleware/    # Express middleware
│   ├── config.env     # Environment variables
│   └── package.json
│
└── README.md
```

---

## 🚀 Next Steps

Setelah aplikasi running:

1. ✅ Test login sebagai admin
2. ✅ Buat kategori event baru
3. ✅ Buat event pertama
4. ✅ Test registrasi user baru
5. ✅ Test fitur-fitur lainnya

---

## 📞 Butuh Bantuan?

- Cek `README.md` untuk dokumentasi lengkap
- Cek `REQUIREMENTS_CHECKLIST.md` untuk list fitur
- Cek `CODEBASE_OVERVIEW.md` untuk overview codebase

---

**Selamat coding! 🎉**

