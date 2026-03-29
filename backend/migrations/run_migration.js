/**
 * Migration Runner — executa fisiere SQL pe baza de date remote
 * Utilizare: node run_migration.js [fisier.sql]
 * Daca nu se specifica fisier, ruleaza toate migratiile in ordine.
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parametri individuali — evita probleme cu caractere speciale (#) in URL
const dbConfig = {
  host: process.env.DB_HOST || '38.242.226.83',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'MPI',
  user: process.env.DB_USER || 'scraper',
  password: process.env.DB_PASSWORD || 'Scraper123#',
};

async function runMigration(filePath) {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Conectat la baza de date PostgreSQL');
    
    const sql = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    console.log(`⏳ Rulez migratia: ${fileName}...`);
    await client.query(sql);
    console.log(`✅ Migratia ${fileName} aplicata cu succes!`);
    
    // Verifica tabelele create
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tabele in baza de date:');
    res.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
  } catch (err) {
    console.error('❌ Eroare la migratie:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexiune inchisa.');
  }
}

// Determina fisierul de rulat
const targetFile = process.argv[2];
if (targetFile) {
  runMigration(path.resolve(targetFile));
} else {
  // Ruleaza toate migratiile din directorul curent, in ordine
  const migrationsDir = __dirname;
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  if (sqlFiles.length === 0) {
    console.log('⚠️ Nu exista fisiere .sql in directorul migrations/');
    process.exit(0);
  }
  
  (async () => {
    for (const file of sqlFiles) {
      await runMigration(path.join(migrationsDir, file));
    }
  })();
}
