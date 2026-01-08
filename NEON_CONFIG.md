# Configuração do Neon para Vercel Deploy

## 🚨 Problema Atual

```
Error: P1002 - Timed out trying to acquire postgres advisory lock
```

**Causa:** Neon usa connection pooling (PgBouncer), mas Prisma migrations precisam de conexão direta.

---

## ✅ Solução

### 1. Obter URLs de Conexão do Neon

No dashboard do Neon (https://neon.tech):

1. Vá no seu projeto
2. Clique em **"Connection Details"**
3. Você verá **2 tipos** de connection string:

#### **a) Pooled Connection (Padrão)**
```
postgresql://user:pass@ep-xxx-pooler.sa-east-1.aws.neon.tech/neondb?pgbouncer=true
```
☝️ Tem `-pooler` no hostname e `?pgbouncer=true` no final

#### **b) Direct Connection**
```
postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb
```
☝️ SEM `-pooler` no hostname e SEM `?pgbouncer=true`

---

### 2. Configurar Variáveis de Ambiente

#### **No arquivo `.env` (local):**
```bash
# Pooled (para queries normais)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.sa-east-1.aws.neon.tech/neondb?pgbouncer=true"

# Direct (para migrations)
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb"
```

#### **No Vercel (produção):**

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione:

```
Name: DATABASE_URL
Value: postgresql://user:pass@ep-xxx-pooler.sa-east-1.aws.neon.tech/neondb?pgbouncer=true

Name: DIRECT_DATABASE_URL
Value: postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb
```

3. **Marque:** ✅ Production, ✅ Preview, ✅ Development
4. Clique em **"Save"**

---

### 3. Redeploy no Vercel

Após adicionar `DIRECT_DATABASE_URL`:

1. Vá em: **Deployments**
2. Clique em **"Redeploy"** no último deploy
3. Aguarde o build (~2 min)

---

## 🎯 Como Funciona Agora

```
┌──────────────────────────────────┐
│ DATABASE_URL (pooled)            │
│ → Usado em queries normais       │
│ → Rápido e escalável             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ DIRECT_DATABASE_URL (direct)     │
│ → Usado apenas em migrations     │
│ → Permite advisory locks         │
└──────────────────────────────────┘
```

---

## 📚 Referência

- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Prisma Advisory Locking](https://pris.ly/d/migrate-advisory-locking)

---

## ✅ Checklist

- [ ] Copiar **Pooled URL** do Neon
- [ ] Copiar **Direct URL** do Neon
- [ ] Adicionar `DATABASE_URL` no Vercel
- [ ] Adicionar `DIRECT_DATABASE_URL` no Vercel
- [ ] Redeploy no Vercel
- [ ] Verificar build bem-sucedido
