
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Iniciando configuração completa do backend...');

// Verificar se o .env existe
if (!fs.existsSync('.env')) {
  console.log('❌ Arquivo .env não encontrado na raiz do projeto!');
  console.log('📝 Copie o arquivo .env.example para .env e configure as variáveis');
  process.exit(1);
}

try {
  // 1. Instalar dependências do backend
  console.log('📦 Instalando dependências do backend...');
  execSync('npm install', { stdio: 'inherit', cwd: './backend' });

  // 2. Executar setup do banco
  console.log('🗄️  Configurando banco de dados PostgreSQL...');
  execSync('node setup.js', { stdio: 'inherit', cwd: './backend' });

  // 3. Executar migrations se necessário
  console.log('🔄 Executando push do schema...');
  execSync('npm run db:push', { stdio: 'inherit', cwd: './backend' });

  console.log('✅ Backend configurado com sucesso!');
  console.log('');
  console.log('🎯 Para iniciar o backend:');
  console.log('   cd backend && npm run dev');
  console.log('');
  console.log('🌐 Servidor rodará em: http://localhost:5052');

} catch (error) {
  console.error('❌ Erro durante a configuração:', error.message);
  process.exit(1);
}
