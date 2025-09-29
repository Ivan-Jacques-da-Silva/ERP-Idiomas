
#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Starting backend server...');

// Build do backend
console.log('Building backend...');
execSync('npm run build', { stdio: 'inherit' });

// Iniciar apenas o backend
console.log('Starting backend on port 5052...');
execSync('NODE_ENV=production PORT=5052 node dist/index.js', { stdio: 'inherit' });
