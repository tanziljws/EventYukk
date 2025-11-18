# 🎨 Frontend Service Setup dengan Express

## ✅ Perbaikan MIME Type Error

Frontend service sekarang menggunakan **Express server** untuk serve static files dengan **proper MIME types**.

---

## 🔧 Yang Sudah Diperbaiki

1. ✅ **Express Server** (`frontend/server.js`)
   - Serve static files dengan MIME types yang benar
   - CSS: `text/css; charset=utf-8`
   - JS: `application/javascript; charset=utf-8`
   - SPA routing untuk React Router

2. ✅ **Package.json Scripts**
   - `npm start` → menjalankan Express server
   - `npm serve` → alias untuk `npm start`

3. ✅ **Dependencies**
   - `express: ^4.18.2` ditambahkan ke dependencies

---

## 🚀 Setup di Railway

### Frontend Service Configuration

**URL:** `cozy-peace-production-c210.up.railway.app`

1. **Root Directory:**
   - Jika deploy dari root project: Set `RAILWAY_SERVICE_ROOT` atau gunakan `railway.json`
   - Jika deploy dari `frontend/` folder: Railway akan otomatis detect `package.json`

2. **Build Command:**
   ```
   npm ci && npm run build
   ```
   (Jika dari root: `cd frontend && npm ci && npm run build`)

3. **Start Command:**
   ```
   npm start
   ```
   (Jika dari root: `cd frontend && npm start`)

4. **Environment Variables:**
   ```
   VITE_API_URL=https://eventyukk-production-16ba.up.railway.app/api
   PORT=5173
   ```
   (PORT akan di-set otomatis oleh Railway)

---

## 📝 Cara Kerja

1. **Build Process:**
   - Vite build frontend → `frontend/dist/`
   - Express server siap serve static files

2. **Server Start:**
   - Express server start di port yang di-set Railway
   - Serve static files dari `frontend/dist/`
   - Set proper MIME types untuk semua file types

3. **Request Flow:**
   - `/assets/*` → Static files dengan proper MIME types
   - `/*` → SPA routing (index.html)

---

## ✅ Verifikasi

Setelah deploy:

1. **Test CSS File:**
   ```
   https://cozy-peace-production-c210.up.railway.app/assets/index-*.css
   ```
   - Harus return dengan `Content-Type: text/css; charset=utf-8`
   - Tidak ada error MIME type di console

2. **Test JS File:**
   ```
   https://cozy-peace-production-c210.up.railway.app/assets/index-*.js
   ```
   - Harus return dengan `Content-Type: application/javascript; charset=utf-8`
   - Tidak ada error MIME type di console

3. **Test Frontend:**
   ```
   https://cozy-peace-production-c210.up.railway.app
   ```
   - Halaman load dengan benar
   - Tidak ada error di browser console
   - CSS dan JS files load dengan proper MIME types

---

## 🔍 Troubleshooting

### Jika masih ada MIME type error:

1. **Cek Railway Logs:**
   - Pastikan Express server start dengan benar
   - Cek log: `🚀 Frontend server running on port ...`

2. **Cek Build:**
   - Pastikan `frontend/dist/` folder ada
   - Pastikan assets files ada di `frontend/dist/assets/`

3. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)

4. **Cek Network Tab:**
   - Buka Developer Tools → Network
   - Cek Response Headers untuk CSS/JS files
   - Pastikan `Content-Type` benar

---

## 🎯 Next Steps

1. **Railway akan otomatis rebuild** setelah push
2. **Tunggu build selesai** (2-3 menit)
3. **Test frontend URL** dan cek browser console
4. **Tidak ada error MIME type** lagi! ✅

---

**Semua perubahan sudah di-push! Railway akan otomatis rebuild dengan Express server.** 🚀

