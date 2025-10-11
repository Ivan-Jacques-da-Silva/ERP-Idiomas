import { storage } from './storage.js';
import { auth } from './auth.js';

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar roles fixos do sistema (idempotente - verifica se já existem)
    console.log('📝 Criando roles...');
    
    let adminRole = await storage.getRoleByName('admin');
    if (!adminRole) {
      adminRole = await storage.createRole({
        name: 'admin',
        displayName: 'Administrativo',
        description: 'Acesso total ao sistema',
        isSystemRole: true,
        isActive: true,
      });
      console.log('✅ Role admin criado');
    } else {
      console.log('✅ Role admin já existe');
    }

    let secretaryRole = await storage.getRoleByName('secretary');
    if (!secretaryRole) {
      secretaryRole = await storage.createRole({
        name: 'secretary',
        displayName: 'Secretário',
        description: 'Gestão de alunos e unidades',
        isSystemRole: true,
        isActive: true,
      });
      console.log('✅ Role secretary criado');
    } else {
      console.log('✅ Role secretary já existe');
    }

    let teacherRole = await storage.getRoleByName('teacher');
    if (!teacherRole) {
      teacherRole = await storage.createRole({
        name: 'teacher',
        displayName: 'Professor',
        description: 'Acesso a turmas e agenda',
        isSystemRole: true,
        isActive: true,
      });
      console.log('✅ Role teacher criado');
    } else {
      console.log('✅ Role teacher já existe');
    }

    let studentRole = await storage.getRoleByName('student');
    if (!studentRole) {
      studentRole = await storage.createRole({
        name: 'student',
        displayName: 'Aluno',
        description: 'Acesso à área do aluno',
        isSystemRole: true,
        isActive: true,
      });
      console.log('✅ Role student criado');
    } else {
      console.log('✅ Role student já existe');
    }

    console.log('✅ Roles verificados/criados com sucesso');

    // Criar usuário admin padrão (se não existir)
    console.log('👤 Criando usuário admin...');
    
    const existingAdmin = await storage.getUserByEmail('admin@sistema.com');
    
    if (!existingAdmin) {
      const hashedPassword = await auth.hashPassword('admin123');
      
      await storage.createUser({
        email: 'admin@sistema.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Sistema',
        roleId: adminRole.id,
        isActive: true,
      });

      console.log('✅ Usuário admin criado com sucesso');
      console.log('📧 Email: admin@sistema.com');
      console.log('🔑 Senha: admin123');
    } else {
      console.log('✅ Usuário admin já existe');
    }

    console.log('\n🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Executar seed se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };
