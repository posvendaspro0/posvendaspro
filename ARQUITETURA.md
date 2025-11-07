# Arquitetura do Sistema - PósVendas Pro

## 📐 Visão Geral

Sistema SaaS multiempresas para gestão de reclamações do Mercado Livre, construído com Next.js 16 (App Router) e NextAuth.js v5.

---

## 🏗️ Estrutura de Pastas

```
posvendaspro/
├── app/                        # Rotas e páginas (Next.js App Router)
│   ├── admin/                  # Dashboard ADMIN (protegido)
│   │   ├── empresas/          # Gestão de empresas
│   │   ├── layout.tsx         # Layout com sidebar/topbar
│   │   └── page.tsx           # Dashboard principal
│   ├── dashboard/             # Dashboard CLIENT (protegido)
│   │   ├── reclamacoes/      # Listagem de reclamações
│   │   ├── layout.tsx        # Layout com sidebar/topbar
│   │   └── page.tsx          # Dashboard principal
│   ├── login/                # Página pública de login
│   ├── api/                  # API Routes
│   │   ├── auth/[...nextauth]/ # Endpoints NextAuth
│   │   └── companies/        # CRUD de empresas
│   ├── layout.tsx            # Layout raiz
│   └── page.tsx              # Página inicial (redirect)
│
├── components/                # Componentes React
│   ├── ui/                   # shadcn/ui (base)
│   ├── admin/                # Componentes ADMIN
│   └── dashboard/            # Componentes CLIENT
│
├── lib/                      # Utilitários e configurações
│   ├── auth-helpers.ts      # Helpers de autenticação
│   ├── auth-utils.ts        # Hash de senhas
│   ├── prisma.ts            # Cliente Prisma
│   ├── validations.ts       # Schemas Zod
│   └── utils.ts             # Utilitários gerais
│
├── prisma/                   # Banco de dados
│   ├── schema.prisma        # Modelagem
│   ├── seed.ts              # Dados iniciais
│   └── migrations/          # Histórico de migrações
│
├── services/                 # Lógica de negócio
│   ├── company-service.ts   # CRUD empresas
│   ├── user-service.ts      # CRUD usuários
│   ├── mercadolivre-service.ts  # Integração ML (preparado)
│   └── email-service.ts     # E-mails (preparado)
│
├── types/                    # TypeScript
│   ├── index.ts             # Tipos principais
│   └── next-auth.d.ts       # Extensão NextAuth
│
└── auth.ts                   # Configuração NextAuth
```

---

## 🔐 Autenticação

### Fluxo de Login

```
1. Usuário acessa / 
   ↓
2. Redireciona para /login (se não autenticado)
   ↓
3. Preenche credenciais e submete
   ↓
4. NextAuth valida com banco (Prisma)
   ↓
5. Se válido: cria JWT e cookie de sessão
   ↓
6. Redireciona para /
   ↓
7. / detecta role e redireciona:
   - ADMIN → /admin
   - CLIENT → /dashboard
```

### Proteção de Rotas

**Sem middleware** - Cada página se protege usando helpers:

```typescript
// app/admin/page.tsx
export default async function AdminPage() {
  await requireAdmin(); // Redireciona se não for ADMIN
  // ...código da página
}
```

---

## 🗄️ Banco de Dados

### Modelos Principais

1. **User** - Usuários do sistema
   - Vinculados a uma Company (CLIENT) ou null (ADMIN)
   - Senha hasheada com bcrypt
   
2. **Company** - Empresas/Clientes
   - Podem ter múltiplos usuários
   - Terão contas do Mercado Livre vinculadas

3. **Complaint** - Reclamações (preparado)
   - Sincronizadas da API do Mercado Livre
   - Filtradas por company

4. **MlAccount** - Contas ML (preparado)
   - Tokens OAuth para API do Mercado Livre
   - Uma por company

### Relacionamentos

```
Company 1 ──── N User
Company 1 ──── N MlAccount  
Company 1 ──── N Complaint
```

---

## 🎨 Componentes UI

### shadcn/ui

Componentes **copiados para o projeto** (não é biblioteca):
- Total controle e customização
- Sem dependências externas pesadas
- Acessibilidade built-in

### Padrão de Uso

**Server Components** (padrão):
- Busca dados diretamente no servidor
- Melhor performance
- SEO-friendly

**Client Components** (`'use client'`):
- Para interatividade (useState, onClick, etc)
- Formulários
- Navegação dinâmica

---

## 🔌 Integrações Futuras

### 1. Mercado Livre API

**Arquivo**: `services/mercadolivre-service.ts`

**Implementar**:
- OAuth 2.0 flow
- Sincronização de reclamações
- Atualização de status
- Envio de mensagens

**Variáveis necessárias** (.env):
```
MERCADOLIVRE_CLIENT_ID
MERCADOLIVRE_CLIENT_SECRET
MERCADOLIVRE_REDIRECT_URI
```

### 2. Brevo (E-mail)

**Arquivo**: `services/email-service.ts`

**Implementar**:
- Boas-vindas
- Recuperação de senha
- Notificações de reclamações
- Relatórios semanais

**Variável necessária** (.env):
```
BREVO_API_KEY
```

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                  # Servidor local

# Banco de dados
npm run prisma:migrate       # Aplicar migrations
npm run prisma:seed          # Criar dados de teste
npm run prisma:studio        # GUI do banco

# Produção
npm run build               # Build otimizado
npm start                   # Servidor produção
```

---

## 📊 Decisões de Arquitetura

### Por que sem Middleware?

✅ **Mais simples** - Cada página controla sua própria proteção  
✅ **Menos erros** - Sem conflitos de JWT/cookies  
✅ **Mais flexível** - Fácil customizar proteção por página  
✅ **Melhor debug** - Erros mais claros  

### Por que Helpers?

✅ **Reutilizável** - `requireAdmin()` em qualquer página  
✅ **Type-safe** - TypeScript garante tipos corretos  
✅ **DRY** - Não repetir código de verificação  
✅ **Manutenível** - Mudar lógica em um só lugar  

---

## 🎯 Arquitetura em Camadas

```
┌─────────────────────────────────────┐
│  Presentation (Pages/Components)    │
│  - app/admin/*                      │
│  - app/dashboard/*                  │
│  - components/*                     │
├─────────────────────────────────────┤
│  API Layer (Route Handlers)         │
│  - app/api/*                        │
├─────────────────────────────────────┤
│  Business Logic (Services)          │
│  - services/*                       │
├─────────────────────────────────────┤
│  Data Access (Prisma + Validation)  │
│  - lib/prisma.ts                    │
│  - lib/validations.ts               │
└─────────────────────────────────────┘
```

---

## ✅ Próximos Passos de Desenvolvimento

1. **Implementar integração com Mercado Livre**
   - OAuth flow
   - Sincronização de reclamações
   - Webhooks para atualizações em tempo real

2. **Implementar sistema de e-mails**
   - Templates no Brevo
   - Notificações automáticas
   - Relatórios periódicos

3. **Adicionar recursos avançados**
   - Filtros de reclamações
   - Exportação de relatórios
   - Gráficos e analytics
   - Sistema de recuperação de senha

4. **Melhorias de UX**
   - Loading states
   - Skeleton loaders
   - Toasts de notificação
   - Confirmações de ações

---

**Sistema robusto, limpo e pronto para escalar!** 🚀

