/**
 * Serviço de Integração com Mercado Livre
 * Gerencia autenticação OAuth2 e chamadas à API
 */

import { prisma } from "@/lib/prisma";

const ML_API_URL =
  process.env.MERCADOLIVRE_API_URL || "https://api.mercadolibre.com";
const ML_AUTH_URL =
  process.env.MERCADOLIVRE_AUTH_URL || "https://auth.mercadolivre.com.br";
const CLIENT_ID = process.env.MERCADOLIVRE_CLIENT_ID!;
const CLIENT_SECRET = process.env.MERCADOLIVRE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MERCADOLIVRE_REDIRECT_URI!;

/**
 * Gera URL de autorização OAuth2
 */
export function getAuthorizationUrl(companyId: string): string {
  const params = new URLSearchParams({
    response_type: "code",
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
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
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
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao renovar token");
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}

/**
 * Faz chamada autenticada à API do ML
 */
async function mlApiCall(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const fullUrl = `${ML_API_URL}${endpoint}`;
  const shouldLog = process.env.NODE_ENV !== "production";

  if (shouldLog) {
    console.log("[ML API Call] Iniciando chamada:", {
      url: fullUrl,
      method: options.method || "GET",
      hasToken: !!accessToken,
      tokenPrefix: accessToken ? accessToken.substring(0, 20) + "..." : "N/A",
    });
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (shouldLog) {
      console.log("[ML API Call] Resposta recebida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;

      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }

      console.error("[ML API Call] Erro na resposta:", {
        status: response.status,
        statusText: response.statusText,
        errorDetails,
      });

      throw new Error(
        `API ML retornou ${response.status}: ${JSON.stringify(errorDetails)}`
      );
    }

    const data = await response.json();
    if (shouldLog) {
      console.log("[ML API Call] Dados recebidos com sucesso:", {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      });
    }

    return data;
  } catch (error) {
    console.error("[ML API Call] Erro na chamada:", {
      error: error instanceof Error ? error.message : String(error),
      endpoint: fullUrl,
    });
    throw error;
  }
}

/**
 * Lista reclamações (claims) do vendedor
 * IMPORTANTE: A API ML exige player_role AND player_user_id
 */
export async function getClaims(
  accessToken: string,
  filters: {
    offset?: number;
    limit?: number;
    status?: string;
    userId?: string; // ID do usuário no Mercado Livre (obrigatório)
    siteId?: string;
    connectedAt?: Date; // Data da conexão da conta ML
  } = {}
) {
  const shouldLog = process.env.NODE_ENV !== "production";
  const params = new URLSearchParams({
    offset: String(filters.offset || 0),
    limit: String(filters.limit || 500), // ✅ Aumentar para 500 (máx da API ML)
  });

  // OBRIGATÓRIO: player_role=respondent (somos o vendedor)
  params.append("player_role", "respondent");

  // OBRIGATÓRIO: player_user_id (ID do usuário no ML)
  if (filters.userId) {
    params.append("player_user_id", filters.userId);
    if (shouldLog) {
      console.log("[ML Service] Usando player_user_id:", filters.userId);
    }
  } else {
    if (shouldLog) {
      console.warn(
        "[ML Service] AVISO: player_user_id não fornecido! A API pode rejeitar a requisição."
      );
    }
  }

  // Adicionar site_id se fornecido (MLB = Brasil)
  if (filters.siteId) {
    params.append("site_id", filters.siteId);
  }

  // 🎯 FILTRO: Status (se especificado)
  // Por padrão, NÃO filtrar por status para pegar abertas E concluídas
  if (filters.status) {
    params.append("status", filters.status);
    if (shouldLog) {
      console.log("[ML Service] Filtrando por status:", filters.status);
    }
  } else {
    if (shouldLog) {
      console.log(
        "[ML Service] Sem filtro de status - buscando abertas E concluídas"
      );
    }
  }

  // 🎯 FILTRO: Data de criação >= data de conexão da conta
  if (filters.connectedAt) {
    // Formato esperado pela API: YYYY-MM-DDTHH:mm:ss.sssZ (ISO 8601)
    const dateFrom = filters.connectedAt.toISOString();
    params.append("date_created.from", dateFrom);
    if (shouldLog) {
      console.log("[ML Service] ========================================");
      console.log("[ML Service] ✅ FILTRO DATA ATIVO");
      console.log("[ML Service] ========================================");
      console.log("[ML Service] connectedAt recebido:", filters.connectedAt);
      console.log("[ML Service] Data ISO para API ML:", dateFrom);
      console.log("[ML Service] Filtro aplicado: date_created.from =", dateFrom);
      console.log(
        "[ML Service] ⚠️ API ML vai retornar APENAS claims criadas >= esta data"
      );
      console.log("[ML Service] ========================================");
    }
  } else {
    if (shouldLog) {
      console.log("[ML Service] ========================================");
      console.log("[ML Service] ⚠️⚠️⚠️ ATENÇÃO: FILTRO DATA INATIVO! ⚠️⚠️⚠️");
      console.log("[ML Service] ========================================");
      console.log("[ML Service] connectedAt NÃO fornecido!");
      console.log("[ML Service] API ML vai retornar TODAS as claims!");
      console.log("[ML Service] ========================================");
    }
  }

  if (shouldLog) {
    console.log(
      "[ML Service] 🌐 URL final:",
      `/post-purchase/v1/claims/search?${params.toString()}`
    );
  }

  return mlApiCall(
    `/post-purchase/v1/claims/search?${params.toString()}`,
    accessToken
  );
}

/**
 * Busca detalhes de uma reclamação específica
 */
export async function getClaim(accessToken: string, claimId: string) {
  return mlApiCall(`/post-purchase/v1/claims/${claimId}`, accessToken);
}

/**
 * Busca mensagens de uma reclamação
 */
export async function getClaimMessages(accessToken: string, claimId: string) {
  return mlApiCall(`/post-purchase/v1/claims/${claimId}/messages`, accessToken);
}

/**
 * Busca histórico de ações de uma reclamação
 */
export async function getClaimActionsHistory(
  accessToken: string,
  claimId: string
) {
  return mlApiCall(
    `/post-purchase/v1/claims/${claimId}/actions-history`,
    accessToken
  );
}

/**
 * Busca histórico de status de uma reclamação
 */
export async function getClaimStatusHistory(
  accessToken: string,
  claimId: string
) {
  return mlApiCall(
    `/post-purchase/v1/claims/${claimId}/status-history`,
    accessToken
  );
}

/**
 * Verifica se uma reclamação afeta a reputação
 */
export async function getClaimAffectsReputation(
  accessToken: string,
  claimId: string
) {
  return mlApiCall(
    `/post-purchase/v1/claims/${claimId}/affects-reputation`,
    accessToken
  );
}

// ============================================
// MÉTODOS DE BANCO DE DADOS (Prisma)
// ============================================

/**
 * Salva ou atualiza a conta ML no banco de dados
 */
export async function saveMlAccount(
  companyId: string,
  mercadoLivreUserId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const existing = await prisma.mlAccount.findUnique({ where: { companyId } });

  let connectedAtToUse = existing?.connectedAt ?? sevenDaysAgo;

  // Se connectedAt veio inválido (no futuro), corrigir para 7 dias atrás
  if (connectedAtToUse.getTime() > now.getTime()) {
    connectedAtToUse = sevenDaysAgo;
  }

  console.log("[saveMlAccount] ========================================");
  console.log("[saveMlAccount] 📅 Definindo connectedAt (primeira conexão)");
  console.log("[saveMlAccount] ========================================");
  console.log("[saveMlAccount] Data atual do sistema:", now.toISOString());
  console.log(
    "[saveMlAccount] connectedAt utilizado:",
    connectedAtToUse.toISOString()
  );
  console.log("[saveMlAccount] ✅ Buscará claims a partir desta data");
  console.log("[saveMlAccount] ========================================");

  return prisma.mlAccount.upsert({
    where: { companyId },
    update: {
      mercadoLivreUserId,
      accessToken,
      refreshToken,
      expiresAt,
      connectedAt: connectedAtToUse, // ✅ manter primeira conexão
    },
    create: {
      companyId,
      mercadoLivreUserId,
      accessToken,
      refreshToken,
      expiresAt,
      connectedAt: connectedAtToUse, // ✅ 7 dias atrás da 1a conexão
    },
  });
}

/**
 * Busca a conta ML de uma empresa
 */
export async function getMlAccountByCompanyId(companyId: string) {
  return prisma.mlAccount.findUnique({
    where: { companyId },
  });
}

/**
 * Remove a conta ML de uma empresa
 */
export async function disconnectMlAccount(companyId: string) {
  return prisma.mlAccount.delete({
    where: { companyId },
  });
}

/**
 * Verifica se o token está expirado e renova se necessário
 */
export async function getValidAccessToken(
  companyId: string
): Promise<string | null> {
  console.log("[ML Service] Buscando conta ML para empresa:", companyId);

  const mlAccount = await getMlAccountByCompanyId(companyId);

  if (!mlAccount) {
    console.log(
      "[ML Service] Nenhuma conta ML encontrada para empresa:",
      companyId
    );
    return null;
  }

  console.log("[ML Service] Conta ML encontrada:", {
    userId: mlAccount.mercadoLivreUserId,
    expiresAt: mlAccount.expiresAt,
    isActive: mlAccount.isActive,
  });

  // Se o token ainda é válido (com margem de 5 minutos)
  const now = new Date();
  const expiresAt = new Date(mlAccount.expiresAt);
  const marginMs = 5 * 60 * 1000; // 5 minutos
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();

  if (timeUntilExpiry > marginMs) {
    console.log(
      "[ML Service] Token ainda válido. Expira em:",
      Math.floor(timeUntilExpiry / 1000 / 60),
      "minutos"
    );
    return mlAccount.accessToken;
  }

  console.log(
    "[ML Service] Token expirado ou próximo de expirar. Renovando..."
  );

  // Token expirado ou próximo de expirar, renovar
  try {
    const tokens = await refreshAccessToken(mlAccount.refreshToken);

    console.log("[ML Service] Token renovado com sucesso");

    // Atualizar no banco
    await saveMlAccount(
      companyId,
      mlAccount.mercadoLivreUserId,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresIn
    );

    return tokens.accessToken;
  } catch (error) {
    console.error("[ML Service] Erro ao renovar token:", error);
    console.error("[ML Service] Detalhes do erro:", {
      message: error instanceof Error ? error.message : String(error),
      companyId,
      userId: mlAccount.mercadoLivreUserId,
    });
    // Se ainda há tempo de validade, manter o token atual para não "deslogar"
    if (timeUntilExpiry > 0) {
      return mlAccount.accessToken;
    }
    return null;
  }
}
