# 🚀 Environment Variables Setup untuk Railway

## 📋 Backend Service (28 Variables)

**Service URL:** `eventyukk-production-16ba.up.railway.app`

### Cara Set di Railway:
1. Buka Railway Dashboard
2. Pilih **Backend Service**
3. Klik tab **"Variables"**
4. Klik **"New Variable"**
5. Copy-paste semua variables di bawah ini:

---

### 1-5. Database Configuration
```
DB_HOST=your-db-host.railway.app
DB_USER=root
DB_PASSWORD=your-db-password
DB_NAME=event_db
DB_PORT=3306
```

### 6-7. Server Configuration
```
PORT=3000
NODE_ENV=production
```

### 8-9. JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

### 10-11. File Upload Configuration
```
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 12. Admin Seed Key
```
ADMIN_SEED_KEY=change-this-seed-key-for-security
```

### 13-19. SMTP Configuration (Gmail)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM_NAME=Event Yukk Platform
SMTP_FROM_EMAIL=your_email@gmail.com
```

### 20-21. Midtrans Payment Gateway
```
MIDTRANS_SERVER_KEY=SB-Mid-server-your-server-key-here
MIDTRANS_CLIENT_KEY=SB-Mid-client-your-client-key-here
```

### 22-23. Frontend URL (PENTING untuk CORS!)
```
FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
RAILWAY_FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
```

**Total Backend Variables: 23 required**

---

## 📋 Frontend Service (3 Variables)

**Service URL:** `cozy-peace-production-c210.up.railway.app`

### Cara Set di Railway:
1. Buka Railway Dashboard
2. Pilih **Frontend Service**
3. Klik tab **"Variables"**
4. Klik **"New Variable"**
5. Copy-paste variable di bawah ini:

---

### 1. Backend API URL (REQUIRED)
```
VITE_API_URL=https://eventyukk-production-16ba.up.railway.app/api
```

### 2. Environment (Optional)
```
VITE_NODE_ENV=production
```

### 3. Custom Domain (Optional)
```
VITE_APP_URL=https://your-custom-domain.com
```

**Total Frontend Variables: 1 required, 2 optional**

---

## ⚠️ PENTING!

### Backend:
- ✅ Pastikan `FRONTEND_URL` dan `RAILWAY_FRONTEND_URL` menggunakan `https://`
- ✅ Jangan ada trailing slash di akhir URL
- ✅ `JWT_SECRET` harus minimal 32 karakter untuk keamanan
- ✅ `SMTP_PASS` harus menggunakan App Password dari Gmail (bukan password biasa)

### Frontend:
- ✅ Variable harus menggunakan prefix `VITE_` (Vite requirement)
- ✅ `VITE_API_URL` harus menggunakan `https://` dan ada `/api` di akhir
- ✅ Setelah set variables, **rebuild frontend** (Railway akan auto-redeploy)

---

## 🔍 Verifikasi Setup

### 1. Test Backend Health
```bash
curl https://eventyukk-production-16ba.up.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Test Frontend
Buka browser: `https://cozy-peace-production-c210.up.railway.app`

### 3. Test API Connection dari Frontend
Buka browser console (F12) dan jalankan:
```javascript
fetch('https://eventyukk-production-16ba.up.railway.app/api/health')
  .then(res => res.json())
  .then(console.log)
```

---

## 🐛 Troubleshooting

### CORS Error
- ✅ Pastikan `FRONTEND_URL` dan `RAILWAY_FRONTEND_URL` sudah di-set di backend
- ✅ Pastikan URL menggunakan `https://` (bukan `http://`)
- ✅ Pastikan tidak ada trailing slash

### API Connection Failed
- ✅ Pastikan `VITE_API_URL` sudah di-set di frontend
- ✅ Pastikan URL backend menggunakan `https://` dan ada `/api` di akhir
- ✅ Cek browser console untuk error details
- ✅ Pastikan backend service sudah running

### Environment Variables Tidak Terdeteksi
- ✅ Pastikan variable name benar (case-sensitive)
- ✅ Frontend variables harus menggunakan prefix `VITE_`
- ✅ Redeploy service setelah set environment variables
- ✅ Untuk frontend, pastikan rebuild dilakukan (variables di-build time)

---

## 📝 Quick Copy-Paste untuk Railway

### Backend (Copy semua ini ke Railway Backend Variables):
```
DB_HOST=your-db-host
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=event_db
DB_PORT=3306
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ADMIN_SEED_KEY=your-seed-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Event Yukk Platform
SMTP_FROM_EMAIL=your-email@gmail.com
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
RAILWAY_FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
```

### Frontend (Copy ini ke Railway Frontend Variables):
```
VITE_API_URL=https://eventyukk-production-16ba.up.railway.app/api
```

---

**Setelah set semua variables, Railway akan otomatis redeploy. Tunggu beberapa menit dan test!**

