# 🚀 Início Rápido - PósVendas Pro

Guia de 5 minutos para colocar o sistema no ar.

---

## ✅ Sistema Já Configurado!

O sistema está **100% funcional** e pronto para uso.

---

## 📋 Passo a Passo

### 1️⃣ Iniciar Servidor

```bash
npm run dev
```

### 2️⃣ Acessar no Navegador

Abra: [http://localhost:3000](http://localhost:3000)

### 3️⃣ Fazer Login

#### Como **Administrador**:
```
E-mail: admin@posvendaspro.com
Senha: Admin@123
```

#### Como **Cliente**:
```
E-mail: cliente@exemplo.com
Senha: Cliente@123
```

---

## 🎯 O que Você Verá

### Dashboard ADMIN
- Visão geral do sistema
- Gestão de empresas
- Estatísticas globais
- Menu: Dashboard, Empresas, Usuários, Relatórios, Configurações

### Dashboard CLIENT
- Visão geral da empresa
- Reclamações (dados mockados)
- Estatísticas da empresa
- Menu: Dashboard, Reclamações, Relatórios, Integração ML, Configurações

---

## 🔧 Funcionalidades Disponíveis

✅ **Login/Logout** - Funcionando  
✅ **Criar Empresa** - Menu Empresas → Nova Empresa  
✅ **Editar Empresa** - Clique no ícone de lápis  
✅ **Visualizar Reclamações** - Dados mockados de exemplo  
✅ **Multi-tenancy** - Cada empresa vê apenas seus dados  

---

## 🎨 Testando o Sistema

### Como ADMIN:

1. Faça login com credenciais de admin
2. Clique em "Empresas" no menu
3. Clique em "Nova Empresa"
4. Preencha os dados e salve
5. Veja a empresa na listagem
6. Clique no ícone de lápis para editar

### Como CLIENT:

1. Faça logout (menu no canto superior direito)
2. Faça login com credenciais de cliente
3. Veja dashboard personalizado da empresa
4. Navegue para "Reclamações"
5. Veja dados mockados de exemplo

---

## 🐛 Problemas Comuns

### Erro ao fazer login

**Solução**: Limpe os cookies do navegador
- F12 → Application → Cookies → localhost:3000
- Delete ALL

### Página em branco

**Solução**: Verifique se o servidor está rodando
- Veja o terminal
- Execute `npm run dev` se não estiver

### Erro de banco de dados

**Solução**: Verifique a `DATABASE_URL` no `.env`
- Deve ter `?sslmode=require` no final

---

## 📚 Documentação Completa

- **README.md** - Visão geral e instalação
- **ARQUITETURA.md** - Estrutura e decisões técnicas
- **DEVELOPMENT.md** - Guia para desenvolvedores
- **COMANDOS.md** - Referência de comandos

---

## 💡 Dicas

- **Prisma Studio**: Execute `npm run prisma:studio` para ver/editar dados do banco
- **Logs**: Olhe sempre o terminal para ver queries e erros
- **Console**: Abra F12 no navegador para ver logs do cliente

---

**Divirta-se desenvolvendo! 🎉**

