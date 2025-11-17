# 🔧 Konfigurasi MAMP untuk EventYukk

## ✅ Konfigurasi Database MAMP

File `server/config.env` sudah diupdate dengan konfigurasi MAMP:

```env
# Database Configuration - MAMP
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=event_db
DB_PORT=8889
```

## 📋 Setup MAMP

### 1. Pastikan MAMP sudah running

1. Buka aplikasi **MAMP** atau **MAMP PRO**
2. Klik **Start Servers** untuk menjalankan Apache dan MySQL
3. Pastikan MySQL berjalan di port **8889** (default MAMP)

### 2. Buat Database

1. Buka **phpMyAdmin** di browser: `http://localhost:8888/phpMyAdmin/`
2. Atau buka **phpMyAdmin** di MAMP PRO: `http://localhost:8888/MAMP/?language=English`
3. Login dengan:
   - Username: `root`
   - Password: `root` (default MAMP)
4. Buat database baru dengan nama: `event_db`
   ```sql
   CREATE DATABASE event_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 3. Import Migrations (Opsional)

Jika database masih kosong, jalankan migrations:

```bash
cd server
node migrations/runMigration.js
```

Atau import SQL file langsung:
```bash
mysql -u root -proot -P 8889 event_db < server/event_db.sql
```

### 4. Verifikasi Koneksi

Test koneksi database:

```bash
cd server
node -e "require('./db').healthCheck().then(() => console.log('✅ Database connected!')).catch(err => console.error('❌ Connection error:', err))"
```

## 🔧 Troubleshooting

### Port 8889 tidak tersedia

Jika port 8889 sudah digunakan:

1. **Ubah port di MAMP**:
   - MAMP: Preferences → Ports → MySQL Port → 8889
   - MAMP PRO: Hosts → MySQL → Port → 8889

2. **Atau update config.env**:
   ```env
   DB_PORT=<port_yang_digunakan>
   ```

### Connection Error: Access Denied

Jika mendapat error "Access denied":

1. **Cek username dan password**:
   - Default MAMP: `root` / `root`
   - MAMP PRO mungkin berbeda

2. **Reset password MySQL** (jika perlu):
   ```bash
   # Di MAMP terminal
   /Applications/MAMP/Library/bin/mysqladmin -u root -p password root
   ```

### Connection Error: Can't connect to MySQL server

1. **Pastikan MySQL running** di MAMP
2. **Cek port** di MAMP preferences
3. **Test connection manual**:
   ```bash
   mysql -u root -proot -h 127.0.0.1 -P 8889
   ```

### Database not found

Jika database `event_db` belum ada:

1. Buat database via phpMyAdmin (lihat langkah 2 di atas)
2. Atau jalankan migrations (lihat langkah 3 di atas)

## 🚀 Start Server

Setelah setup selesai, jalankan server:

```bash
cd server
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📝 Catatan

- **Default MAMP Ports**:
  - Apache: `8888`
  - MySQL: `8889`

- **Default MAMP Credentials**:
  - Username: `root`
  - Password: `root`

- **Jika menggunakan MAMP PRO**, port dan credentials mungkin berbeda. Sesuaikan di `config.env`.

## ✅ Checklist

- [ ] MAMP sudah running
- [ ] MySQL berjalan di port 8889
- [ ] Database `event_db` sudah dibuat
- [ ] Config.env sudah diupdate dengan port 8889
- [ ] Koneksi database berhasil
- [ ] Server bisa start tanpa error

---

**Ready untuk development dengan MAMP! 🎉**

