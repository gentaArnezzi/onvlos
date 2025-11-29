# Setup Database - ONVLOS

## 📋 Overview

Aplikasi ini menggunakan **PostgreSQL** sebagai database dengan **Drizzle ORM** untuk schema management.

## 🗄️ Database Location

Database menggunakan PostgreSQL yang bisa di-setup dengan beberapa cara:

### Opsi 1: PostgreSQL Lokal
- Install PostgreSQL di komputer Anda
- Buat database baru
- Gunakan connection string lokal

### Opsi 2: Supabase (Recommended untuk Development)
- Gratis tier tersedia
- Managed PostgreSQL
- Mudah untuk development

### Opsi 3: Railway / Render / Neon
- Cloud PostgreSQL services
- Cocok untuk production

## 🚀 Quick Setup

### 1. Install PostgreSQL (jika belum ada)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14

# Set password untuk user (opsional)
psql postgres
ALTER USER $(whoami) WITH PASSWORD 'your_password';
\q
```

**⚠️ Catatan untuk macOS:**
- User default biasanya adalah username sistem Anda (bukan `postgres`)
- Jika meminta password, gunakan password yang sudah di-set
- Lihat [SETUP_MACOS.md](./SETUP_MACOS.md) untuk panduan lengkap macOS

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download dari [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Buat Database

**macOS (dengan password):**
```bash
# Jika PostgreSQL meminta password
PGPASSWORD=your_password createdb -U $(whoami) onvlos
```

**macOS (tanpa password - trust auth):**
```bash
# Jika sudah setup trust authentication
createdb onvlos
```

**Linux/Windows:**
```bash
# Login ke PostgreSQL
psql postgres

# Buat database
CREATE DATABASE onvlos;

# Buat user (opsional)
CREATE USER onvlos_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE onvlos TO onvlos_user;

# Exit
\q
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

**macOS (dengan password):**
```env
# Database Configuration
# Ganti 'santana_mena' dengan username Anda, dan 'password' dengan password PostgreSQL
DATABASE_URL=postgresql://santana_mena:password@localhost:5432/onvlos
```

**macOS (tanpa password - trust auth):**
```env
# Database Configuration
DATABASE_URL=postgresql://santana_mena@localhost:5432/onvlos
```

**Linux/Windows:**
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/onvlos
```

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-minimum-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# Next.js Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate BETTER_AUTH_SECRET:**
```bash
# Generate random secret (32+ characters)
openssl rand -base64 32
# atau
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Push Schema ke Database

```bash
# Push semua schema ke database
npm run db:push
```

Ini akan membuat semua tabel berdasarkan schema di:
- `src/lib/db/schema.ts`
- `src/lib/db/schema-bookings.ts`
- `src/lib/db/schema-proposals.ts`
- `src/lib/db/schema-files.ts`

### 5. Seed Database (Optional)

```bash
# Isi database dengan data demo
npm run db:seed
```

## 📊 Database Schema

Database terdiri dari beberapa modul:

### Core Tables
- `user` - User authentication (BetterAuth)
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification
- `workspaces` - Workspace/organization
- `workspace_members` - Team members

### Client Management
- `client_companies` - Client companies
- `client_spaces` - Client portal spaces

### Project Management
- `boards` - Kanban boards
- `board_columns` - Board columns
- `cards` - Kanban cards
- `tasks` - Tasks
- `task_comments` - Task comments

### Financial
- `invoices` - Invoices
- `invoice_items` - Invoice line items
- `payments` - Payment records

### Sales & Onboarding
- `funnels` - Onboarding funnels
- `funnel_steps` - Funnel steps
- `client_onboarding_sessions` - Onboarding sessions

### Proposals & Contracts
- `proposals` - Proposals
- `proposal_templates` - Proposal templates
- `proposal_items` - Proposal items
- `contracts` - Contracts
- `signature_logs` - Signature logs

### Bookings
- `booking_links` - Booking links (Calendly-like)
- `bookings` - Actual bookings
- `booking_blocks` - Blocked time slots
- `booking_notifications` - Notification preferences

### Communication
- `conversations` - Chat conversations
- `messages` - Chat messages

### Calendar
- `calendar_events` - Calendar events
- `calendar_event_attendees` - Event attendees

### Files
- `files` - File uploads
- `file_shares` - File sharing

### Automation
- `workflows` - Automation workflows

## 🔧 Troubleshooting

### Error: "relation does not exist"
```bash
# Pastikan schema sudah di-push
npm run db:push
```

### Error: "connection refused"
- Pastikan PostgreSQL service berjalan
- Cek DATABASE_URL di `.env.local`
- Cek firewall/port (default: 5432)

### Error: "password authentication failed"
- Cek username dan password di DATABASE_URL
- Pastikan user memiliki akses ke database

### Reset Database
```bash
# Hapus semua tabel (HATI-HATI!)
psql -d onvlos -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Push schema lagi
npm run db:push
npm run db:seed
```

## 📝 Migration (Future)

Untuk production, gunakan migrations:

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate
```

## 🔐 Production Setup

Untuk production, gunakan managed database service:

1. **Supabase**: [supabase.com](https://supabase.com)
2. **Railway**: [railway.app](https://railway.app)
3. **Neon**: [neon.tech](https://neon.tech)
4. **AWS RDS**: [aws.amazon.com/rds](https://aws.amazon.com/rds)

Update `DATABASE_URL` dengan connection string dari service tersebut.

## 📚 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Better Auth Docs](https://www.better-auth.com/docs)

