// build-check.js
const fs = require('fs');
const path = require('path');

// Check if index.html exists and has correct paths
console.log('Checking index.html...');
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log('index.html exists');
  
  // Check for import path
  if (indexContent.includes('src/main.tsx')) {
    console.log('✅ index.html has correct import path');
  } else {
    console.log('❌ index.html has incorrect import path');
    console.log(indexContent);
  }
} else {
  console.log('❌ index.html not found');
}

// Check vite.config.ts
console.log('\nChecking vite.config.ts...');
const vitePath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(vitePath)) {
  const viteContent = fs.readFileSync(vitePath, 'utf8');
  console.log('vite.config.ts exists');
  
  // Check for base path
  if (viteContent.includes("base: \"\"")) {
    console.log('✅ vite.config.ts has empty base path');
  } else {
    console.log('❌ vite.config.ts has incorrect base path');
  }
} else {
  console.log('❌ vite.config.ts not found');
}

console.log('\nBuild check complete'); 