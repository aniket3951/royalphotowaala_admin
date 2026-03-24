const db = require('./db');

console.log('🌱 Seeding database with sample data...');

// Sample bookings
const sampleBookings = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    package: 'Premium Wedding Package',
    date: '2024-12-15',
    details: 'Wedding photography for 2 days',
    status: 'confirmed'
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '9876543211',
    package: 'Birthday Package',
    date: '2024-11-20',
    details: 'Birthday party photography',
    status: 'pending'
  },
  {
    name: 'Amit Kumar',
    email: 'amit@example.com',
    phone: '9876543212',
    package: 'Corporate Event Package',
    date: '2024-10-25',
    details: 'Corporate event coverage',
    status: 'completed'
  }
];

// Insert sample bookings
db.serialize(() => {
  console.log('📅 Adding sample bookings...');
  
  sampleBookings.forEach((booking, index) => {
    db.run(
      `INSERT OR IGNORE INTO bookings (name, email, phone, package, date, details, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [booking.name, booking.email, booking.phone, booking.package, booking.date, booking.details, booking.status],
      function(err) {
        if (err) {
          console.error(`❌ Error inserting booking ${index + 1}:`, err.message);
        } else {
          if (this.changes > 0) {
            console.log(`✅ Sample booking ${index + 1} added: ${booking.name}`);
          } else {
            console.log(`⚠️ Sample booking ${index + 1} already exists: ${booking.name}`);
          }
        }
      }
    );
  });

  // Check existing data after insertion
  setTimeout(() => {
    console.log('\n📊 Checking database contents...');
    
    db.all("SELECT * FROM bookings", [], (err, rows) => {
      if (err) {
        console.error("❌ Error checking bookings:", err.message);
      } else {
        console.log(`✅ Total bookings in database: ${rows.length}`);
        rows.forEach(booking => {
          console.log(`   - ID: ${booking.id}, Name: ${booking.name}, Status: ${booking.status}`);
        });
      }
    });

    db.all("SELECT * FROM gallery", [], (err, rows) => {
      if (err) {
        console.error("❌ Error checking gallery:", err.message);
      } else {
        console.log(`✅ Total gallery images: ${rows.length}`);
      }
    });

    db.all("SELECT * FROM home_images", [], (err, rows) => {
      if (err) {
        console.error("❌ Error checking home images:", err.message);
      } else {
        console.log(`✅ Total home images: ${rows.length}`);
      }
    });

    console.log('\n🎉 Database seeding completed!');
  }, 1000);
});
