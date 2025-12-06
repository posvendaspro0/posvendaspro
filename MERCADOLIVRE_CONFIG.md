# 🔧 Configuração Mercado Livre

## ✅ Credenciais Configuradas

- **Client ID:** 5534728944371345
- **Client Secret:** 8mCKuAommoNarRs8s3HytFe8luGl7dLz

## 📝 Configurar .env.local

Adicione estas variáveis ao seu arquivo `.env.local`:

```env
# Mercado Livre API
MERCADOLIVRE_CLIENT_ID="5534728944371345"
MERCADOLIVRE_CLIENT_SECRET="8mCKuAommoNarRs8s3HytFe8luGl7dLz"
MERCADOLIVRE_REDIRECT_URI="http://localhost:3000/api/ml/callback" # LOCAL

# Para produção use:
# MERCADOLIVRE_REDIRECT_URI="https://www.posvendaspro.online/api/ml/callback"

# Mercado Livre API URLs
MERCADOLIVRE_API_URL="https://api.mercadolibre.com"
MERCADOLIVRE_AUTH_URL="https://auth.mercadolivre.com.br"
```

## 🔐 Escopos Disponíveis

### 📖 Leitura (READ):
- Conta / Usuário
- Pedidos (Orders)
- Mensagens (pré e pós-venda)
- Reclamações / Pós-compra (Claims)
- Envios / Logística (Shipments)
- Métricas do negócio

### ✍️ Escrita (WRITE):
- Mensagens (enviar respostas)
- Reclamações (aceitar, recusar, responder)
- Vendas e envios (atualizar pós-venda)

## 🚀 Funcionalidades Implementadas

- [x] Autenticação OAuth2
- [x] Gerenciamento de tokens (access + refresh)
- [x] Buscar pedidos (orders)
- [x] Buscar reclamações (claims)
- [x] Buscar informações de envio (shipping)
- [x] Buscar mensagens
- [x] Enviar mensagens
- [x] Sincronização automática com tickets
- [x] Cache de requisições
- [x] Interface de conexão no dashboard

## 📡 Endpoints da API

### Autenticação:
- `GET /api/ml/auth` - Iniciar conexão com ML
- `GET /api/ml/callback` - Callback OAuth2
- `POST /api/ml/disconnect` - Desconectar conta

### Dados:
- `GET /api/ml/orders` - Listar pedidos
- `GET /api/ml/orders/[id]` - Detalhes do pedido
- `GET /api/ml/claims` - Listar reclamações
- `GET /api/ml/claims/[id]` - Detalhes da reclamação
- `GET /api/ml/shipments/[id]` - Informações de envio
- `GET /api/ml/messages/[order_id]` - Mensagens do pedido
- `POST /api/ml/messages` - Enviar mensagem

### Sincronização:
- `POST /api/ml/sync` - Sincronizar dados manualmente
- `POST /api/ml/webhook` - Receber notificações do ML

## 🔗 Links Úteis

- Documentação ML: https://developers.mercadolivre.com.br/pt_br/api-docs-pt-br
- Minhas Apps: https://developers.mercadolivre.com.br/apps

