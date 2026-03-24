const db = require('./db');
const fs = require('fs');
const path = require('path');

console.log('🗑️ Clearing all data from database...');

// Clear all data
db.serialize(() => {
  console.log('📅 Clearing bookings...');
  db.run('DELETE FROM bookings', function(err) {
    if (err) {
      console.error('❌ Error clearing bookings:', err.message);
    } else {
      console.log(`✅ Cleared ${this.changes} booking records`);
    }
  });

  console.log('🖼️ Clearing gallery images...');
  db.run('DELETE FROM gallery', function(err) {
    if (err) {
      console.error('❌ Error clearing gallery:', err.message);
    } else {
      console.log(`✅ Cleared ${this.changes} gallery records`);
    }
  });

  console.log('🏠 Clearing home images...');
  db.run('DELETE FROM home_images', function(err) {
    if (err) {
      console.error('❌ Error clearing home images:', err.message);
    } else {
      console.log(`✅ Cleared ${this.changes} home image records`);
    }
  });

  console.log('🎨 Clearing logos...');
  db.run('DELETE FROM logos', function(err) {
    if (err) {
      console.error('❌ Error clearing logos:', err.message);
    } else {
      console.log(`✅ Cleared ${this.changes} logo records`);
    }
  });

  console.log('📦 Clearing archive...');
  db.run('DELETE FROM archive_bookings', function(err) {
    if (err) {
      console.error('❌ Error clearing archive:', err.message);
    } else {
      console.log(`✅ Cleared ${this.changes} archive records`);
    }
  });

  // Clear uploaded files
  setTimeout(() => {
    console.log('\n🗂️ Clearing uploaded files...');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const directories = ['gallery', 'home', 'logos'];
    
    directories.forEach(dir => {
      const dirPath = path.join(uploadsDir, dir);
      if (fs.existsSync(dirPath)) {
        fs.readdir(dirPath, (err, files) => {
          if (err) {
            console.error(`❌ Error reading ${dir} directory:`, err.message);
            return;
          }
          
          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`❌ Error deleting ${filePath}:`, err.message);
              } else {
                console.log(`🗑️ Deleted: ${file}`);
              }
            });
          });
          
          if (files.length === 0) {
            console.log(`📁 ${dir} directory already empty`);
          }
        });
      } else {
        console.log(`📁 ${dir} directory does not exist`);
      }
    });
  }, 1000);

  // Verify deletion after clearing
  setTimeout(() => {
    console.log('\n📊 Verifying data deletion...');
    
    db.all("SELECT COUNT(*) as count FROM bookings", [], (err, row) => {
      if (err) {
        console.error("❌ Error checking bookings:", err.message);
      } else {
        console.log(`📅 Bookings remaining: ${row[0].count}`);
      }
    });

    db.all("SELECT COUNT(*) as count FROM gallery", [], (err, row) => {
      if (err) {
        console.error("❌ Error checking gallery:", err.message);
      } else {
        console.log(`🖼️ Gallery images remaining: ${row[0].count}`);
      }
    });

    db.all("SELECT COUNT(*) as count FROM home_images", [], (err, row) => {
      if (err) {
        console.error("❌ Error checking home images:", err.message);
      } else {
        console.log(`🏠 Home images remaining: ${row[0].count}`);
      }
    });

    db.all("SELECT COUNT(*) as count FROM logos", [], (err, row) => {
      if (err) {
        console.error("❌ Error checking logos:", err.message);
      } else {
        console.log(`🎨 Logos remaining: ${row[0].count}`);
      }
    });

    console.log('\n🎉 All data cleared successfully!');
  }, 2000);
});
