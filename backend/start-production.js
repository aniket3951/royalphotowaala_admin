#!/usr/bin/env node

// Production startup script for Royal Photowaala
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Royal Photowaala Production Server...');

// Ensure database directory exists with correct persistent path
const dbPath = '/opt/render/project/src/database.sqlite';
const dbDir = path.dirname(dbPath);

try {
  // Create database directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created database directory:', dbDir);
  }

  // Check if database file exists
  if (!fs.existsSync(dbPath)) {
    console.log('ℹ️ Database file not found, will be created on first run');
  } else {
    console.log('✅ Database file exists:', dbPath);
  }

  // Create uploads directories if they don't exist (in parent directory like multer configs)
  const uploadsDirs = ['../uploads/gallery', '../uploads/home', '../uploads/logos'];
  uploadsDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log('✅ Created uploads directory:', fullPath);
    } else {
      console.log('✅ Uploads directory exists:', fullPath);
    }
  });

  // Set correct DATABASE_URL for persistent storage
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log('✅ DATABASE_URL set to:', process.env.DATABASE_URL);

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push database schema
  console.log('🗄️ Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Seed production data if needed
  console.log('🌱 Checking if production data seeding is needed...');
  try {
    execSync('node seed-production.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️ Production seeding skipped or already completed');
  }

  console.log('✅ Production setup complete!');
  
  // Start the server
  console.log('🌟 Starting application server...');
  require('./server.js');
  
} catch (error) {
  console.error('❌ Production startup error:', error);
  process.exit(1);
}
