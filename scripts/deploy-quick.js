#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Carregar configurações
const config = require('../deploy.config.js');

console.log('⚡ Iniciando deploy rápido (sem rebuild)...\n');

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

function deployQuick() {
  const { server, paths, docker } = config;
  
  // Comandos SSH base
  const sshBase = `ssh -p ${server.port} ${server.username}@${server.host}`;
  
  console.log('📦 Enviando apenas código do backend...');
  runCommand(
    `rsync -avz --delete --exclude node_modules --exclude .git ./backend/ ${server.username}@${server.host}:${paths.app}/backend/`,
    'Sincronizando backend'
  );
  
  console.log('🔄 Reiniciando container do backend...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose restart ${docker.services.backend}"`,
    'Reiniciando backend'
  );
  
  console.log('⏳ Aguardando reinicialização...');
  runCommand(
    `${sshBase} "sleep 5"`,
    'Aguardando'
  );
  
  console.log('🔍 Verificando status...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose ps ${docker.services.backend}"`,
    'Status do backend'
  );
  
  console.log('📋 Logs recentes...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose logs --tail=10 ${docker.services.backend}"`,
    'Logs do backend'
  );
  
  console.log('⚡ Deploy rápido concluído! 🎉\n');
}

// Verificar se as configurações estão corretas
if (!config.server.host || !config.server.username) {
  console.error('❌ Erro: Configure o servidor no arquivo deploy.config.js');
  process.exit(1);
}

// Executar deploy
deployQuick();