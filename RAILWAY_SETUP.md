# Railway Database Setup Guide

Panduan lengkap untuk setup PostgreSQL database di Railway untuk aplikasi Flazy.

## 1. Membuat Database di Railway

### Langkah-langkah:

1. **Login ke Railway**
   - Buka [railway.app](https://railway.app)
   - Login dengan GitHub account atau email

2. **Buat Project Baru**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo" atau "Empty Project"

3. **Tambahkan PostgreSQL Database**
   - Di dashboard project, klik "New"
   - Pilih "Database" → "Add PostgreSQL"
   - Railway akan otomatis membuat PostgreSQL instance

4. **Dapatkan Connection String**
   
   **PENTING**: Untuk local development, Anda perlu menggunakan **Public Connection String**, bukan internal.
   
   - Setelah database dibuat, klik pada service PostgreSQL
   - Buka tab **"Connect"** atau **"Public Networking"**
   - Klik **"Generate Public URL"** atau **"Enable Public Networking"**
   - Copy **Public Connection String** yang diberikan
   - Format: `postgresql://user:password@public-host.railway.app:port/database`
   
   **JANGAN gunakan** connection string dengan hostname `postgres.railway.internal` karena itu hanya untuk internal Railway services.
   
   Alternatif: Gunakan format individual dari tab "Variables":
     - `PGHOST` - Public host address (bukan .railway.internal)
     - `PGPORT` - Port (default: 5432)
     - `PGDATABASE` - Database name
     - `PGUSER` - Username
     - `PGPASSWORD` - Password
   
   **Cara Manual Membuat Connection String:**
   ```
   postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]?sslmode=require
   ```

## 2. Setup Environment Variables

### Local Development (.env.local)

Buat file `.env.local` di root project dengan isi:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# BetterAuth
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Gateways (optional untuk MVP)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
XENDIT_SECRET_KEY=...

# Email Service
RESEND_API_KEY=re_...

# File Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# atau untuk S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...

# OpenAI (untuk AI Assistant)
OPENAI_API_KEY=sk-...
# atau Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

### Production (Railway Environment Variables)

1. Di Railway project dashboard, klik "Variables"
2. Tambahkan semua environment variables yang diperlukan
3. Railway akan otomatis inject `DATABASE_URL` untuk database service

## 3. Menjalankan Migrations

### Generate Migration

```bash
npm run db:generate
```

Ini akan membuat file migration di folder `drizzle/` berdasarkan schema yang ada.

### Push Schema (Development)

Untuk development, bisa langsung push schema tanpa migration:

```bash
npm run db:push
```

### Run Migrations (Production)

Untuk production, jalankan migrations:

```bash
npm run db:migrate
```

Atau jika menggunakan Railway CLI:

```bash
railway run npm run db:migrate
```

## 4. Verifikasi Connection

Setelah setup, test koneksi database dengan:

```bash
npm run db:studio
```

Ini akan membuka Drizzle Studio untuk melihat dan mengelola database.

## 5. Database Backup & Restore

### Backup

Railway otomatis melakukan backup harian. Untuk manual backup:

1. Di Railway dashboard, klik pada PostgreSQL service
2. Buka tab "Data"
3. Klik "Download Backup"

### Restore

1. Di Railway dashboard, PostgreSQL service
2. Tab "Data" → "Restore Backup"
3. Upload backup file

## 6. Monitoring & Logs

- **Metrics**: Lihat di Railway dashboard → PostgreSQL service → Metrics
- **Logs**: Railway dashboard → PostgreSQL service → Logs
- **Connection Pool**: Monitor connection count di Metrics

## 7. Troubleshooting

### Error: `getaddrinfo ENOTFOUND postgres.railway.internal`
**Masalah**: Anda menggunakan internal Railway connection string yang tidak bisa diakses dari local machine.

**Solusi**:
1. Di Railway dashboard, buka PostgreSQL service
2. Buka tab **"Connect"** atau **"Public Networking"**
3. Enable **"Public Networking"** atau klik **"Generate Public URL"**
4. Copy **Public Connection String** (hostname akan seperti `xxx.railway.app`, bukan `postgres.railway.internal`)
5. Update `DATABASE_URL` di `.env.local` dengan public connection string
6. Pastikan connection string menggunakan format: `postgresql://user:password@public-host.railway.app:port/database?sslmode=require`

### Connection Timeout
- Pastikan `DATABASE_URL` menggunakan **public connection string**, bukan internal
- Check firewall settings
- Verify database service status di Railway
- Pastikan Public Networking sudah di-enable

### Migration Errors
- Pastikan semua schema files sudah di-import di `drizzle.config.ts`
- Check untuk conflicting migrations
- Verify database permissions
- Pastikan menggunakan public connection string

### Connection Pool Exhausted
- Increase pool size di `src/lib/db/index.ts`
- Check untuk connection leaks
- Monitor active connections di Railway metrics

## 8. Production Best Practices

1. **Use Connection Pooling**: Sudah diimplementasi di `src/lib/db/index.ts`
2. **Enable SSL**: Railway otomatis enable SSL untuk production
3. **Monitor Performance**: Gunakan Railway metrics untuk monitor query performance
4. **Regular Backups**: Railway otomatis backup, tapi bisa setup additional backups
5. **Environment Separation**: Gunakan database terpisah untuk staging dan production

## 9. Cost Optimization

- Railway PostgreSQL starter plan: $5/month (1GB storage)
- Monitor usage di Railway dashboard
- Consider upgrading jika mendekati limit
- Archive old data jika diperlukan

## Support

Jika ada masalah:
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Check GitHub issues

