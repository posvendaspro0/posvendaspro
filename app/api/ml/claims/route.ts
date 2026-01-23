/**
 * API Route: Buscar reclamações do Mercado Livre
 * GET /api/ml/claims
 */

import { NextResponse } from "next/server";
import { requireClient } from "@/lib/auth-helpers";
import {
  getValidAccessToken,
  getMlAccountByCompanyId,
} from "@/services/mercadolivre-service";
import { fetchAllClaims } from "@/services/claims-fetcher";
import { persistClaims } from "@/services/ml-claims-sync";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60 * 60 * 1000;
const claimsCache = new Map<
  string,
  { expiresAt: number; payload: { claims: any[]; paging: any } }
>();

export async function GET(request: Request) {
  try {
    const session = await requireClient();

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        {
          error: "Usuário não está vinculado a uma empresa",
          connected: false,
        },
        { status: 400 }
      );
    }

    // Buscar conta ML
    console.log("[ML Claims API] Buscando conta ML para empresa:", companyId);

    const mlAccount = await getMlAccountByCompanyId(companyId);

    if (!mlAccount) {
      console.log(
        "[ML Claims API] Conta ML não encontrada para empresa:",
        companyId
      );
      return NextResponse.json(
        {
          error:
            "Conta do Mercado Livre não conectada. Por favor, conecte sua conta na página de Integrações.",
          connected: false,
        },
        { status: 200 }
      );
    }

    // Extrair filtros da query string
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const refresh = searchParams.get("refresh") === "1";

    let claims: any;

    try {
      const { prisma } = await import("@/lib/prisma");
      const now = new Date();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const hasInvalidConnectedAt =
        !mlAccount.connectedAt || mlAccount.connectedAt.getTime() > now.getTime();
      const effectiveConnectedAt = hasInvalidConnectedAt
        ? sevenDaysAgo
        : mlAccount.connectedAt;

      if (hasInvalidConnectedAt) {
        await prisma.mlAccount.update({
          where: { companyId },
          data: { connectedAt: effectiveConnectedAt },
        });
      }

      if (!refresh) {
        const whereClause: any = { companyId };
        if (status && status !== "all") {
          if (status === "opened") {
            whereClause.status = "opened";
          } else if (status === "claim") {
            whereClause.stage = "claim";
          } else if (status === "dispute") {
            whereClause.stage = "dispute";
          } else if (status === "recontact") {
            whereClause.stage = "recontact";
          } else if (status === "none") {
            whereClause.stage = "none";
          } else if (status === "stale") {
            whereClause.stage = "stale";
          } else if (status === "closed") {
            whereClause.status = "closed";
          } else if (status === "lost") {
            whereClause.status = "lost";
          }
        }

        const storedClaims = await prisma.mlClaim.findMany({
          where: whereClause,
          orderBy: {
            dateCreated: "desc",
          },
        });

        const claimIds = storedClaims.map((claim) => String(claim.mlClaimId));
        const complementaryData = await prisma.mlClaimData.findMany({
          where: {
            companyId,
            mlClaimId: {
              in: claimIds,
            },
          },
        });

        const dataMap = new Map(
          complementaryData.map((item) => [item.mlClaimId, item])
        );

        const mergedClaims = storedClaims.map((claim) => {
          const raw = claim.raw || {};
          const extra = dataMap.get(String(claim.mlClaimId)) as any;
          return {
            ...raw,
            id: raw.id || claim.mlClaimId,
            status: raw.status || claim.status,
            stage: raw.stage || claim.stage,
            type: raw.type || claim.type,
            resource: raw.resource || claim.resource,
            resource_id: raw.resource_id || claim.resourceId,
            order_id: raw.order_id || claim.orderId,
            reason_id: raw.reason_id || claim.reasonId,
            site_id: raw.site_id || claim.siteId,
            date_created: raw.date_created || claim.dateCreated,
            last_updated: raw.last_updated || claim.lastUpdated,
            date_closed: raw.date_closed || claim.dateClosed,
            _complementary: extra
              ? {
                  responsible: extra.responsible,
                  productSku: extra.productSku,
                  problemType: extra.problemType,
                  resolutionCost: extra.resolutionCost
                    ? Number(extra.resolutionCost)
                    : null,
                  observation: extra.observation,
                }
              : null,
          };
        });

        if (mergedClaims.length > 0) {
          return NextResponse.json({
            connected: true,
            claims: mergedClaims,
            paging: {
              total: mergedClaims.length,
              offset: 0,
              limit: mergedClaims.length,
            },
            source: "db",
          });
        }
      }

      const accessToken = await getValidAccessToken(companyId);

      if (!accessToken) {
        console.log(
          "[ML Claims API] Token não encontrado para empresa:",
          companyId
        );
        return NextResponse.json(
          {
            error:
              "Token do Mercado Livre inválido. Por favor, reconecte sua conta.",
            connected: false,
          },
          { status: 200 }
        );
      }

      console.log(
        "[ML Claims API] Token encontrado. User ID:",
        mlAccount.mercadoLivreUserId
      );

      const cacheKey = `${companyId}:${status || "all"}:${effectiveConnectedAt.toISOString()}`;
      const cached = claimsCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json(
          {
            connected: true,
            claims: cached.payload.claims,
            paging: cached.payload.paging,
            cached: true,
            source: "cache",
          },
          {
            headers: {
              "Cache-Control": "private, max-age=3600",
            },
          }
        );
      }

      // 🚀 Buscar TODAS as claims (sem limite)
      const result = await fetchAllClaims({
        accessToken,
        userId: mlAccount.mercadoLivreUserId,
        connectedAt: effectiveConnectedAt,
        status,
      });

      // Persistir todas as claims puxadas (payload completo + campos chave)
      try {
        await persistClaims(prisma, companyId, result.claims);
      } catch (persistError) {
        console.error("[ML Claims API] Erro ao persistir claims:", persistError);
      }

      // Após atualizar o banco, retornar SEMPRE os dados do banco
      const storedClaims = await prisma.mlClaim.findMany({
        where: { companyId },
        orderBy: {
          dateCreated: "desc",
        },
      });

      const claimIds = storedClaims.map((claim) => String(claim.mlClaimId));
      const complementaryData = await prisma.mlClaimData.findMany({
        where: {
          companyId,
          mlClaimId: {
            in: claimIds,
          },
        },
      });

      const dataMap = new Map(
        complementaryData.map((item) => [item.mlClaimId, item])
      );

      const mergedClaims = storedClaims.map((claim) => {
        const raw = claim.raw || {};
        const extra = dataMap.get(String(claim.mlClaimId)) as any;
        return {
          ...raw,
          id: raw.id || claim.mlClaimId,
          status: raw.status || claim.status,
          stage: raw.stage || claim.stage,
          type: raw.type || claim.type,
          resource: raw.resource || claim.resource,
          resource_id: raw.resource_id || claim.resourceId,
          order_id: raw.order_id || claim.orderId,
          reason_id: raw.reason_id || claim.reasonId,
          site_id: raw.site_id || claim.siteId,
          date_created: raw.date_created || claim.dateCreated,
          last_updated: raw.last_updated || claim.lastUpdated,
          date_closed: raw.date_closed || claim.dateClosed,
          _complementary: extra
            ? {
                responsible: extra.responsible,
                productSku: extra.productSku,
                problemType: extra.problemType,
                resolutionCost: extra.resolutionCost
                  ? Number(extra.resolutionCost)
                  : null,
                observation: extra.observation,
              }
            : null,
        };
      });

      claims = {
        data: mergedClaims,
        paging: {
          total: mergedClaims.length,
          offset: 0,
          limit: mergedClaims.length,
        },
      };

      claimsCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        payload: { claims: claims.data || [], paging: claims.paging || {} },
      });
    } catch (mlError) {
      console.error("[ML Claims API] Erro ao chamar API ML:", mlError);

      // Capturar detalhes do erro
      const errorMessage =
        mlError instanceof Error ? mlError.message : String(mlError);

      // Se for erro 401 (não autorizado)
      if (errorMessage.includes("401")) {
        return NextResponse.json(
          {
            error:
              "Token do Mercado Livre inválido ou expirado. Por favor, reconecte sua conta.",
            connected: false,
            details: errorMessage,
          },
          { status: 200 }
        );
      }

      // Se for erro 403 (sem permissão)
      if (errorMessage.includes("403")) {
        return NextResponse.json(
          {
            error:
              "Sem permissão para acessar reclamações. Verifique as permissões do aplicativo no Mercado Livre.",
            connected: false,
            details: errorMessage,
          },
          { status: 200 }
        );
      }

      // Se for erro 404 (endpoint não encontrado)
      if (errorMessage.includes("404")) {
        return NextResponse.json(
          {
            error:
              "Endpoint de reclamações não encontrado. Pode não haver reclamações ou o endpoint mudou.",
            connected: true,
            claims: [],
            details: errorMessage,
          },
          { status: 200 }
        );
      }

      // Erro genérico da API ML
      return NextResponse.json(
        {
          error: "Erro ao buscar reclamações do Mercado Livre",
          connected: false,
          details: errorMessage,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      connected: true,
      claims: claims.data || claims.results || claims || [],
      paging: claims.paging || {},
      cached: false,
      source: "api",
    });
  } catch (error) {
    console.error("[ML Claims API] Erro geral:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao processar requisição",
        details: error instanceof Error ? error.message : String(error),
        connected: false,
      },
      { status: 500 }
    );
  }
}
