#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Carregar configurações
const config = require('../deploy.config.js');

console.log('🚀 Iniciando deploy do backend...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`💻 Executando: ${command}\n`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Sucesso!\n');
    return output;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}\n`);
    process.exit(1);
  }
}

function deployBackend() {
  const { server, paths, docker } = config;
  
  // Comandos SSH base
  const sshBase = `ssh -p ${server.port} ${server.username}@${server.host}`;
  
  console.log('🔄 Fazendo backup do banco de dados...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose exec -T database pg_dump -U postgres erp_idiomas > ${paths.backup}/backup_\$(date +%Y%m%d_%H%M%S).sql"`,
    'Backup do banco de dados'
  );
  
  console.log('📦 Enviando código do backend...');
  runCommand(
    `rsync -avz --delete --exclude node_modules --exclude .git ./backend/ ${server.username}@${server.host}:${paths.app}/backend/`,
    'Sincronizando arquivos do backend'
  );
  
  console.log('🐳 Parando container do backend...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose stop ${docker.services.backend}"`,
    'Parando serviço backend'
  );
  
  console.log('🔨 Fazendo rebuild do backend...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose build ${docker.services.backend}"`,
    'Build do container backend'
  );
  
  console.log('▶️ Iniciando container do backend...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose up -d ${docker.services.backend}"`,
    'Iniciando serviço backend'
  );
  
  console.log('🔍 Verificando status dos containers...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose ps"`,
    'Status dos containers'
  );
  
  console.log('📋 Verificando logs do backend...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose logs --tail=20 ${docker.services.backend}"`,
    'Logs do backend'
  );
  
  console.log('✅ Deploy do backend concluído com sucesso! 🎉\n');
  console.log('🔗 Verifique se a aplicação está funcionando corretamente.');
}

// Verificar se as configurações estão corretas
if (!config.server.host || !config.server.username) {
  console.error('❌ Erro: Configure o servidor no arquivo deploy.config.js');
  process.exit(1);
}

// Executar deploy
deployBackend();