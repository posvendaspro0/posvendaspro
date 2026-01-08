/**
 * API Route: Buscar reclamações do Mercado Livre
 * GET /api/ml/claims
 */

import { NextResponse } from "next/server";
import { requireClient } from "@/lib/auth-helpers";
import {
  getValidAccessToken,
  getClaims,
  getMlAccountByCompanyId,
} from "@/services/mercadolivre-service";

export const dynamic = "force-dynamic";

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

    // Buscar conta ML e access token válido
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

    // Extrair filtros da query string
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    // 🎯 BUSCAR TODAS AS CLAIMS (paginação automática)
    let allClaims: any[] = [];
    let offset = 0;
    const limit = 100; // Limite por requisição (máximo seguro)
    let hasMore = true;
    let claims: any; // Declarar aqui para usar fora do try

    console.log("[ML Claims API] ========================================");
    console.log("[ML Claims API] 🔍 BUSCANDO TODAS AS CLAIMS");
    console.log("[ML Claims API] ========================================");
    console.log("[ML Claims API] connectedAt:", mlAccount.connectedAt?.toISOString());
    console.log("[ML Claims API] Status solicitado:", status || "TODOS");
    console.log("[ML Claims API] User ID ML:", mlAccount.mercadoLivreUserId);
    console.log("[ML Claims API] ========================================");

    try {
      // Loop para buscar todas as páginas
      while (hasMore) {
        console.log(`[ML Claims API] 📄 Buscando página offset=${offset}, limit=${limit}`);

        const claims = await getClaims(accessToken, {
          offset,
          limit,
          status,
          userId: mlAccount.mercadoLivreUserId,
          connectedAt: mlAccount.connectedAt,
        });

        if (claims.data && claims.data.length > 0) {
          allClaims = allClaims.concat(claims.data);
          console.log(`[ML Claims API] ✅ ${claims.data.length} claims nesta página`);
          console.log(`[ML Claims API] 📊 Total acumulado: ${allClaims.length}`);

          // Verificar se há mais páginas
          if (claims.paging && claims.paging.total > allClaims.length) {
            offset += limit;
            hasMore = true;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      console.log("[ML Claims API] ========================================");
      console.log("[ML Claims API] 📊 BUSCA COMPLETA");
      console.log("[ML Claims API] ========================================");
      console.log("[ML Claims API] Total de claims buscadas:", allClaims.length);
      console.log("[ML Claims API] ========================================");

      // Criar objeto claims com todas as claims
      claims = {
        data: allClaims,
        paging: {
          total: allClaims.length,
          offset: 0,
          limit: allClaims.length,
        }
      };

      if (claims.data && claims.data.length > 0) {
        console.log("[ML Claims API] Primeira claim:");
        console.log("[ML Claims API] - ID:", claims.data[0].id);
        console.log("[ML Claims API] - Data:", claims.data[0].date_created);
        
        console.log("[ML Claims API] Última claim:");
        const last = claims.data[claims.data.length - 1];
        console.log("[ML Claims API] - ID:", last.id);
        console.log("[ML Claims API] - Data:", last.date_created);
      }

      // 🎯 FILTRO MANUAL: API ML ignora date_created.from
      // Filtrar claims criadas >= connectedAt no BACKEND
      if (claims.data && claims.data.length > 0 && mlAccount.connectedAt) {
        const connectedAtTime = new Date(mlAccount.connectedAt).getTime();
        const totalAntesFiltro = claims.data.length;

        claims.data = claims.data.filter((claim: any) => {
          const claimDate = new Date(claim.date_created).getTime();
          return claimDate >= connectedAtTime;
        });

        console.log("[ML Claims API] ========================================");
        console.log("[ML Claims API] 🔍 FILTRO MANUAL APLICADO");
        console.log("[ML Claims API] ========================================");
        console.log(
          "[ML Claims API] connectedAt:",
          mlAccount.connectedAt.toISOString()
        );
        console.log(
          "[ML Claims API] Claims antes do filtro:",
          totalAntesFiltro
        );
        console.log("[ML Claims API] Claims após filtro:", claims.data.length);
        console.log(
          "[ML Claims API] Claims removidas:",
          totalAntesFiltro - claims.data.length
        );
        console.log("[ML Claims API] ========================================");

        if (claims.data.length > 0) {
          console.log("[ML Claims API] Primeira claim após filtro:");
          console.log("[ML Claims API] - ID:", claims.data[0].id);
          console.log("[ML Claims API] - Data:", claims.data[0].date_created);
          console.log("[ML Claims API] ✅ Data >= connectedAt");
        }
      }
      console.log("[ML Claims API] ========================================");

      // Buscar dados complementares do banco para cada claim
      if (claims.data && claims.data.length > 0) {
        const claimIds = claims.data.map((claim: any) => String(claim.id));

        // Buscar todos os dados complementares de uma vez
        const { prisma } = await import("@/lib/prisma");
        const complementaryData = await prisma.mlClaimData.findMany({
          where: {
            companyId,
            mlClaimId: {
              in: claimIds,
            },
          },
        });

        // Criar um map para acesso rápido
        const dataMap = new Map(
          complementaryData.map((item) => [item.mlClaimId, item])
        );

        // Mesclar dados ML + dados complementares
        claims.data = claims.data.map((claim: any) => {
          const extra = dataMap.get(String(claim.id));
          return {
            ...claim,
            // Adicionar dados complementares
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

        console.log("[ML Claims API] Dados complementares mesclados");
      }
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
