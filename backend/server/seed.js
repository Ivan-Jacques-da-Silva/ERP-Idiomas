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
                isDeletable: false, // Cargo fixo, não pode ser excluído
            });
            console.log('✅ Role admin criado');
        }
        else {
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
                isDeletable: false, // Cargo fixo, não pode ser excluído
            });
            console.log('✅ Role secretary criado');
        }
        else {
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
                isDeletable: false, // Cargo fixo, não pode ser excluído
            });
            console.log('✅ Role teacher criado');
        }
        else {
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
                isDeletable: false, // Cargo fixo, não pode ser excluído
            });
            console.log('✅ Role student criado');
        }
        else {
            console.log('✅ Role student já existe');
        }
        console.log('✅ Roles verificados/criados com sucesso');
        // Criar usuário admin padrão (se não existir)
        console.log('👤 Criando usuário admin...');
        // Criar permissões e categorias padrão
        console.log('🔐 Criando categorias e permissões padrão...');
        // Helper para obter/ criar categoria por nome
        const allCategories = await storage.getPermissionCategories();
        async function ensureCategory(name, displayName, description) {
            const found = allCategories.find(c => c.name === name);
            return found || await storage.createPermissionCategory({ name, displayName, description, isSystemCategory: true, isActive: true });
        }
        const catModules = await ensureCategory('modules', 'Módulos', 'Permissões por módulo');
        const catAdmin = await ensureCategory('admin', 'Administração', 'Permissões administrativas');
        // Helper para obter/ criar permissão por nome
        const allPerms = await storage.getPermissions();
        async function ensurePermission(name, displayName, description, categoryId) {
            const found = allPerms.find(p => p.name === name);
            return found || await storage.createPermission({ name, displayName, description, categoryId, isActive: true });
        }
        const pUnitsRead = await ensurePermission('units:read', 'Ler Unidades', 'Visualizar unidades', catModules.id);
        const pUnitsWrite = await ensurePermission('units:write', 'Gerir Unidades', 'Criar/editar/excluir unidades', catModules.id);
        const pStaffRead = await ensurePermission('staff:read', 'Ler Colaboradores', 'Visualizar colaboradores', catModules.id);
        const pStaffWrite = await ensurePermission('staff:write', 'Gerir Colaboradores', 'Criar/editar/excluir colaboradores', catModules.id);
        const pStudentsRead = await ensurePermission('students:read', 'Ler Alunos', 'Visualizar alunos', catModules.id);
        const pStudentsWrite = await ensurePermission('students:write', 'Gerir Alunos', 'Criar/editar/excluir alunos', catModules.id);
        const pCoursesRead = await ensurePermission('courses:read', 'Ler Cursos', 'Visualizar cursos', catModules.id);
        const pCoursesWrite = await ensurePermission('courses:write', 'Gerir Cursos', 'Criar/editar/excluir cursos', catModules.id);
        const pBooksRead = await ensurePermission('books:read', 'Ler Livros', 'Visualizar livros', catModules.id);
        const pBooksWrite = await ensurePermission('books:write', 'Gerir Livros', 'Criar/editar/excluir livros', catModules.id);
        const pClassesRead = await ensurePermission('classes:read', 'Ler Turmas', 'Visualizar turmas', catModules.id);
        const pClassesWrite = await ensurePermission('classes:write', 'Gerir Turmas', 'Criar/editar/excluir turmas', catModules.id);
        const pLessonsRead = await ensurePermission('lessons:read', 'Ler Aulas', 'Visualizar aulas', catModules.id);
        const pLessonsWrite = await ensurePermission('lessons:write', 'Gerir Aulas', 'Criar/editar/excluir aulas', catModules.id);
        const pFinanceRead = await ensurePermission('finance:read', 'Ler Financeiro', 'Visualizar área financeira', catModules.id);
        const pFinanceWrite = await ensurePermission('finance:write', 'Gerir Financeiro', 'Operações no financeiro', catModules.id);
        const pDashboardRead = await ensurePermission('dashboard:read', 'Ler Dashboard', 'Visualizar dashboard', catModules.id);
        const pSettingsRead = await ensurePermission('settings:read', 'Ler Configurações', 'Visualizar configurações', catAdmin.id);
        const pSupportRead = await ensurePermission('support:read', 'Ler Suporte', 'Visualizar suporte', catModules.id);
        const pPermissionsManage = await ensurePermission('permissions:manage', 'Gerir Permissões', 'Gerenciar roles e permissões', catAdmin.id);
        // Atribuir permissões por role
        console.log('🧩 Atribuindo permissões às roles...');
        if (adminRole?.id) {
            await storage.updateRolePermissions(adminRole.id, [
                pDashboardRead.id,
                pUnitsRead.id, pUnitsWrite.id,
                pStaffRead.id, pStaffWrite.id,
                pStudentsRead.id, pStudentsWrite.id,
                pCoursesRead.id, pCoursesWrite.id,
                pBooksRead.id, pBooksWrite.id,
                pClassesRead.id, pClassesWrite.id,
                pLessonsRead.id, pLessonsWrite.id,
                pFinanceRead.id, pFinanceWrite.id,
                pSettingsRead.id,
                pSupportRead.id,
                pPermissionsManage.id,
            ]);
        }
        if (secretaryRole?.id) {
            await storage.updateRolePermissions(secretaryRole.id, [
                pDashboardRead.id,
                pStaffRead.id, pStaffWrite.id,
                pStudentsRead.id, pStudentsWrite.id,
                pCoursesRead.id, pCoursesWrite.id,
                pBooksRead.id,
                pClassesRead.id, pClassesWrite.id,
                pLessonsRead.id, pLessonsWrite.id,
                pFinanceRead.id, pFinanceWrite.id,
                pSupportRead.id,
            ]);
        }
        if (teacherRole?.id) {
            await storage.updateRolePermissions(teacherRole.id, [
                pDashboardRead.id,
                pClassesRead.id,
                pLessonsRead.id,
                pSupportRead.id,
            ]);
        }
        if (studentRole?.id) {
            await storage.updateRolePermissions(studentRole.id, [
                pLessonsRead.id,
                pSupportRead.id,
            ]);
        }
        console.log('✅ Permissões padrão criadas/atribuídas');
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
        }
        else {
            console.log('✅ Usuário admin já existe');
        }
        // Criar páginas do sistema
        console.log('📄 Criando páginas do sistema...');
        const pages = [
            { name: 'dashboard', displayName: 'Dashboard', description: 'Página inicial do sistema', route: '/dashboard' },
            { name: 'units', displayName: 'Unidades', description: 'Gestão de unidades/filiais', route: '/units' },
            { name: 'staff', displayName: 'Colaboradores', description: 'Gestão de colaboradores', route: '/staff' },
            { name: 'students', displayName: 'Alunos', description: 'Gestão de alunos', route: '/students' },
            { name: 'courses', displayName: 'Cursos', description: 'Gestão de cursos', route: '/courses' },
            { name: 'classes', displayName: 'Turmas', description: 'Gestão de turmas', route: '/classes' },
            { name: 'schedule', displayName: 'Agenda', description: 'Agenda de aulas', route: '/schedule' },
            { name: 'financial', displayName: 'Financeiro', description: 'Gestão financeira', route: '/financial' },
            { name: 'support', displayName: 'Suporte', description: 'Central de suporte', route: '/support' },
            { name: 'settings', displayName: 'Configurações', description: 'Configurações do sistema', route: '/settings' },
            { name: 'permissions', displayName: 'Permissões', description: 'Gestão de permissões', route: '/permissions' },
        ];
        for (const pageData of pages) {
            let page = await storage.getPageByName(pageData.name);
            if (!page) {
                page = await storage.createPage(pageData);
                console.log(`✅ Página ${pageData.name} criada`);
            }
            else {
                console.log(`✅ Página ${pageData.name} já existe`);
            }
        }
        // Criar permissões padrão para admin (acesso a todas as páginas)
        console.log('🔐 Configurando permissões padrão...');
        const allPages = await storage.getPages();
        for (const page of allPages) {
            const existingPermission = await storage.getRolePagePermission(adminRole.id, page.id);
            if (!existingPermission) {
                await storage.createRolePagePermission({
                    roleId: adminRole.id,
                    pageId: page.id,
                    canAccess: true,
                });
                console.log(`✅ Permissão admin para ${page.name} criada`);
            }
        }
        console.log('\n🎉 Seed concluído com sucesso!');
    }
    catch (error) {
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
