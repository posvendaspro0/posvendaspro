# 🔧 Troubleshooting - PósVendas Pro

Soluções para problemas comuns.

---

## 🔐 Problemas de Login

### ❌ "E-mail ou senha incorretos"

**Causa**: Credenciais erradas

**Solução**:
```
Admin: admin@posvendaspro.com / Admin@123
Cliente: cliente@exemplo.com / Cliente@123
```

### ❌ Loop de redirecionamentos

**Causa**: Cookies antigos com secret diferente

**Solução**:
1. F12 → Application → Cookies → localhost:3000
2. Delete ALL
3. Ctrl + Shift + R
4. Faça login novamente

### ❌ Não redireciona após login

**Causa**: Cache do navegador

**Solução**:
1. Feche TODAS as abas do localhost:3000
2. Feche o navegador completamente
3. Abra novamente
4. Acesse http://localhost:3000

---

## 💾 Problemas de Banco de Dados

### ❌ "Can't reach database server"

**Causa**: DATABASE_URL inválida ou Neon offline

**Solução**:
1. Verifique o `.env`
2. Confirme que tem `?sslmode=require` no final
3. Teste conexão: `npm run prisma:studio`

### ❌ "Table does not exist"

**Causa**: Migrations não foram aplicadas

**Solução**:
```bash
npm run prisma:migrate
```

### ❌ "Unique constraint failed"

**Causa**: Tentando criar registro duplicado

**Solução**:
- Verifique emails e CNPJs únicos
- Use Prisma Studio para ver dados existentes

---

## 🚀 Problemas do Servidor

### ❌ Servidor não inicia

**Causa**: Porta 3000 já em uso

**Solução**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número_do_pid] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### ❌ "Module not found"

**Causa**: Dependências não instaladas

**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erro de compilação TypeScript

**Causa**: Tipos não gerados

**Solução**:
```bash
npm run prisma:generate
```

---

## 🎨 Problemas de UI

### ❌ Estilos não carregam

**Causa**: Tailwind não compilou

**Solução**:
```bash
# Limpar cache
rm -rf .next
npm run dev
```

### ❌ Componente shadcn/ui não funciona

**Causa**: Componente não instalado

**Solução**:
```bash
npx shadcn@latest add nome-do-componente
```

---

## 🔑 Problemas de Variáveis de Ambiente

### ❌ "NEXTAUTH_SECRET must be provided"

**Causa**: `.env` não configurado

**Solução**:
```bash
# Gerar secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copiar para .env
NEXTAUTH_SECRET="resultado-aqui"
```

### ❌ Variáveis não carregam

**Causa**: Servidor não foi reiniciado

**Solução**:
1. Ctrl + C (parar servidor)
2. `npm run dev` (reiniciar)

---

## 🐛 Debugging

### Ver Queries do Prisma

`lib/prisma.ts` já está configurado para mostrar queries em desenvolvimento.

Você verá no terminal:
```
prisma:query SELECT * FROM users WHERE ...
```

### Ver Sessões do NextAuth

Acesse:
```
http://localhost:3000/api/auth/session
```

Retorna JSON com a sessão atual.

### Ver Dados do Banco

```bash
npm run prisma:studio
```

Abre GUI em [http://localhost:5555](http://localhost:5555)

---

## 🧹 Limpeza Total (Reset Completo)

Se nada funcionar, reset completo:

```bash
# 1. Parar servidor (Ctrl + C)

# 2. Limpar tudo
rm -rf .next node_modules package-lock.json

# 3. Reinstalar
npm install

# 4. Regerar Prisma
npm run prisma:generate

# 5. Limpar cookies do navegador
# F12 → Application → Clear storage → Clear site data

# 6. Reiniciar
npm run dev
```

---

## 📞 Precisa de Mais Ajuda?

1. ✅ Consulte [DOCS.md](./DOCS.md) - Índice de toda documentação
2. ✅ Leia [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia técnico
3. ✅ Veja comentários no código fonte
4. ✅ Use `console.log()` para debug
5. ✅ Verifique logs do terminal

---

## ✅ Checklist Básico

Antes de reportar um problema, verifique:

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Cookies limpos no navegador
- [ ] Migrations aplicadas (`npm run prisma:migrate`)
- [ ] Seed executado (`npm run prisma:seed`)
- [ ] Navegador atualizado (Ctrl + Shift + R)
- [ ] Console do navegador sem erros (F12)
- [ ] Terminal sem erros em vermelho

---

**A maioria dos problemas se resolve limpando cookies! 🍪**

