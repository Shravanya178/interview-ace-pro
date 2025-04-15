const fs = require('fs');
const path = require('path');

// Check the index.html file path
console.log('[Vercel Build] Checking index.html');
const indexPath = path.join(process.cwd(), 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('[Vercel Build] index.html exists at root');
  
  // Read the file
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check if we need to update the path
  if (indexContent.includes('src="src/main.tsx"')) {
    console.log('[Vercel Build] Updating src path to /src/main.tsx');
    indexContent = indexContent.replace('src="src/main.tsx"', 'src="/src/main.tsx"');
    fs.writeFileSync(indexPath, indexContent);
    console.log('[Vercel Build] Updated index.html');
  } else if (indexContent.includes('src="./src/main.tsx"')) {
    console.log('[Vercel Build] Updating src path from ./src to /src');
    indexContent = indexContent.replace('src="./src/main.tsx"', 'src="/src/main.tsx"');
    fs.writeFileSync(indexPath, indexContent);
    console.log('[Vercel Build] Updated index.html');
  } else if (indexContent.includes('src="/src/main.tsx"')) {
    console.log('[Vercel Build] index.html already has correct src path');
  } else {
    console.log('[Vercel Build] Warning: Could not find src path in index.html');
    console.log(indexContent);
  }
} else {
  console.error('[Vercel Build] Error: index.html not found at root');
}

console.log('[Vercel Build] Build script completed'); 