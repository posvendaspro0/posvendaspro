/**
 * Serviço de Integração com Mercado Livre
 * Gerencia autenticação OAuth2 e chamadas à API
 */

const ML_API_URL = process.env.MERCADOLIVRE_API_URL || 'https://api.mercadolibre.com';
const ML_AUTH_URL = process.env.MERCADOLIVRE_AUTH_URL || 'https://auth.mercadolivre.com.br';
const CLIENT_ID = process.env.MERCADOLIVRE_CLIENT_ID!;
const CLIENT_SECRET = process.env.MERCADOLIVRE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MERCADOLIVRE_REDIRECT_URI!;

/**
 * Gera URL de autorização OAuth2
 */
export function getAuthorizationUrl(companyId: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: companyId, // Passa o ID da empresa no state
  });

  return `${ML_AUTH_URL}/authorization?${params.toString()}`;
}

/**
 * Troca o código de autorização por tokens de acesso
 */
export async function exchangeCodeForTokens(code: string) {
  const response = await fetch(`${ML_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao obter tokens: ${error}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    userId: data.user_id,
  };
}

/**
 * Renova o access token usando o refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${ML_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao renovar token');
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Faz chamada autenticada à API do ML
 */
async function mlApiCall(endpoint: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`${ML_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro na API ML: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Busca informações do usuário/vendedor
 */
export async function getUserInfo(accessToken: string, userId: string) {
  return mlApiCall(`/users/${userId}`, accessToken);
}

/**
 * Lista pedidos do vendedor
 */
export async function getOrders(accessToken: string, userId: string, filters: {
  offset?: number;
  limit?: number;
  sort?: 'date_asc' | 'date_desc';
} = {}) {
  const params = new URLSearchParams({
    seller: userId,
    offset: String(filters.offset || 0),
    limit: String(filters.limit || 50),
    sort: filters.sort || 'date_desc',
  });

  return mlApiCall(`/orders/search?${params.toString()}`, accessToken);
}

/**
 * Busca detalhes de um pedido específico
 */
export async function getOrder(accessToken: string, orderId: string) {
  return mlApiCall(`/orders/${orderId}`, accessToken);
}

/**
 * Lista reclamações (claims) do vendedor
 */
export async function getClaims(accessToken: string, filters: {
  offset?: number;
  limit?: number;
  status?: string;
} = {}) {
  const params = new URLSearchParams({
    offset: String(filters.offset || 0),
    limit: String(filters.limit || 50),
  });

  if (filters.status) {
    params.append('status', filters.status);
  }

  return mlApiCall(`/post-purchase/v1/claims/search?${params.toString()}`, accessToken);
}

/**
 * Busca detalhes de uma reclamação específica
 */
export async function getClaim(accessToken: string, claimId: string) {
  return mlApiCall(`/post-purchase/v1/claims/${claimId}`, accessToken);
}

/**
 * Busca informações de envio de um pedido
 */
export async function getShipment(accessToken: string, shipmentId: string) {
  return mlApiCall(`/shipments/${shipmentId}`, accessToken);
}

/**
 * Lista mensagens de um pedido
 */
export async function getMessages(accessToken: string, orderId: string) {
  return mlApiCall(`/messages/orders/${orderId}`, accessToken);
}

/**
 * Envia mensagem para o comprador
 */
export async function sendMessage(accessToken: string, orderId: string, message: string) {
  return mlApiCall(`/messages/orders/${orderId}`, accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: message,
    }),
  });
}

/**
 * Responde uma reclamação
 */
export async function respondClaim(accessToken: string, claimId: string, message: string) {
  return mlApiCall(`/post-purchase/v1/claims/${claimId}/messages`, accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: message,
    }),
  });
}

/**
 * Aceita uma reclamação
 */
export async function acceptClaim(accessToken: string, claimId: string) {
  return mlApiCall(`/post-purchase/v1/claims/${claimId}/accept`, accessToken, {
    method: 'POST',
  });
}

/**
 * Recusa uma reclamação
 */
export async function declineClaim(accessToken: string, claimId: string, reason: string) {
  return mlApiCall(`/post-purchase/v1/claims/${claimId}/decline`, accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason,
    }),
  });
}

