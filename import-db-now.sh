#!/bin/bash
# Install MySQL client jika belum ada
if ! command -v mysql &> /dev/null; then
    echo "📦 Installing MySQL client..."
    brew install mysql-client
    export PATH="/usr/local/opt/mysql-client/bin:$PATH"
fi

echo "🚀 Importing database ke Railway MySQL..."

# Railway MySQL Connection
mysql -h tramway.proxy.rlwy.net \
      -u root \
      -pTSXxCbhMUvaKVctRMutuYVWcxRFfngRD \
      --port 30040 \
      --protocol=TCP \
      railway < "/Users/tanziljws/Downloads/event_db (1).sql"

if [ $? -eq 0 ]; then
    echo "✅ Database berhasil di-import!"
else
    echo "❌ Error saat import database"
    exit 1
fi
