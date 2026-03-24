#!/usr/bin/env node

/**
 * Royal Photowaala - Database Update Script
 * Updates database with existing files
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🔄 Royal Photowaala - Database Update Script');
console.log('==========================================\n');

const uploadsDir = path.join(__dirname, '../uploads');
const galleryDir = path.join(uploadsDir, 'gallery');
const dbPath = path.join(__dirname, '../backend/database.sqlite');

// Connect to database
const db = new sqlite3.Database(dbPath);

async function updateDatabase() {
  return new Promise((resolve, reject) => {
    console.log('📂 Checking gallery files...\n');
    
    // Get files in gallery directory
    if (fs.existsSync(galleryDir)) {
      const files = fs.readdirSync(galleryDir);
      console.log(`Found ${files.length} files in gallery directory:`);
      
      // Clear existing gallery records
      db.run('DELETE FROM gallery', (err) => {
        if (err) {
          console.error('❌ Error clearing gallery:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Cleared existing gallery records');
        
        // Insert new records
        let inserted = 0;
        files.forEach(file => {
          const filePath = path.join(galleryDir, file);
          if (fs.statSync(filePath).isFile()) {
            db.run('INSERT INTO gallery (filename) VALUES (?)', [file], (err) => {
              if (err) {
                console.error(`❌ Error inserting ${file}:`, err);
              } else {
                console.log(`✅ Inserted: ${file}`);
                inserted++;
              }
              
              if (inserted === files.length) {
                console.log(`\n📊 Database Update Summary:`);
                console.log(`   Files inserted: ${inserted}`);
                console.log(`   Total files: ${files.length}`);
                console.log(`\n🎉 Database updated successfully!`);
                resolve();
              }
            });
          }
        });
      });
    } else {
      console.log('❌ Gallery directory not found');
      resolve();
    }
  });
}

// Run update
updateDatabase().then(() => {
  db.close();
  process.exit(0);
}).catch(error => {
  console.error('❌ Database update failed:', error);
  db.close();
  process.exit(1);
});
