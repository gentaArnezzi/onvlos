# Setup Database di macOS - ONVLOS

## 🔧 Setup PostgreSQL di macOS

### Opsi 1: Setup dengan Password (Recommended)

Jika PostgreSQL sudah terinstall dan meminta password:

```bash
# 1. Cek apakah PostgreSQL berjalan
brew services list | grep postgresql

# 2. Jika tidak berjalan, start service
brew services start postgresql@17
# atau
brew services start postgresql

# 3. Set password untuk user PostgreSQL
psql postgres
# Di dalam psql:
ALTER USER santana_mena WITH PASSWORD 'your_password';
# atau buat user baru:
CREATE USER postgres WITH PASSWORD 'your_password';
ALTER USER postgres CREATEDB;
\q
```

### Opsi 2: Setup Trust Authentication (Tanpa Password)

Untuk development lokal, bisa setup trust authentication:

```bash
# 1. Edit pg_hba.conf
# Lokasi file biasanya di:
# /opt/homebrew/var/postgresql@17/pg_hba.conf
# atau
# /usr/local/var/postgresql@17/pg_hba.conf

# 2. Cari file pg_hba.conf
find /opt/homebrew /usr/local -name "pg_hba.conf" 2>/dev/null

# 3. Edit file tersebut, ubah baris:
# host    all             all             127.0.0.1/32            scram-sha-256
# Menjadi:
# host    all             all             127.0.0.1/32            trust

# 4. Restart PostgreSQL
brew services restart postgresql@17
```

### Opsi 3: Reset PostgreSQL Password

Jika lupa password:

```bash
# 1. Stop PostgreSQL
brew services stop postgresql@17

# 2. Start PostgreSQL dalam single-user mode
/opt/homebrew/opt/postgresql@17/bin/postgres --single -D /opt/homebrew/var/postgresql@17 -d postgres

# 3. Di dalam postgres prompt, jalankan:
ALTER USER santana_mena WITH PASSWORD 'new_password';
# Tekan Ctrl+D untuk keluar

# 4. Start PostgreSQL normal
brew services start postgresql@17
```

## 🗄️ Setup Database

### Cara 1: Dengan Password

```bash
# 1. Buat database dengan password
PGPASSWORD=your_password createdb -U santana_mena onvlos

# 2. Update .env.local
DATABASE_URL=postgresql://santana_mena:your_password@localhost:5432/onvlos
```

### Cara 2: Tanpa Password (Trust Auth)

```bash
# 1. Buat database
createdb onvlos

# 2. Update .env.local
DATABASE_URL=postgresql://santana_mena@localhost:5432/onvlos
# atau
DATABASE_URL=postgresql://localhost:5432/onvlos
```

### Cara 3: Menggunakan User postgres

```bash
# 1. Buat user postgres jika belum ada
createuser -s postgres

# 2. Set password
psql postgres -c "ALTER USER postgres WITH PASSWORD 'your_password';"

# 3. Buat database
PGPASSWORD=your_password createdb -U postgres onvlos

# 4. Update .env.local
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/onvlos
```

## ✅ Verifikasi Setup

```bash
# Test connection
psql -d onvlos -c "SELECT version();"

# Atau dengan password
PGPASSWORD=your_password psql -U santana_mena -d onvlos -c "SELECT version();"
```

## 🚀 Setup Aplikasi

Setelah database setup, lanjutkan dengan:

```bash
# 1. Pastikan .env.local sudah benar
cat .env.local | grep DATABASE_URL

# 2. Push schema
npm run db:push

# 3. Seed data (optional)
npm run db:seed
```

## 🔍 Troubleshooting

### Error: "password authentication failed"

**Solusi 1:** Cek password di `.env.local`
```bash
# Pastikan format DATABASE_URL benar
DATABASE_URL=postgresql://username:password@localhost:5432/database
```

**Solusi 2:** Reset password
```bash
psql postgres -c "ALTER USER santana_mena WITH PASSWORD 'new_password';"
```

**Solusi 3:** Setup trust authentication (lihat Opsi 2 di atas)

### Error: "database does not exist"

```bash
# Buat database
createdb onvlos
# atau dengan password
PGPASSWORD=your_password createdb -U santana_mena onvlos
```

### Error: "connection refused"

```bash
# Pastikan PostgreSQL berjalan
brew services list | grep postgresql

# Start jika tidak berjalan
brew services start postgresql@17
```

### Cek Port PostgreSQL

```bash
# Default port adalah 5432
lsof -i :5432

# Jika port berbeda, update DATABASE_URL
DATABASE_URL=postgresql://user:pass@localhost:5433/onvlos
```

## 📝 Quick Reference

**Format DATABASE_URL:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Contoh untuk macOS:**
```bash
# Dengan password
DATABASE_URL=postgresql://santana_mena:mypassword@localhost:5432/onvlos

# Tanpa password (trust auth)
DATABASE_URL=postgresql://santana_mena@localhost:5432/onvlos

# User postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/onvlos
```


