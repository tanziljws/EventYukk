# ⚡ Quick Setup Railway - Langsung Pakai!

## ✅ Database Sudah Di-Import!

Database `event_db` sudah berhasil di-import ke Railway MySQL!

---

## 🔧 Setup Environment Variables di Railway Dashboard

### 📦 BACKEND SERVICE
**URL:** `eventyukk-production-16ba.up.railway.app`

**Buka:** Railway Dashboard → Backend Service → Variables

**Copy-paste semua ini:**

```
DB_HOST=tramway.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=TSXxCbhMUvaKVctRMutuYVWcxRFfngRD
DB_NAME=railway
DB_PORT=30040
PORT=3000
NODE_ENV=production
JWT_SECRET=eventyukk-super-secret-jwt-key-2025-production-min-32-chars
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ADMIN_SEED_KEY=eventyukk-admin-seed-key-2025
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abdul.mughni845@gmail.com
SMTP_PASS=vagk gkjj htib wlbx
SMTP_FROM_NAME=Event Yukk Platform
SMTP_FROM_EMAIL=abdul.mughni845@gmail.com
MIDTRANS_SERVER_KEY=SB-Mid-server-your-server-key-here
MIDTRANS_CLIENT_KEY=SB-Mid-client-your-client-key-here
FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
RAILWAY_FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
```

---

### 🎨 FRONTEND SERVICE
**URL:** `cozy-peace-production-c210.up.railway.app`

**Buka:** Railway Dashboard → Frontend Service → Variables

**Copy-paste ini:**

```
VITE_API_URL=https://eventyukk-production-16ba.up.railway.app/api
```

---

## 🚀 Setelah Setup

1. Railway akan **otomatis redeploy** setelah set variables
2. Tunggu **2-3 menit** untuk build selesai
3. Test aplikasi:
   - Backend: https://eventyukk-production-16ba.up.railway.app/api/health
   - Frontend: https://cozy-peace-production-c210.up.railway.app

---

## ✅ Checklist

- [x] Database sudah di-import
- [ ] Backend environment variables sudah di-set (23 variables)
- [ ] Frontend environment variables sudah di-set (1 variable)
- [ ] Backend service sudah running
- [ ] Frontend service sudah running
- [ ] Test API connection dari frontend

---

## 📝 File Lengkap

- `RAILWAY_ENV_COMPLETE.txt` - Semua environment variables lengkap
- `IMPORT_DATABASE.md` - Dokumentasi import database
- `ENV_SETUP_RAILWAY.md` - Dokumentasi lengkap setup

---

**Semua sudah siap! Tinggal copy-paste variables ke Railway Dashboard! 🎉**

