#!/usr/bin/env node

/**
 * Royal Photowaala - Clean Script
 * Cleans temporary files and optimizes the project
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning Royal Photowaala project...');

// Clean temporary files
const tempDirs = [
  'uploads/temp',
  'logs'
];

tempDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      // Remove files older than 7 days
      if (stat.isFile() && Date.now() - stat.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Removed old file: ${file}`);
      }
    });
  }
});

// Clean node_modules cache (optional)
const nodeModulesPath = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(nodeModulesPath)) {
  try {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('🗑️ Cleaned node_modules cache');
  } catch (error) {
    console.log('⚠️ Could not clean node_modules cache');
  }
}

// Remove duplicate uploads (same filename in different directories)
const uploadsDir = path.join(process.cwd(), 'uploads');
const uploadTypes = ['gallery', 'home', 'logos'];
const fileMap = new Map();

uploadTypes.forEach(type => {
  const typeDir = path.join(uploadsDir, type);
  if (fs.existsSync(typeDir)) {
    const files = fs.readdirSync(typeDir);
    files.forEach(file => {
      const filePath = path.join(typeDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const fileKey = `${file}_${stat.size}`;
        if (fileMap.has(fileKey)) {
          console.log(`🔍 Duplicate found: ${file} in ${type}`);
          // Optionally remove duplicates
          // fs.unlinkSync(filePath);
          // console.log(`🗑️ Removed duplicate: ${file}`);
        } else {
          fileMap.set(fileKey, { type, path: filePath });
        }
      }
    });
  }
});

console.log('\n✅ Royal Photowaala cleanup complete!');
console.log('📊 Project optimized and ready for development');
