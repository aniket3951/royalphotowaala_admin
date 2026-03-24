#!/usr/bin/env node

/**
 * Royal Photowaala - Setup Script
 * Initializes the project structure and dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Royal Photowaala project...');

// Create necessary directories
const directories = [
  'uploads',
  'uploads/gallery',
  'uploads/home', 
  'uploads/logos',
  'uploads/temp',
  'logs',
  'config'
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .gitkeep files in upload directories
const gitkeepDirs = ['uploads/gallery', 'uploads/home', 'uploads/logos', 'uploads/temp'];
gitkeepDirs.forEach(dir => {
  const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '# This file ensures the directory is tracked by git\n');
    console.log(`✅ Created .gitkeep in: ${dir}`);
  }
});

// Create environment file if it doesn't exist
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env file from .env.example');
}

// Create logs directory and basic log file
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  const logFile = path.join(logsDir, 'app.log');
  fs.writeFileSync(logFile, `# Royal Photowaala - Application Log\n# Created: ${new Date().toISOString()}\n\n`);
  console.log('✅ Created logs directory and initial log file');
}

console.log('\n🎉 Royal Photowaala setup complete!');
console.log('📝 Next steps:');
console.log('   1. Review and update .env file if needed');
console.log('   2. Run "npm start" to launch the application');
console.log('   3. Visit http://localhost:5000 to access the website');
console.log('   4. Visit http://localhost:5000/admin/dashboard.html for admin panel');
console.log('\n🔐 Admin credentials:');
console.log('   Username: aniket49');
console.log('   Password: 0aniket0');
