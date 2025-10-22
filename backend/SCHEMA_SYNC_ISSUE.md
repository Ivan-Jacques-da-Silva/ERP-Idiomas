# Problema de Sincronização entre Migrações e Setup.js

## Problema Identificado

O projeto possui dois sistemas conflitantes para gerenciamento de schema do banco de dados:

1. **Drizzle Migrations** (`/migrations/0000_stormy_chameleon.sql`)
2. **Setup Manual** (`setup.js`)

## Inconsistências Encontradas

### 1. Tabela `roles`
- **Migração**: Inclui coluna `is_deletable BOOLEAN DEFAULT true NOT NULL`
- **Setup.js**: Coluna `is_deletable` estava ausente (CORRIGIDO)

### 2. Tabela `users`
- **Migração**: Não possui coluna `role` legada, apenas `role_id`
- **Setup.js**: Possuía coluna `role user_role DEFAULT 'student'` desnecessária (CORRIGIDO)

### 3. Tabela `permissions`
- **Migração**: Não possui coluna `category`
- **Setup.js**: Possuía coluna `category VARCHAR NOT NULL` duplicada (CORRIGIDO)

## Correções Aplicadas

### setup.js - Linha 124-135 (tabela roles)
```sql
-- ANTES
CREATE TABLE IF NOT EXISTS roles (
  -- ... outras colunas ...
  is_active BOOLEAN DEFAULT true,
  -- is_deletable estava ausente
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DEPOIS
CREATE TABLE IF NOT EXISTS roles (
  -- ... outras colunas ...
  is_active BOOLEAN DEFAULT true,
  is_deletable BOOLEAN DEFAULT true NOT NULL,  -- ADICIONADO
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### setup.js - Linha 136-149 (tabela users)
```sql
-- ANTES
CREATE TABLE IF NOT EXISTS users (
  -- ... outras colunas ...
  role user_role DEFAULT 'student',  -- REMOVIDO
  role_id VARCHAR REFERENCES roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  -- ... outras colunas ...
);

-- DEPOIS
CREATE TABLE IF NOT EXISTS users (
  -- ... outras colunas ...
  role_id VARCHAR NOT NULL REFERENCES roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  -- ... outras colunas ...
);
```

### setup.js - Linha 112-121 (tabela permissions)
```sql
-- ANTES
CREATE TABLE IF NOT EXISTS permissions (
  -- ... outras colunas ...
  category_id VARCHAR REFERENCES permission_categories(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR NOT NULL,  -- REMOVIDO
  is_active BOOLEAN DEFAULT true,
  -- ... outras colunas ...
);

-- DEPOIS
CREATE TABLE IF NOT EXISTS permissions (
  -- ... outras colunas ...
  category_id VARCHAR REFERENCES permission_categories(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  -- ... outras colunas ...
);
```

## Teste de Validação

Após as correções:
1. ✅ Setup.js executa sem erros
2. ✅ Coluna `is_deletable` criada corretamente na tabela `roles`
3. ✅ API `/api/roles` retorna dados com `isDeletable: true`
4. ✅ Login e autenticação funcionam normalmente

## Recomendações para o Futuro

### Opção 1: Usar apenas Drizzle (Recomendado)
```bash
# Aplicar migrações automaticamente
npx drizzle-kit push
# ou
npx drizzle-kit migrate
```

### Opção 2: Manter setup.js sincronizado
- Sempre que alterar migrações, atualizar setup.js
- Implementar testes automatizados para verificar sincronização
- Considerar gerar setup.js automaticamente a partir das migrações

## Data da Correção
22/10/2025 - Todas as inconsistências identificadas foram corrigidas e testadas.