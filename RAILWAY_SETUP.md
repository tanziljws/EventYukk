# Railway Deployment Setup Guide

## Environment Variables yang Perlu Di-Set di Railway

### Backend Service (eventyukk-production-16ba.up.railway.app)

#### Database Configuration
```
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=event_db
DB_PORT=3306
```

#### Server Configuration
```
PORT=3000
NODE_ENV=production
```

#### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

#### Frontend URL (PENTING!)
```
FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
RAILWAY_FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
```

#### SMTP Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=Event Yukk Platform
SMTP_FROM_EMAIL=your_email@gmail.com
```

#### Midtrans Payment Gateway
```
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
```

---

### Frontend Service (cozy-peace-production-c210.up.railway.app)

#### API URL (PENTING!)
```
VITE_API_URL=https://eventyukk-production-16ba.up.railway.app/api
```

**Catatan:** 
- Vite menggunakan prefix `VITE_` untuk environment variables yang bisa diakses di frontend
- Pastikan URL backend menggunakan `https://` (bukan `http://`)
- Jangan lupa `/api` di akhir URL

---

## Cara Set Environment Variables di Railway

1. **Buka Railway Dashboard**
2. **Pilih Service** (Backend atau Frontend)
3. **Klik tab "Variables"**
4. **Klik "New Variable"**
5. **Masukkan Key dan Value**
6. **Klik "Add"**
7. **Redeploy service** (Railway akan otomatis redeploy)

---

## Verifikasi Koneksi

### Test Backend
```bash
curl https://eventyukk-production-16ba.up.railway.app/api/health
```

### Test Frontend
Buka browser dan akses: `https://cozy-peace-production-c210.up.railway.app`

### Test API dari Frontend
Buka browser console dan cek apakah API calls berhasil:
```javascript
// Di browser console
fetch('https://eventyukk-production-16ba.up.railway.app/api/health')
  .then(res => res.json())
  .then(console.log)
```

---

## Troubleshooting

### CORS Error
- Pastikan `FRONTEND_URL` dan `RAILWAY_FRONTEND_URL` sudah di-set di backend
- Pastikan URL frontend menggunakan `https://` (bukan `http://`)
- Pastikan tidak ada trailing slash di URL

### API Connection Failed
- Pastikan `VITE_API_URL` sudah di-set di frontend
- Pastikan URL backend menggunakan `https://` dan ada `/api` di akhir
- Cek browser console untuk error details

### Environment Variables Tidak Terdeteksi
- Pastikan variable name benar (case-sensitive)
- Frontend variables harus menggunakan prefix `VITE_`
- Redeploy service setelah set environment variables

