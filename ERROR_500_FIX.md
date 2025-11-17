# 🔧 Error 500 Fix - Database Query Issues

## ✅ Fixes Applied

### **1. Fixed `attendance_status` Column Issues**

**Problem**: Query menggunakan kolom `attendance_status` yang mungkin tidak ada di semua database atau tidak selalu terisi.

**Solution**: Gunakan `COALESCE` untuk handle kolom yang mungkin NULL atau tidak ada:

```sql
-- Before (Error 500 jika kolom tidak ada):
er.attendance_status

-- After (Safe):
COALESCE(er.attendance_status, 'not_attended') as attendance_status
```

**Files Fixed**:
- ✅ `server/routes/admin.js` - Export participants query
- ✅ `server/routes/registrations.js` - Get my registrations query

### **2. Fixed Status Query for Attended Count**

**Problem**: Query menggunakan kombinasi status yang salah:
```sql
status = 'confirmed' AND attendance_status = 'attended'
```

**Solution**: Gunakan status langsung:
```sql
status = 'attended'
```

**Files Fixed**:
- ✅ `server/routes/admin.js` - Dashboard stats queries (2 places)
- ✅ `server/routes/events.js` - Get event by ID query

### **3. Enhanced Error Logging**

**Problem**: Error messages tidak detail, susah debugging.

**Solution**: Tambahkan detailed error logging:
```javascript
console.error('Error details:', error.message, error.code, error.sqlState);
return ApiResponse.error(res, error.message || 'Failed to get data');
```

**Files Updated**:
- ✅ `server/routes/admin.js` - Events, Users, Registrations endpoints
- ✅ `server/routes/contacts.js` - Get contacts endpoint

---

## 🔍 Common Causes of Error 500

### **1. Database Not Created**
- **Error**: `ER_BAD_DB_ERROR: Unknown database 'event_db'`
- **Solution**: Buat database `event_db` di MAMP:
  ```sql
  CREATE DATABASE event_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### **2. Missing Column**
- **Error**: `ER_BAD_FIELD_ERROR: Unknown column 'column_name'`
- **Solution**: Run migrations atau fix query dengan `COALESCE`

### **3. Connection Error**
- **Error**: `ECONNREFUSED` atau `ETIMEDOUT`
- **Solution**: 
  - Pastikan MAMP MySQL running
  - Check port 8889 di config.env
  - Verify credentials (root/root)

### **4. Query Syntax Error**
- **Error**: `ER_PARSE_ERROR` atau `ER_SYNTAX_ERROR`
- **Solution**: Check SQL syntax, especially GROUP BY clauses

---

## 📋 Checklist untuk Fix Error 500

### Database Setup
- [ ] MAMP MySQL running di port 8889
- [ ] Database `event_db` sudah dibuat
- [ ] Migrations sudah dijalankan
- [ ] Config.env sudah benar:
  ```
  DB_HOST=127.0.0.1
  DB_USER=root
  DB_PASSWORD=root
  DB_PORT=8889
  DB_NAME=event_db
  ```

### Server Setup
- [ ] Server berjalan tanpa error di start
- [ ] Database connection test berhasil
- [ ] Error handler middleware aktif

### Query Fixes
- [ ] Semua query menggunakan safe column access
- [ ] COALESCE digunakan untuk nullable columns
- [ ] Status queries menggunakan nilai yang benar

---

## 🚀 Testing

Setelah fixes, test endpoints berikut:

1. **Admin Dashboard Stats**:
   ```
   GET /api/admin/dashboard/stats
   ```

2. **Admin Events**:
   ```
   GET /api/admin/events
   ```

3. **Admin Users**:
   ```
   GET /api/admin/users
   ```

4. **Admin Registrations**:
   ```
   GET /api/admin/registrations
   ```

5. **Contacts**:
   ```
   GET /api/contacts
   ```

---

## 📝 Notes

### Status Values in `event_registrations`:
- `pending` - Registration created, payment pending
- `confirmed` / `approved` - Registration confirmed/paid
- `attended` - User attended the event
- `cancelled` - Registration cancelled

### `attendance_status` Column:
- Kolom ini mungkin tidak ada di semua migration
- Gunakan `COALESCE(er.attendance_status, 'not_attended')` untuk safety
- Jika kolom tidak ada, akan return `'not_attended'` sebagai default

---

## ✅ Status

**All Error 500 fixes applied!** 🎉

- ✅ Query fixes for `attendance_status`
- ✅ Status query fixes for attended count
- ✅ Enhanced error logging
- ✅ Safe column access with COALESCE

**Next Step**: Restart server dan test endpoints!

---

## 🔄 How to Apply

1. **Restart server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Check server logs** untuk error details

3. **Test endpoints** via frontend atau Postman

4. **If still error 500**: Check server console untuk detailed error message

---

**Ready to test!** 🚀

