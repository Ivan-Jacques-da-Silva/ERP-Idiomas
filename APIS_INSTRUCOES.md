# APIs de Validação - Sistema de Colaboradores

Este documento contém as instruções para uso das APIs de CPF e CEP implementadas no sistema.

## API de CPF - Validação Algorítmica

### Descrição
O sistema utiliza validação algorítmica de CPF implementada em JavaScript, **sem necessidade de API externa**. Isso garante:
- ✅ Validação instantânea
- ✅ Sem custos ou limites de requisições
- ✅ Funcionamento offline
- ✅ Sem dependências externas

### Como Funciona
A validação de CPF segue o algoritmo oficial da Receita Federal:
1. Remove caracteres não numéricos
2. Verifica se tem exatamente 11 dígitos
3. Verifica se não são todos dígitos iguais (ex: 111.111.111-11)
4. Calcula e valida os dois dígitos verificadores

### Implementação
A função está localizada em: `frontend/client/src/lib/cpfUtils.ts`

```typescript
validateCPF(cpf: string): boolean
```

### Uso no Formulário
- O CPF é formatado automaticamente enquanto o usuário digita
- A validação ocorre ao sair do campo (onBlur)
- Exibe mensagem de erro se o CPF for inválido
- Aceita CPF com ou sem formatação (000.000.000-00 ou 00000000000)

---

## API de CEP - ViaCEP

### Descrição
O sistema utiliza a API pública **ViaCEP** para buscar endereços automaticamente.

**URL da API**: https://viacep.com.br

### Características
- ✅ **Totalmente gratuita**
- ✅ Sem necessidade de cadastro ou chave de API
- ✅ Limite: ~300 requisições por minuto
- ✅ Resposta em JSON
- ✅ Cobertura nacional (todo o Brasil)

### Endpoint
```
GET https://viacep.com.br/ws/{cep}/json/
```

### Exemplo de Requisição
```bash
curl https://viacep.com.br/ws/01310100/json/
```

### Exemplo de Resposta
```json
{
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "complemento": "",
  "bairro": "Bela Vista",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "gia": "1004",
  "ddd": "11",
  "siafi": "7107"
}
```

### Resposta de Erro
Quando o CEP não é encontrado:
```json
{
  "erro": true
}
```

### Implementação no Sistema
A função está localizada em: `frontend/client/src/lib/cpfUtils.ts`

```typescript
fetchAddressByCEP(cep: string): Promise<{
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}>
```

### Uso no Formulário
1. Usuário digita o CEP (formatado automaticamente: 00000-000)
2. Ao sair do campo (onBlur), a API é consultada
3. Se encontrado, os campos são preenchidos automaticamente:
   - Endereço (logradouro)
   - Bairro
   - Cidade (localidade + UF)
4. Se não encontrado, exibe mensagem de erro
5. Usuário pode preencher manualmente se necessário

### Campos Preenchidos Automaticamente
- ✅ **Endereço**: Nome da rua/avenida
- ✅ **Bairro**: Nome do bairro
- ✅ **Cidade**: Cidade + Estado (ex: "São Paulo - SP")

### Campos que Precisam ser Preenchidos Manualmente
- ⚠️ **Número**: Número do imóvel
- ⚠️ **Complemento**: Apartamento, bloco, etc (opcional)

---

## Formatação Automática

O sistema implementa formatação automática para facilitar o preenchimento:

### CPF
- **Entrada**: `12345678900`
- **Saída**: `123.456.789-00`

### CEP
- **Entrada**: `01310100`
- **Saída**: `01310-100`

### Telefone/WhatsApp
- **Celular (11 dígitos)**: `(11) 98765-4321`
- **Fixo (10 dígitos)**: `(11) 3456-7890`

---

## Limitações e Boas Práticas

### ViaCEP
1. **Limite de requisições**: ~300 por minuto
   - Para aplicações de alto volume, considere implementar cache
   - O sistema já implementa debounce para evitar requisições excessivas

2. **CEPs especiais**:
   - Alguns CEPs (como de grandes empresas) podem não retornar logradouro
   - Nestes casos, permita preenchimento manual

3. **Timeout**:
   - A API geralmente responde em < 1 segundo
   - O sistema exibe um loading durante a busca

### Validação de CPF
1. **CPFs válidos mas não existentes**:
   - A validação algorítmica verifica apenas se o formato está correto
   - Não verifica se o CPF existe na Receita Federal
   - Para validação real, seria necessária integração com a Receita Federal (paga)

2. **Unicidade**:
   - O sistema impede cadastro de CPF duplicado no banco de dados
   - A validação de unicidade é feita no backend

---

## Documentação Oficial

- **ViaCEP**: https://viacep.com.br
- **Algoritmo de CPF**: https://www.geradorcpf.com/algoritmo_do_cpf.htm

---

## Notas de Implementação

### Segurança
- ✅ Validação também é feita no backend
- ✅ CPF é armazenado sem formatação no banco de dados
- ✅ Sanitização de entradas para prevenir injeção

### Performance
- ✅ Validação de CPF é instantânea (cliente)
- ✅ API de CEP responde em < 1 segundo
- ✅ Loading visual durante busca de CEP

### Acessibilidade
- ✅ Mensagens de erro claras
- ✅ Formatação automática facilita o preenchimento
- ✅ Campos obrigatórios marcados com *
