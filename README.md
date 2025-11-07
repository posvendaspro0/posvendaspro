# PósVendas Pro

Sistema SaaS multiempresas para gestão de reclamações do Mercado Livre.

> **📚 [Ver Índice Completo de Documentação](./DOCS.md)**  
> **🚀 [Início Rápido (5 minutos)](./INICIO_RAPIDO.md)**

---

## 📋 Sobre o Projeto

O **PósVendas Pro** é uma plataforma completa que permite a gestão centralizada de reclamações do Mercado Livre para múltiplas empresas. O sistema oferece dois perfis de acesso:

- **ADMIN**: Administrador do sistema, com acesso total para gerenciar empresas e usuários
- **CLIENT**: Empresas cadastradas que visualizam e gerenciam suas próprias reclamações

## 🚀 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Autenticação**: NextAuth.js v5 (sem middleware, proteção em nível de página)
- **Banco de Dados**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Validação**: Zod + React Hook Form
- **Deploy**: Vercel (recomendado)
- **E-mail**: Brevo (preparado para integração)
- **API Externa**: Mercado Livre (preparado para integração)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Neon (PostgreSQL)

### Passo a Passo

1. **Clone o repositório** (se aplicável) ou navegue até a pasta do projeto:

```bash
cd posvendaspro
```

2. **Instale as dependências**:

```bash
npm install
```

3. **Configure as variáveis de ambiente**:

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Brevo (Email Transacional) - OPCIONAL
BREVO_API_KEY="sua-api-key-do-brevo-aqui"

# Mercado Livre API (OAuth) - OPCIONAL (para futura integração)
MERCADOLIVRE_CLIENT_ID="seu-client-id-aqui"
MERCADOLIVRE_CLIENT_SECRET="seu-client-secret-aqui"
MERCADOLIVRE_REDIRECT_URI="http://localhost:3000/api/auth/callback/mercadolivre"
```

**Importante**: 
- Gere o `NEXTAUTH_SECRET` com: `openssl rand -base64 32`
- Obtenha o `DATABASE_URL` em [console.neon.tech](https://console.neon.tech/)

4. **Execute as migrações do Prisma**:

```bash
npx prisma migrate dev
```

5. **Execute o seed para criar usuário admin**:

```bash
npm run prisma:seed
```

Isso criará:
- **Usuário ADMIN**: 
  - Email: `admin@posvendaspro.com`
  - Senha: `Admin@123`
- **Empresa de exemplo**: Empresa Exemplo
- **Usuário CLIENT de exemplo**:
  - Email: `cliente@exemplo.com`
  - Senha: `Cliente@123`

6. **Inicie o servidor de desenvolvimento**:

```bash
npm run dev
```

7. **Acesse o sistema**:

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🔑 Credenciais de Teste

Após executar o seed, você pode fazer login com:

### Administrador
- **E-mail**: admin@posvendaspro.com
- **Senha**: Admin@123

### Cliente (Empresa Exemplo)
- **E-mail**: cliente@exemplo.com
- **Senha**: Cliente@123

## 📂 Estrutura do Projeto

```
posvendaspro/
├── app/                          # Rotas e páginas (App Router)
│   ├── admin/                    # Dashboard administrativo
│   │   ├── empresas/            # CRUD de empresas
│   │   └── layout.tsx           # Layout do admin
│   ├── dashboard/               # Dashboard do cliente
│   │   ├── reclamacoes/        # Listagem de reclamações
│   │   └── layout.tsx          # Layout do cliente
│   ├── login/                   # Página de login
│   └── api/                     # API Routes
│       ├── auth/                # NextAuth endpoints
│       └── companies/           # API de empresas
├── components/                  # Componentes React
│   ├── ui/                     # Componentes shadcn/ui
│   ├── admin/                  # Componentes do admin
│   └── dashboard/              # Componentes do cliente
├── lib/                        # Utilitários e configurações
│   ├── prisma.ts              # Cliente Prisma
│   ├── auth-utils.ts          # Funções de autenticação
│   ├── validations.ts         # Schemas Zod
│   └── utils.ts               # Utilitários gerais
├── prisma/                     # Configuração Prisma
│   ├── schema.prisma          # Schema do banco
│   └── seed.ts                # Script de seed
├── services/                   # Lógica de negócio
│   ├── company-service.ts     # Serviço de empresas
│   ├── user-service.ts        # Serviço de usuários
│   ├── mercadolivre-service.ts # Integração ML (preparado)
│   └── email-service.ts       # Envio de e-mails (preparado)
├── types/                      # Definições TypeScript
│   ├── index.ts               # Tipos principais
│   └── next-auth.d.ts         # Tipos do NextAuth
└── auth.ts                     # Configuração NextAuth
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login com email e senha
- [x] Proteção de rotas por role (ADMIN/CLIENT)
- [x] Sessões seguras com JWT
- [x] Redirecionamento automático baseado em perfil

### ✅ Dashboard ADMIN
- [x] Visão geral do sistema
- [x] Listagem de empresas
- [x] Criar nova empresa
- [x] Editar empresa
- [x] Visualizar estatísticas

### ✅ Dashboard CLIENT
- [x] Visão geral de reclamações
- [x] Estatísticas por status
- [x] Listagem de reclamações (mockada)
- [x] Interface preparada para integração ML

### ✅ Infraestrutura
- [x] Banco de dados estruturado
- [x] API Routes funcionais
- [x] Validação de formulários
- [x] Componentes reutilizáveis
- [x] Layout responsivo

## 🔮 Próximos Passos

### Integração Mercado Livre
Os serviços estão preparados em `services/mercadolivre-service.ts`:

1. Implementar OAuth flow
2. Sincronização de reclamações
3. Atualização de status
4. Envio de mensagens

### Integração Brevo (E-mail)
Os serviços estão preparados em `services/email-service.ts`:

1. Configurar API key
2. Criar templates de e-mail
3. Implementar notificações automáticas
4. Relatórios periódicos

### Melhorias Futuras
- [ ] Sistema de notificações em tempo real
- [ ] Filtros avançados de reclamações
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Dashboard com gráficos
- [ ] Sistema de recuperação de senha
- [ ] Histórico de alterações
- [ ] Webhooks do Mercado Livre

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Prisma
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Executa migrações
npm run prisma:seed      # Executa seed do banco
npm run prisma:studio    # Abre Prisma Studio (GUI)

# Produção
npm run build           # Build para produção
npm start              # Inicia servidor de produção

# Qualidade de código
npm run lint           # Executa linter
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub/GitLab
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Variáveis de Ambiente (Produção)

Certifique-se de configurar todas as variáveis no painel da Vercel:
- `DATABASE_URL`
- `NEXTAUTH_URL` (sua URL de produção)
- `NEXTAUTH_SECRET`
- `BREVO_API_KEY` (quando implementado)
- `MERCADOLIVRE_CLIENT_ID` (quando implementado)
- `MERCADOLIVRE_CLIENT_SECRET` (quando implementado)

## 📖 Guia de Desenvolvimento

Para informações detalhadas sobre arquitetura, padrões e como adicionar novas features, consulte [DEVELOPMENT.md](./DEVELOPMENT.md).

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
2. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
3. Push para a branch (`git push origin feature/MinhaFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para dúvidas ou problemas:
- Consulte a documentação técnica em `DEVELOPMENT.md`
- Verifique os comentários no código
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para gestão eficiente de reclamações do Mercado Livre**
