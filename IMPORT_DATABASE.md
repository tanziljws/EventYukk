# 📥 Import Database ke Railway MySQL

## Cara Import Database

### Option 1: Menggunakan MySQL Client (Recommended)

```bash
# Install MySQL client jika belum ada
brew install mysql-client

# Import database
mysql -h tramway.proxy.rlwy.net \
      -u root \
      -pTSXxCbhMUvaKVctRMutuYVWcxRFfngRD \
      --port 30040 \
      --protocol=TCP \
      railway < "/Users/tanziljws/Downloads/event_db (1).sql"
```

### Option 2: Menggunakan Script

```bash
# Jalankan script import
./import-database.sh
```

### Option 3: Menggunakan Railway MySQL Service

1. Buka Railway Dashboard
2. Pilih MySQL Service
3. Klik "Connect" atau "Query"
4. Copy-paste isi file SQL
5. Execute

---

## 🔧 Setup Environment Variables

Setelah database di-import, set environment variables di Railway:

### Backend Service Variables

Buka file `RAILWAY_ENV_COMPLETE.txt` dan copy semua variables ke Railway Dashboard → Backend Service → Variables

**Database Connection:**
```
DB_HOST=tramway.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=TSXxCbhMUvaKVctRMutuYVWcxRFfngRD
DB_NAME=railway
DB_PORT=30040
```

**Frontend URL (PENTING!):**
```
FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
RAILWAY_FRONTEND_URL=https://cozy-peace-production-c210.up.railway.app
```

### Frontend Service Variables

```
VITE_API_URL=https://eventyukk-production-16ba.up.railway.app/api
```

---

## ✅ Verifikasi

### 1. Test Database Connection
```bash
mysql -h tramway.proxy.rlwy.net \
      -u root \
      -pTSXxCbhMUvaKVctRMutuYVWcxRFfngRD \
      --port 30040 \
      --protocol=TCP \
      railway -e "SHOW TABLES;"
```

### 2. Test Backend API
```bash
curl https://eventyukk-production-16ba.up.railway.app/api/health
```

### 3. Test Frontend
Buka: `https://cozy-peace-production-c210.up.railway.app`

---

## 🐛 Troubleshooting

### Error: "command not found: mysql"
Install MySQL client:
```bash
brew install mysql-client
```

### Error: "Access denied"
- Pastikan password benar
- Pastikan IP address di-whitelist di Railway (jika ada)

### Error: "Unknown database"
- Pastikan database `railway` sudah dibuat di Railway
- Atau ganti `DB_NAME` ke nama database yang benar

