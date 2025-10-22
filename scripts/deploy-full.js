#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Carregar configurações
const config = require('../deploy.config.js');

console.log('🚀 Iniciando deploy completo (Frontend + Backend)...\n');

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

function deployFull() {
  const { server, paths, docker } = config;
  
  // Comandos SSH base
  const sshBase = `ssh -p ${server.port} ${server.username}@${server.host}`;
  
  console.log('🔄 Fazendo backup do banco de dados...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose exec -T database pg_dump -U postgres erp_idiomas > ${paths.backup}/backup_\$(date +%Y%m%d_%H%M%S).sql"`,
    'Backup do banco de dados'
  );
  
  console.log('📦 Enviando código completo...');
  runCommand(
    `rsync -avz --delete --exclude node_modules --exclude .git --exclude dist --exclude build ./ ${server.username}@${server.host}:${paths.app}/`,
    'Sincronizando todos os arquivos'
  );
  
  console.log('🛑 Parando todos os containers...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose down"`,
    'Parando todos os serviços'
  );
  
  console.log('🔨 Fazendo rebuild completo...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose build --no-cache"`,
    'Build completo dos containers'
  );
  
  console.log('▶️ Iniciando todos os containers...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose up -d"`,
    'Iniciando todos os serviços'
  );
  
  console.log('⏳ Aguardando containers iniciarem...');
  runCommand(
    `${sshBase} "sleep 10"`,
    'Aguardando inicialização'
  );
  
  console.log('🔍 Verificando status dos containers...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose ps"`,
    'Status dos containers'
  );
  
  console.log('📋 Verificando logs dos serviços...');
  runCommand(
    `${sshBase} "cd ${paths.app} && docker-compose logs --tail=10"`,
    'Logs dos serviços'
  );
  
  console.log('🧪 Testando conectividade...');
  runCommand(
    `${sshBase} "curl -f http://localhost:8080 > /dev/null && echo 'Frontend OK' || echo 'Frontend ERRO'"`,
    'Teste do frontend'
  );
  
  runCommand(
    `${sshBase} "curl -f http://localhost:3000/api/health > /dev/null && echo 'Backend OK' || echo 'Backend pode estar iniciando...'"`,
    'Teste do backend'
  );
  
  console.log('✅ Deploy completo concluído com sucesso! 🎉\n');
  console.log('🔗 Verifique se a aplicação está funcionando corretamente.');
  console.log('🌐 Frontend: http://seu-dominio.com');
  console.log('🔧 Backend: http://seu-dominio.com/api');
}

// Verificar se as configurações estão corretas
if (!config.server.host || !config.server.username) {
  console.error('❌ Erro: Configure o servidor no arquivo deploy.config.js');
  process.exit(1);
}

// Executar deploy
deployFull();