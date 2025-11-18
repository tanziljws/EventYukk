#!/bin/bash

# Import Database ke Railway MySQL
# Pastikan MySQL client sudah terinstall: brew install mysql-client

echo "🚀 Importing database ke Railway MySQL..."

# Railway MySQL Connection Details
DB_HOST="tramway.proxy.rlwy.net"
DB_USER="root"
DB_PASSWORD="TSXxCbhMUvaKVctRMutuYVWcxRFfngRD"
DB_PORT="30040"
DB_NAME="railway"

# Path ke SQL file
SQL_FILE="/Users/tanziljws/Downloads/event_db (1).sql"

# Import database
mysql -h "$DB_HOST" \
      -u "$DB_USER" \
      -p"$DB_PASSWORD" \
      --port "$DB_PORT" \
      --protocol=TCP \
      "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database berhasil di-import!"
else
    echo "❌ Error saat import database"
    exit 1
fi

