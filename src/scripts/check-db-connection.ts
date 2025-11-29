import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

// Parse DATABASE_URL to extract connection info (without password)
function parseDatabaseUrl(url: string) {
  try {
    const urlObj = new URL(url);
    return {
      user: urlObj.username || 'N/A',
      host: urlObj.hostname || 'N/A',
      port: urlObj.port || '5432',
      database: urlObj.pathname?.replace('/', '') || 'N/A',
      hasPassword: !!urlObj.password,
      protocol: urlObj.protocol?.replace(':', '') || 'N/A',
    };
  } catch (error) {
    return null;
  }
}

async function checkDatabaseConnection() {
  logSection('🔍 Pengecekan Koneksi Database');

  // 1. Check if .env.local exists
  log('\n📄 1. Mengecek file .env.local...', colors.blue);
  if (!fs.existsSync(envPath)) {
    log('❌ File .env.local tidak ditemukan!', colors.red);
    log(`   Lokasi yang dicari: ${envPath}`, colors.yellow);
    process.exit(1);
  }
  log('✅ File .env.local ditemukan', colors.green);

  // 2. Read DATABASE_URL from .env.local (first 30 lines)
  log('\n📋 2. Membaca konfigurasi database (baris 1-30)...', colors.blue);
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n').slice(0, 30);
  
  let databaseUrl: string | undefined;
  let databaseUrlLine = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('DATABASE_URL=') && !line.startsWith('#')) {
      databaseUrl = line.replace('DATABASE_URL=', '').trim();
      // Remove quotes if present
      databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');
      databaseUrlLine = i + 1;
      break;
    }
  }

  if (!databaseUrl) {
    log('❌ DATABASE_URL tidak ditemukan di baris 1-30 dari .env.local!', colors.red);
    log('   Pastikan DATABASE_URL ada di baris 1-30', colors.yellow);
    process.exit(1);
  }

  log(`✅ DATABASE_URL ditemukan di baris ${databaseUrlLine}`, colors.green);

  // 3. Parse and display connection info (without password)
  log('\n🔗 3. Informasi Koneksi Database:', colors.blue);
  const connInfo = parseDatabaseUrl(databaseUrl);
  if (!connInfo) {
    log('❌ Format DATABASE_URL tidak valid!', colors.red);
    log(`   Format yang diharapkan: postgresql://user:password@host:port/database`, colors.yellow);
    process.exit(1);
  }

  console.log(`   Protocol: ${connInfo.protocol}`);
  console.log(`   User: ${connInfo.user}`);
  console.log(`   Host: ${connInfo.host}`);
  console.log(`   Port: ${connInfo.port}`);
  console.log(`   Database: ${connInfo.database}`);
  console.log(`   Password: ${connInfo.hasPassword ? '*** (tersembunyi)' : 'Tidak ada'}`);

  // 4. Test database connection
  log('\n🔌 4. Menguji koneksi ke database...', colors.blue);
  
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10000,
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    log('✅ Koneksi berhasil!', colors.green);

    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version;
    log(`\n📊 Versi PostgreSQL: ${version.split(',')[0]}`, colors.cyan);

    // Get current database name
    const dbResult = await client.query('SELECT current_database()');
    const currentDb = dbResult.rows[0].current_database;
    log(`📦 Database aktif: ${currentDb}`, colors.cyan);

    // Get current user
    const userResult = await client.query('SELECT current_user');
    const currentUser = userResult.rows[0].current_user;
    log(`👤 User aktif: ${currentUser}`, colors.cyan);

    // Check if database has tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tableCount = tablesResult.rows.length;
    log(`\n📋 Jumlah tabel di database: ${tableCount}`, colors.cyan);
    
    if (tableCount > 0) {
      log('\n📝 Daftar tabel:', colors.blue);
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } else {
      log('⚠️  Database kosong (belum ada tabel)', colors.yellow);
      log('   Jalankan: npm run db:push untuk membuat tabel', colors.yellow);
    }

    // Test a simple query
    log('\n🧪 5. Menguji query sederhana...', colors.blue);
    const testResult = await client.query('SELECT NOW() as current_time, 1 as test_value');
    log('✅ Query berhasil!', colors.green);
    console.log(`   Waktu server: ${testResult.rows[0].current_time}`);
    console.log(`   Test value: ${testResult.rows[0].test_value}`);

    client.release();

    // Summary
    logSection('✅ Ringkasan');
    log('Status: Koneksi database berhasil!', colors.green);
    log(`Database: ${connInfo.database}`, colors.cyan);
    log(`Host: ${connInfo.host}:${connInfo.port}`, colors.cyan);
    log(`User: ${connInfo.user}`, colors.cyan);
    log(`Tabel: ${tableCount} tabel ditemukan`, colors.cyan);

  } catch (error: any) {
    log('\n❌ Koneksi database gagal!', colors.red);
    log(`\nError: ${error.message}`, colors.red);
    
    if (error.code === 'ECONNREFUSED') {
      log('\n💡 Kemungkinan penyebab:', colors.yellow);
      log('   1. PostgreSQL service tidak berjalan', colors.yellow);
      log('   2. Host atau port salah', colors.yellow);
      log('   3. Firewall memblokir koneksi', colors.yellow);
      log('\n   Solusi:', colors.yellow);
      log('   - macOS: brew services start postgresql@17', colors.yellow);
      log('   - Linux: sudo systemctl start postgresql', colors.yellow);
    } else if (error.code === '28P01' || error.message.includes('password')) {
      log('\n💡 Kemungkinan penyebab:', colors.yellow);
      log('   1. Password salah', colors.yellow);
      log('   2. User tidak memiliki akses', colors.yellow);
      log('\n   Solusi:', colors.yellow);
      log('   - Cek password di DATABASE_URL', colors.yellow);
      log('   - Reset password: psql postgres -c "ALTER USER ... WITH PASSWORD \'new_password\';"', colors.yellow);
    } else if (error.code === '3D000' || error.message.includes('does not exist')) {
      log('\n💡 Kemungkinan penyebab:', colors.yellow);
      log('   Database tidak ada', colors.yellow);
      log('\n   Solusi:', colors.yellow);
      log('   - Buat database: createdb onvlos', colors.yellow);
      log('   - Atau: PGPASSWORD=password createdb -U user onvlos', colors.yellow);
    } else {
      log('\n💡 Detail error:', colors.yellow);
      console.error(error);
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the check
checkDatabaseConnection()
  .then(() => {
    log('\n✅ Pengecekan selesai!', colors.green);
    process.exit(0);
  })
  .catch((error) => {
    log('\n❌ Terjadi kesalahan:', colors.red);
    console.error(error);
    process.exit(1);
  });

