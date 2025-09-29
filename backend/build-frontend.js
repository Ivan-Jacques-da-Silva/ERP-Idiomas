
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Building frontend...');

// Build do frontend
execSync('npm run build', { stdio: 'inherit' });

// Criar estrutura de diretórios se não existir
const frontendDir = '/var/www/erp/front';
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
  console.log(`📁 Created directory: ${frontendDir}`);
}

// Copiar arquivos do build para o diretório do nginx
execSync(`cp -r dist/public/* ${frontendDir}/`, { stdio: 'inherit' });

console.log('✅ Frontend build completed and copied to /var/www/erp/front');
