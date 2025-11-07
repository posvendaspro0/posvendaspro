# Comandos Úteis - PósVendas Pro

Referência rápida dos comandos mais usados no projeto.

## 🚀 Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linter
npm run lint
```

## 🗄️ Banco de Dados (Prisma)

```bash
# Gerar Prisma Client (após mudanças no schema)
npm run prisma:generate

# Criar e aplicar migrations (desenvolvimento)
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations (produção)
npx prisma migrate deploy

# Executar seed (criar usuários de teste)
npm run prisma:seed

# Abrir Prisma Studio (GUI para visualizar/editar banco)
npm run prisma:studio

# Resetar banco completamente (⚠️ CUIDADO!)
npx prisma migrate reset
```

## 📊 Prisma Studio

```bash
# Abrir interface gráfica do banco
npm run prisma:studio
```

Acesse: [http://localhost:5555](http://localhost:5555)

## 🔧 Quando Usar Cada Comando

### Após clonar o projeto
```bash
npm install
# Configure .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Após alterar schema.prisma
```bash
npm run prisma:generate
npx prisma migrate dev --name descricao_mudanca
```

### Para visualizar dados do banco
```bash
npm run prisma:studio
```

### Deploy para produção
```bash
npm run build
# No servidor:
npx prisma migrate deploy
npm start
```

## 🎯 Comandos Específicos do Projeto

### Criar nova empresa (via Prisma Studio)
1. `npm run prisma:studio`
2. Navegue até "Company"
3. Clique em "Add record"
4. Preencha os dados e salve

### Criar novo usuário ADMIN
```bash
# Via Prisma Studio ou adicione ao seed.ts
npm run prisma:studio
```

### Resetar senha de usuário

Via Prisma Studio:
1. `npm run prisma:studio`
2. Navegue até "User"
3. Encontre o usuário
4. Gere um novo hash: `bcrypt.hash('novaSenha', 10)`
5. Cole no campo `passwordHash`

## 🔐 Gerar Hash de Senha

Execute no Node:

```javascript
// No terminal Node
const bcrypt = require('bcryptjs');
bcrypt.hash('MinhaNovaSenh@123', 10).then(console.log);
```

Ou crie um script `hash-password.ts`:

```typescript
// scripts/hash-password.ts
import * as bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Uso: tsx scripts/hash-password.ts "senha"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Hash:', hash);
});
```

Execute:
```bash
tsx scripts/hash-password.ts "MinhaSenh@123"
```

## 🌐 URLs Úteis

- **App Local**: [http://localhost:3000](http://localhost:3000)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555)
- **Neon Console**: [console.neon.tech](https://console.neon.tech/)
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

## 📦 Adicionar Componentes shadcn/ui

```bash
# Listar componentes disponíveis
npx shadcn@latest add

# Adicionar componente específico
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table

# Adicionar múltiplos componentes
npx shadcn@latest add button dialog table -y
```

## 🔍 Debug

### Ver queries do Prisma
Edite `lib/prisma.ts` e adicione:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Modo debug NextAuth
Adicione ao `.env`:
```env
NEXTAUTH_DEBUG=true
```

### Verificar rotas
```bash
# Ver todas as rotas do Next.js
npm run build
# Veja o output das rotas geradas
```

## 🧹 Limpeza

```bash
# Limpar cache do Next.js
rm -rf .next

# Limpar node_modules
rm -rf node_modules
npm install

# Limpar tudo e reinstalar
rm -rf node_modules .next
npm install
npm run dev
```

## 📝 Git

```bash
# Primeiro commit
git add .
git commit -m "feat: setup inicial do projeto"

# Commits semânticos
git commit -m "feat: adiciona funcionalidade X"
git commit -m "fix: corrige bug Y"
git commit -m "docs: atualiza README"
git commit -m "refactor: melhora código Z"
git commit -m "style: formata código"
git commit -m "test: adiciona teste para X"
```

## 🚀 Deploy Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

---

**💡 Dica**: Adicione este arquivo aos seus bookmarks para referência rápida!

