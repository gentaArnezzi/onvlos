#!/bin/bash

# PostgreSQL Setup Helper untuk macOS
# Script ini membantu fix masalah authentication PostgreSQL di macOS

set -e

echo "🔧 PostgreSQL Setup Helper untuk macOS"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

USERNAME=$(whoami)
echo "User saat ini: $USERNAME"
echo ""

# Check if PostgreSQL is running
if ! brew services list | grep -q postgresql; then
    echo -e "${YELLOW}⚠️  PostgreSQL service tidak ditemukan${NC}"
    echo "Installing PostgreSQL..."
    brew install postgresql@17
    brew services start postgresql@17
    sleep 2
fi

echo "Pilih opsi:"
echo "1. Setup dengan password (recommended)"
echo "2. Setup trust authentication (tanpa password - untuk development)"
echo "3. Cek status PostgreSQL"
echo "4. Buat database onvlos"
read -p "Pilihan (1-4): " choice

case $choice in
  1)
    echo ""
    read -sp "Masukkan password untuk user $USERNAME: " password
    echo ""
    read -sp "Masukkan password lagi untuk konfirmasi: " password2
    echo ""
    
    if [ "$password" != "$password2" ]; then
      echo -e "${RED}❌ Password tidak cocok!${NC}"
      exit 1
    fi
    
    echo "Setting password..."
    PGPASSWORD=$password psql -U $USERNAME -d postgres -c "ALTER USER $USERNAME WITH PASSWORD '$password';" 2>/dev/null || {
      echo -e "${YELLOW}⚠️  Mencoba dengan superuser...${NC}"
      psql -U $USERNAME -d postgres -c "ALTER USER $USERNAME WITH PASSWORD '$password';" || {
        echo -e "${RED}❌ Gagal set password${NC}"
        exit 1
      }
    }
    
    echo -e "${GREEN}✅ Password berhasil di-set${NC}"
    echo ""
    echo "Membuat database onvlos..."
    PGPASSWORD=$password createdb -U $USERNAME onvlos 2>/dev/null || {
      echo -e "${YELLOW}⚠️  Database mungkin sudah ada${NC}"
    }
    
    echo ""
    echo -e "${GREEN}✅ Setup selesai!${NC}"
    echo ""
    echo "Update .env.local dengan:"
    echo -e "${YELLOW}DATABASE_URL=postgresql://$USERNAME:$password@localhost:5432/onvlos${NC}"
    ;;
    
  2)
    echo ""
    echo -e "${YELLOW}⚠️  Setup trust authentication...${NC}"
    echo ""
    
    # Find pg_hba.conf
    PG_HBA=$(find /opt/homebrew /usr/local -name "pg_hba.conf" 2>/dev/null | head -1)
    
    if [ -z "$PG_HBA" ]; then
      echo -e "${RED}❌ File pg_hba.conf tidak ditemukan${NC}"
      echo "Coba cari manual:"
      echo "find /opt/homebrew /usr/local -name 'pg_hba.conf'"
      exit 1
    fi
    
    echo "File ditemukan: $PG_HBA"
    echo ""
    echo "Backup file..."
    cp "$PG_HBA" "$PG_HBA.backup"
    
    echo "Mengubah authentication method..."
    # Replace scram-sha-256 with trust for localhost
    sed -i '' 's/host.*all.*all.*127\.0\.0\.1\/32.*scram-sha-256/host    all             all             127.0.0.1\/32            trust/g' "$PG_HBA" 2>/dev/null || {
      echo -e "${YELLOW}⚠️  Gagal update otomatis. Edit manual:${NC}"
      echo "File: $PG_HBA"
      echo "Ubah 'scram-sha-256' menjadi 'trust' untuk baris localhost"
    }
    
    echo "Restarting PostgreSQL..."
    brew services restart postgresql@17 || brew services restart postgresql
    
    sleep 2
    
    echo ""
    echo "Membuat database onvlos..."
    createdb onvlos 2>/dev/null || {
      echo -e "${YELLOW}⚠️  Database mungkin sudah ada${NC}"
    }
    
    echo ""
    echo -e "${GREEN}✅ Setup selesai!${NC}"
    echo ""
    echo "Update .env.local dengan:"
    echo -e "${YELLOW}DATABASE_URL=postgresql://$USERNAME@localhost:5432/onvlos${NC}"
    ;;
    
  3)
    echo ""
    echo "Status PostgreSQL:"
    brew services list | grep postgresql
    echo ""
    echo "Test connection:"
    psql -d postgres -c "SELECT version();" 2>&1 | head -3 || {
      echo -e "${RED}❌ Tidak bisa connect${NC}"
    }
    ;;
    
  4)
    echo ""
    read -p "Gunakan password? (y/N): " use_password
    if [[ $use_password =~ ^[Yy]$ ]]; then
      read -sp "Password: " password
      echo ""
      PGPASSWORD=$password createdb -U $USERNAME onvlos 2>/dev/null && {
        echo -e "${GREEN}✅ Database berhasil dibuat${NC}"
      } || {
        echo -e "${YELLOW}⚠️  Database mungkin sudah ada atau password salah${NC}"
      }
    else
      createdb onvlos 2>/dev/null && {
        echo -e "${GREEN}✅ Database berhasil dibuat${NC}"
      } || {
        echo -e "${YELLOW}⚠️  Database mungkin sudah ada${NC}"
      }
    fi
    ;;
    
  *)
    echo -e "${RED}❌ Pilihan tidak valid${NC}"
    exit 1
    ;;
esac

echo ""
echo "Selanjutnya:"
echo "1. Update .env.local dengan DATABASE_URL yang benar"
echo "2. Jalankan: npm run db:push"
echo "3. (Optional) Jalankan: npm run db:seed"


