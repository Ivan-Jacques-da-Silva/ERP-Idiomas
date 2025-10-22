// Configuração de deploy para o servidor
module.exports = {
  server: {
    host: 'erp.vision.dev.br',     // Seu servidor
    username: 'root',              // Usuário SSH (ou seu usuário)
    port: 22,
    privateKey: '~/.ssh/id_rsa'    // Caminho para sua chave SSH
  },
  paths: {
    app: '/root/erp',              // Pasta onde está seu projeto no servidor
    backup: '/opt/backups/erp-idiomas'
  },
  // Configuração específica para sua estrutura atual
  structure: {
    frontend: 'front',             // Sua pasta frontend
    backend: 'back'                // Sua pasta backend
  },
  
  // Configurações do Docker
  docker: {
    composeFile: 'docker-compose.yml',
    services: {
      backend: 'backend',
      frontend: 'frontend',
      database: 'database'
    }
  },
  
  // Configurações de backup
  backup: {
    enabled: true,
    keepDays: 7, // manter backups por 7 dias
  }
};