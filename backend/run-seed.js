import { seedDatabase, verificarTabelas } from './seed-demo-users.js';

async function main() {
  try {
    console.log('🌱 Executando seed dos usuários demo...');
    
    // Verificar se as tabelas existem
    const tablesExist = await verificarTabelas();
    if (!tablesExist) {
      console.log('❌ Tabelas não encontradas. Execute primeiro:');
      console.log('   node setup.js');
      process.exit(1);
    }
    
    await seedDatabase();
    console.log('🎉 Seed executado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

main();
