# 🌐 Single Domain Setup - No CORS Conflict

## ✅ Solusi: Frontend di-serve dari Backend (Single Domain)

Dengan setup ini, frontend dan backend menggunakan **1 domain yang sama**, sehingga:
- ✅ **Tidak ada CORS conflict**
- ✅ **Static files (CSS/JS) di-serve dengan MIME type yang benar**
- ✅ **Lebih sederhana dan aman**

---

## 🚀 Setup di Railway

### Option 1: Single Domain (Recommended)

**Hanya gunakan Backend Service** - Frontend akan di-serve dari backend.

1. **Backend Service** (`eventyukk-production-16ba.up.railway.app`)
   - Set semua environment variables seperti biasa
   - Frontend akan otomatis di-build dan di-serve dari backend
   - **Tidak perlu Frontend Service terpisah**

2. **Environment Variables untuk Backend:**
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
   ```

3. **Tidak perlu set `FRONTEND_URL`** - karena frontend di-serve dari backend (same origin)

4. **Akses aplikasi:**
   - Frontend & Backend: `https://eventyukk-production-16ba.up.railway.app`
   - API: `https://eventyukk-production-16ba.up.railway.app/api`

---

### Option 2: Separate Domains (Jika tetap ingin 2 service)

Jika tetap ingin menggunakan 2 service terpisah:

1. **Backend Service** - Set environment variables seperti biasa
2. **Frontend Service** - Set `VITE_API_URL=https://eventyukk-production-16ba.up.railway.app/api`
3. **Backend CORS** - Set `FRONTEND_URL` dan `RAILWAY_FRONTEND_URL`

---

## 🔧 Perubahan yang Sudah Dilakukan

1. ✅ **Backend serve frontend static files** - Frontend build di-copy ke `server/frontend-dist/`
2. ✅ **SPA routing** - Semua non-API routes mengembalikan `index.html`
3. ✅ **Proper MIME types** - CSS dan JS di-serve dengan Content-Type yang benar
4. ✅ **CORS minimal** - Single domain tidak perlu CORS untuk same-origin requests
5. ✅ **Frontend API URL** - Menggunakan relative path `/api` untuk same-domain

---

## 📝 Cara Kerja

1. **Build Process:**
   - Dockerfile build frontend → `frontend/dist/`
   - Copy ke `server/frontend-dist/`
   - Backend serve dari `server/frontend-dist/`

2. **Request Flow:**
   - `/api/*` → Backend API routes
   - `/uploads/*` → Uploaded files
   - `/*` → Frontend SPA (index.html)

3. **No CORS:**
   - Frontend dan backend same domain → No CORS needed
   - Static files (CSS/JS) → Same origin → No CORS

---

## ✅ Verifikasi

Setelah deploy:

1. **Test Frontend:**
   ```
   https://eventyukk-production-16ba.up.railway.app
   ```

2. **Test API:**
   ```
   https://eventyukk-production-16ba.up.railway.app/api/health
   ```

3. **Cek Browser Console:**
   - Tidak ada CORS errors
   - CSS dan JS files load dengan benar
   - MIME types correct

---

## 🎯 Rekomendasi

**Gunakan Option 1 (Single Domain)** karena:
- ✅ Tidak ada CORS issues
- ✅ Lebih sederhana
- ✅ Lebih aman
- ✅ Static files di-serve dengan benar
- ✅ Satu service untuk maintain

**Hapus Frontend Service di Railway** jika menggunakan Option 1.

---

**Semua perubahan sudah di-push! Railway akan otomatis rebuild dengan konfigurasi baru.** 🚀

