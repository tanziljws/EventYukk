# 🔧 Fix Permission Issues - EventYukk

Jika mengalami **Permission Denied** error saat menjalankan npm scripts, ikuti langkah berikut:

---

## ✅ Solusi Cepat

### 1. Fix Permission untuk node_modules/.bin
```bash
cd server
chmod +x node_modules/.bin/*
```

### 2. Fix Permission untuk root
```bash
# Dari root project
cd /Users/tanziljws/Documents/EventYukk
chmod -R 755 server/node_modules/.bin
chmod -R 755 frontend/node_modules/.bin
```

---

## 🔄 Alternatif: Gunakan npx

Jika permission masih bermasalah, gunakan `npx` langsung:

### Backend:
```bash
cd server
npx nodemon server.js
```

### Frontend:
```bash
cd frontend
npx vite
```

---

## 🛠️ Reinstall Dependencies (Jika Masih Error)

Jika masih bermasalah, reinstall dependencies:

```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 Check Permission

Cek permission file:
```bash
ls -la server/node_modules/.bin/nodemon
```

Harus ada `x` (execute permission), contoh: `-rwxr-xr-x`

---

## ⚠️ Jika Menggunakan npm run dev masih error

Edit `server/package.json`, ubah script:
```json
{
  "scripts": {
    "dev": "npx nodemon server"
  }
}
```

Atau jalankan langsung:
```bash
cd server
node server.js
```
(Note: ini tidak auto-reload, harus restart manual)

---

## 🎯 Quick Fix Command

Jalankan command ini untuk fix semua permission issues:

```bash
# Fix backend
cd server
chmod +x node_modules/.bin/* 2>/dev/null || echo "Already fixed or node_modules not found"

# Fix frontend
cd ../frontend
chmod +x node_modules/.bin/* 2>/dev/null || echo "Already fixed or node_modules not found"

# Reinstall jika masih error
cd ../server && npm install
cd ../frontend && npm install
```

---

**Setelah fix, coba jalankan lagi:**
```bash
cd server
npm run dev
```

