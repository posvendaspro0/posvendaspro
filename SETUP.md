# Instruções de Setup - PósVendas Pro

## ✅ Sistema Configurado e Funcionando!

O sistema está **PRONTO e FUNCIONAL**. Siga estes passos simples para começar:

## 🚀 Início Rápido

### 1. Iniciar o Servidor

```bash
npm run dev
```

### 2. Acessar o Sistema

Abra [http://localhost:3000](http://localhost:3000) no navegador

### 3. Fazer Login

Use uma das credenciais de teste criadas:

#### **Administrador**
- **E-mail**: `admin@posvendaspro.com`
- **Senha**: `Admin@123`
- **Acesso**: Gestão completa de empresas e usuários

#### **Cliente (Empresa Exemplo)**
- **E-mail**: `cliente@exemplo.com`
- **Senha**: `Cliente@123`
- **Acesso**: Dashboard com reclamações da empresa

---

## ⚙️ Configuração Já Realizada

✅ Banco de dados Neon conectado  
✅ Migrações aplicadas  
✅ Usuários de teste criados (seed executado)  
✅ NextAuth configurado  
✅ Servidor rodando  

---

## 🔐 Primeiro Acesso

⚠️ **IMPORTANTE**: Após o primeiro login, **altere as senhas padrão**!

---

## 🚀 Próximos Passos (Opcional)

### Configurar Brevo (E-mail)

1. Crie uma conta em [app.brevo.com](https://app.brevo.com/)
2. Gere uma API key em Settings > API Keys
3. Adicione no `.env`:

```env
BREVO_API_KEY="sua-api-key-aqui"
```

### Configurar Mercado Livre API

1. Acesse [developers.mercadolivre.com.br](https://developers.mercadolivre.com.br/)
2. Crie uma aplicação
3. Copie Client ID e Client Secret
4. Adicione no `.env`:

```env
MERCADOLIVRE_CLIENT_ID="seu-client-id"
MERCADOLIVRE_CLIENT_SECRET="seu-client-secret"
MERCADOLIVRE_REDIRECT_URI="http://localhost:3000/api/auth/callback/mercadolivre"
```

## 🐛 Problemas Comuns

### Erro: "Can't reach database server"

- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o Neon está acessível
- Verifique se tem `?sslmode=require` no final da URL

### Erro: "NEXTAUTH_SECRET must be provided"

- Execute `openssl rand -base64 32` para gerar
- Adicione ao `.env`

### Erro ao executar seed

- Execute `npm run prisma:generate` primeiro
- Verifique se as migrations foram aplicadas
- Veja os logs para detalhes do erro

## 📚 Documentação

- **README.md**: Visão geral do projeto
- **DEVELOPMENT.md**: Guia técnico detalhado
- **SETUP.md**: Este arquivo (instruções de configuração)

## 🆘 Precisa de Ajuda?

1. Verifique a documentação completa no README.md
2. Consulte o DEVELOPMENT.md para detalhes técnicos
3. Leia os comentários no código fonte
4. Verifique os logs de erro no terminal

---

**Depois de configurar tudo, delete este arquivo ou mantenha para referência futura.**

