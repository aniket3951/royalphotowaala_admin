#!/usr/bin/env node

/**
 * Royal Photowaala - Startup Script
 * Professional development server with hot reload and logging
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logo
const logo = `
${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    📸 Royal Photowaala - Professional Photography System     ║
║                                                              ║
║    🚀 Starting Development Server...                         ║
║    📝 Mode: ${process.env.NODE_ENV || 'development'}${' '.repeat(36)}║
║    🌐 Port: ${process.env.PORT || 5000}${' '.repeat(39)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
`;

console.log(logo);

// Check if required directories exist
const requiredDirs = [
  'uploads',
  'uploads/gallery',
  'uploads/home',
  'uploads/logos',
  'backend'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`${colors.yellow}Creating directory: ${dir}${colors.reset}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Check if database exists
const dbPath = path.join(process.cwd(), 'backend', 'database.sqlite');
if (!fs.existsSync(dbPath)) {
  console.log(`${colors.yellow}Database will be created on first start...${colors.reset}`);
}

// Start the server
console.log(`${colors.green}🚀 Starting Royal Photowaala server...${colors.reset}`);

const server = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Handle server output
server.stdout?.on('data', (data) => {
  const output = data.toString();
  if (output.includes('✅')) {
    console.log(`${colors.green}${output}${colors.reset}`);
  } else if (output.includes('❌')) {
    console.log(`${colors.red}${output}${colors.reset}`);
  } else if (output.includes('🔐')) {
    console.log(`${colors.yellow}${output}${colors.reset}`);
  } else {
    console.log(output);
  }
});

server.stderr?.on('data', (data) => {
  console.log(`${colors.red}${data}${colors.reset}`);
});

// Handle process termination
server.on('close', (code) => {
  if (code === 0) {
    console.log(`${colors.green}✅ Server stopped successfully${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Server exited with code ${code}${colors.reset}`);
  }
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Received SIGINT. Shutting down gracefully...${colors.reset}`);
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}🛑 Received SIGTERM. Shutting down gracefully...${colors.reset}`);
  server.kill('SIGTERM');
});

console.log(`${colors.cyan}🌐 Server will be available at:${colors.reset}`);
console.log(`${colors.blue}   📸 Main Website: http://localhost:${process.env.PORT || 5000}${colors.reset}`);
console.log(`${colors.blue}   🎛️  Admin Panel: http://localhost:${process.env.PORT || 5000}/admin/dashboard.html${colors.reset}`);
console.log(`${colors.blue}   🔐 Admin Login: http://localhost:${process.env.PORT || 5000}/admin/login.html${colors.reset}`);
console.log(`\n${colors.magenta}📋 Admin Credentials:${colors.reset}`);
console.log(`${colors.yellow}   Username: aniket49${colors.reset}`);
console.log(`${colors.yellow}   Password: 0aniket0${colors.reset}`);
console.log(`\n${colors.green}🎉 Ready to receive bookings and showcase your photography!${colors.reset}\n`);
