# 🎯 PosVendas Pro

**Sistema SaaS Multi-empresa para Gestão de Reclamações do Mercado Livre**

Sistema profissional de gerenciamento de tickets (reclamações) para empresas que vendem no Mercado Livre, com suporte multi-tenant, autenticação robusta e interface moderna.

---

## 🚀 **Tecnologias Utilizadas**

_Última atualização do README: manutenção rápida._

### **Frontend**
- ⚛️ **Next.js 15** - App Router
- 🎨 **React 19** - UI Components
- 🔷 **TypeScript** - Type Safety
- 🎭 **Tailwind CSS** - Styling
- 🧩 **shadcn/ui** - Component Library
- 📝 **React Hook Form** - Formulários
- ✅ **Zod** - Validação

### **Backend**
- 🔒 **NextAuth.js v5** - Autenticação
- 🗄️ **Prisma ORM** - Database
- 🐘 **PostgreSQL (Neon)** - Cloud Database
- 🔐 **bcryptjs** - Hash de Senhas
- 🔑 **JWT** - Token Management

### **Infraestrutura**
- ☁️ **Vercel** - Deployment & Hosting
- 🌐 **GitHub** - Version Control

---

## 📋 **Funcionalidades Principais**

### ✅ **Autenticação e Autorização**
- Login seguro com NextAuth.js v5
- Dois níveis de acesso:
  - **ADMIN**: Super administrador do sistema
  - **CLIENT**: Administrador de empresa
- Cadastro de novas empresas
- Multi-tenancy (isolamento de dados por empresa)

### ✅ **Gestão de Tickets**
- CRUD completo de tickets de reclamação
- Campos: ID, Status, Responsável, Data da Reclamação, SKU do Produto, Tipo de Problema, Observação, Data de Resolução, Custo, Afetou Reputação
- Cálculo automático do tempo de resolução
- Filtros e busca
- Interface intuitiva com tabelas responsivas

### ✅ **Gestão de Operadores**
- CRUD de operadores por empresa
- Controle de acesso e permissões
- Ativação/Desativação de contas
- Senhas criptografadas com bcrypt

### ✅ **Perfil Completo**
- Dados pessoais do usuário
- Dados da empresa (CNPJ, endereço completo)
- Alteração de senha
- Estatísticas rápidas (tickets, operadores)
- Máscara automática para WhatsApp, CEP e CNPJ
- Busca automática de endereço via ViaCEP

### 🔜 **Em Desenvolvimento**
- **Relatórios**: Análise de tendências, tempo de resolução, etc.
- **Integração Mercado Livre**: Importação automática de reclamações
- **Notificações**: Email via Brevo (transactional)

---

## 🎨 **Design System**

- **Paleta de Cores**: Neutro profissional (slate)
- **Tipografia**: Sistema otimizado para legibilidade
- **Layout**: Responsivo e acessível
- **Componentes**: shadcn/ui (Radix UI + Tailwind)
- **UX**: Feedback visual, loading states, mensagens toast

---

## 📦 **Instalação e Configuração**

### **1. Clone o Repositório**

```bash
git clone https://github.com/posvendaspro0/posvendaspro.git
cd posvendaspro
```

### **2. Instale as Dependências**

```bash
npm install
```

### **3. Configure as Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="sua_url_do_neon_postgresql"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua_chave_secreta_forte_aqui"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### **4. Configure o Banco de Dados**

```bash
# Executar migrations
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Seed inicial (cria admin)
npx prisma db seed
```

**Credenciais do Admin Padrão:**
- Email: `admin@posvendas.com`
- Senha: `Admin@123456`

### **5. Inicie o Servidor de Desenvolvimento**

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🗂️ **Estrutura do Projeto**

```
posvendaspro/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── companies/            # CRUD empresas
│   │   ├── operators/            # CRUD operadores
│   │   ├── profile/              # Atualização de perfil
│   │   ├── register/             # Cadastro
│   │   └── tickets/              # CRUD tickets
│   ├── admin/                    # Dashboard Admin
│   ├── dashboard/                # Dashboard Cliente
│   │   ├── tickets/              # Gestão de Tickets
│   │   ├── operadores/           # Gestão de Operadores
│   │   ├── perfil/               # Perfil Completo
│   │   ├── relatorios/           # (Em breve)
│   │   └── integracao/           # (Em breve)
│   ├── cadastro/                 # Página de cadastro
│   ├── login/                    # Página de login
│   └── layout.tsx                # Root layout
├── components/                   # Componentes React
│   ├── admin/                    # Componentes do Admin
│   ├── dashboard/                # Componentes do Cliente
│   └── ui/                       # shadcn/ui components
├── lib/                          # Bibliotecas e utilitários
│   ├── auth-helpers.ts           # Proteção de rotas
│   ├── auth-utils.ts             # Hash/validação senhas
│   ├── input-masks.ts            # Máscaras de input
│   ├── prisma.ts                 # Prisma Client
│   ├── utils.ts                  # Utilitários gerais
│   └── validations.ts            # Schemas Zod
├── prisma/                       # Prisma ORM
│   ├── migrations/               # Database migrations
│   ├── schema.prisma             # Schema do banco
│   └── seed.ts                   # Dados iniciais
├── services/                     # Serviços de negócio
│   ├── company-service.ts        # Lógica de empresas
│   ├── operator-service.ts       # Lógica de operadores
│   ├── ticket-service.ts         # Lógica de tickets
│   └── user-service.ts           # Lógica de usuários
├── types/                        # TypeScript types
│   ├── index.ts                  # Types gerais
│   └── next-auth.d.ts            # Types do NextAuth
├── auth.ts                       # Configuração NextAuth
├── reiniciar-servidor.bat        # Script de reinício
└── package.json                  # Dependências
```

---

## 🔐 **Segurança**

- ✅ Senhas criptografadas com bcrypt (salt rounds: 10)
- ✅ Proteção de rotas com middleware NextAuth
- ✅ Validação de dados com Zod
- ✅ SQL Injection protegido (Prisma ORM)
- ✅ CSRF Protection (NextAuth)
- ✅ Multi-tenancy com isolamento de dados
- ✅ Variáveis de ambiente para segredos

---

## 📊 **Banco de Dados**

### **Models:**
- `User` - Usuários do sistema
- `Company` - Empresas cadastradas
- `MlAccount` - Contas Mercado Livre (futuro)
- `Ticket` - Tickets de reclamação
- `Operator` - Operadores por empresa

### **Relações:**
- Um `User` pertence a uma `Company`
- Uma `Company` possui vários `Users`, `Operators`, `Tickets` e `MlAccounts`
- Cascade delete para manter integridade referencial

---

## 🛠️ **Comandos Úteis**

```bash
# Desenvolvimento
npm run dev                    # Inicia servidor dev

# Build
npm run build                  # Build para produção
npm start                      # Inicia servidor prod

# Database
npx prisma studio              # Interface gráfica do DB
npx prisma migrate dev         # Criar/aplicar migration
npx prisma generate            # Gerar Prisma Client
npx prisma db seed             # Popular banco

# Reinício completo (Windows)
./reiniciar-servidor.bat       # Limpa cache e reinicia

# Git
git add .
git commit -m "mensagem"
git push origin main
```

---

## 🌐 **Deploy**

### **Vercel (Recomendado)**

1. **Conecte o repositório GitHub à Vercel**
2. **Configure as variáveis de ambiente:**
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (URL de produção)
   - `NEXTAUTH_SECRET`
3. **Deploy automático** a cada push na branch `main`

---

## 📝 **Convenções de Código**

- **Components**: PascalCase (`TicketForm.tsx`)
- **Files**: kebab-case (`ticket-service.ts`)
- **Functions**: camelCase (`createTicket()`)
- **Types/Interfaces**: PascalCase (`TicketInput`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TICKETS`)
- **Commits**: Conventional Commits
  - `feat:` - Nova funcionalidade
  - `fix:` - Correção de bug
  - `refactor:` - Refatoração
  - `docs:` - Documentação
  - `style:` - Formatação
  - `chore:` - Tarefas de manutenção

---

## 🤝 **Contribuindo**

Este é um projeto privado. Para contribuir:

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

---

## 📄 **Licença**

Proprietary - Todos os direitos reservados © 2024 PosVendas Pro

---

## 👨‍💻 **Suporte**

Para dúvidas ou problemas, entre em contato:
- **Email**: suporte@posvendaspro.com
- **GitHub Issues**: https://github.com/posvendaspro0/posvendaspro/issues

---

## 🎉 **Status do Projeto**

✅ **MVP Completo e Funcional**

Próximas Releases:
- 📊 Sistema de Relatórios
- 🔗 Integração Mercado Livre API
- 📧 Notificações por Email (Brevo)
- 📱 App Mobile (React Native)

---

**Desenvolvido com ❤️ usando Next.js e React**
