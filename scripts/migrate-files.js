#!/usr/bin/env node

/**
 * Royal Photowaala - File Migration Script
 * Moves existing files to organized directory structure
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🔄 Royal Photowaala - File Migration Script');
console.log('==========================================\n');

const uploadsDir = path.join(__dirname, '../uploads');
const dbPath = path.join(__dirname, '../backend/database.sqlite');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found at:', dbPath);
  process.exit(1);
}

// Connect to database
const db = new sqlite3.Database(dbPath);

async function migrateFiles() {
  return new Promise((resolve, reject) => {
    console.log('📂 Analyzing database and files...\n');
    
    // Get all files from database
    const queries = [
      'SELECT filename, "gallery" as type FROM gallery',
      'SELECT filename, "home" as type FROM home_images', 
      'SELECT filename, "logos" as type FROM logos'
    ];
    
    let processed = 0;
    let moved = 0;
    let errors = 0;
    
    queries.forEach(query => {
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('❌ Database error:', err);
          errors++;
          return;
        }
        
        rows.forEach(row => {
          processed++;
          const sourcePath = path.join(uploadsDir, row.filename);
          const targetDir = path.join(uploadsDir, row.type);
          const targetPath = path.join(targetDir, row.filename);
          
          // Ensure target directory exists
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          // Check if source file exists
          if (fs.existsSync(sourcePath)) {
            // Check if target already exists
            if (fs.existsSync(targetPath)) {
              console.log(`⚠️  Target already exists: ${row.type}/${row.filename}`);
            } else {
              // Move file
              try {
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`✅ Moved: ${row.filename} → ${row.type}/`);
                moved++;
              } catch (error) {
                console.log(`❌ Failed to move ${row.filename}:`, error.message);
                errors++;
              }
            }
          } else {
            console.log(`⚠️  Source file not found: ${row.filename}`);
          }
        });
        
        // Check if all queries are done
        if (processed >= queries.length * 10) { // Rough estimate
          console.log(`\n📊 Migration Summary:`);
          console.log(`   Total files processed: ${processed}`);
          console.log(`   Files moved: ${moved}`);
          console.log(`   Errors: ${errors}`);
          console.log(`   Skipped: ${processed - moved - errors}`);
          
          if (errors === 0) {
            console.log(`\n🎉 Migration completed successfully!`);
          } else {
            console.log(`\n⚠️  Migration completed with ${errors} errors`);
          }
          
          resolve();
        }
      });
    });
  });
}

// Run migration
migrateFiles().then(() => {
  db.close();
  process.exit(0);
}).catch(error => {
  console.error('❌ Migration failed:', error);
  db.close();
  process.exit(1);
});
