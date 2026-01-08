/**
 * Serviço otimizado para busca de claims do Mercado Livre
 * Com suporte a paginação automática e filtros
 */

import { getClaims } from './mercadolivre-service';

interface FetchAllClaimsOptions {
  accessToken: string;
  userId: string;
  connectedAt: Date;
  status?: string;
  maxPages?: number; // Limite de segurança
  pageSize?: number;
}

interface FetchResult {
  claims: any[];
  totalFetched: number;
  totalFiltered: number;
  pagesProcessed: number;
  duration: number;
}

/**
 * Busca TODAS as claims com paginação automática e filtros
 * Otimizado com early exit quando encontra claims antigas demais
 */
export async function fetchAllClaims(
  options: FetchAllClaimsOptions
): Promise<FetchResult> {
  const startTime = Date.now();
  const {
    accessToken,
    userId,
    connectedAt,
    status,
    maxPages = 100, // Limite de segurança (100 páginas = 10.000 claims)
    pageSize = 100,
  } = options;

  const allClaims: any[] = [];
  const connectedAtTime = connectedAt.getTime();
  
  let offset = 0;
  let pagesProcessed = 0;
  let consecutiveOldClaims = 0;
  const MAX_CONSECUTIVE_OLD = 3; // Parar após 3 páginas só com claims antigas

  console.log('[Claims Fetcher] 🚀 Iniciando busca otimizada');
  console.log(`[Claims Fetcher] Filtro: claims >= ${connectedAt.toISOString()}`);

  while (pagesProcessed < maxPages) {
    try {
      const response = await getClaims(accessToken, {
        offset,
        limit: pageSize,
        status,
        userId,
        connectedAt, // API ML ignora, mas enviamos mesmo assim
      });

      if (!response.data || response.data.length === 0) {
        console.log(`[Claims Fetcher] ✅ Última página alcançada (vazia)`);
        break;
      }

      pagesProcessed++;
      const pageHasValidClaims = response.data.some((claim: any) => {
        const claimDate = new Date(claim.date_created).getTime();
        return claimDate >= connectedAtTime;
      });

      if (pageHasValidClaims) {
        // Filtrar e adicionar apenas claims válidas desta página
        const validClaims = response.data.filter((claim: any) => {
          const claimDate = new Date(claim.date_created).getTime();
          return claimDate >= connectedAtTime;
        });
        
        allClaims.push(...validClaims);
        consecutiveOldClaims = 0; // Resetar contador
        
        console.log(
          `[Claims Fetcher] Página ${pagesProcessed}: +${validClaims.length} válidas (total: ${allClaims.length})`
        );
      } else {
        consecutiveOldClaims++;
        console.log(
          `[Claims Fetcher] Página ${pagesProcessed}: 0 válidas (consecutivas antigas: ${consecutiveOldClaims})`
        );
        
        // Early exit: Parar se encontrar muitas páginas só com claims antigas
        if (consecutiveOldClaims >= MAX_CONSECUTIVE_OLD) {
          console.log(
            `[Claims Fetcher] ⚡ Early exit: ${MAX_CONSECUTIVE_OLD} páginas consecutivas sem claims válidas`
          );
          break;
        }
      }

      // Verificar se há mais páginas
      if (!response.paging || response.paging.total <= offset + pageSize) {
        console.log(`[Claims Fetcher] ✅ Última página alcançada (total: ${response.paging?.total || 0})`);
        break;
      }

      offset += pageSize;
    } catch (error) {
      console.error(`[Claims Fetcher] ❌ Erro na página ${pagesProcessed + 1}:`, error);
      throw error;
    }
  }

  const duration = Date.now() - startTime;

  console.log('[Claims Fetcher] ========================================');
  console.log('[Claims Fetcher] 📊 RESUMO DA BUSCA');
  console.log('[Claims Fetcher] ========================================');
  console.log(`[Claims Fetcher] Páginas processadas: ${pagesProcessed}`);
  console.log(`[Claims Fetcher] Claims válidas: ${allClaims.length}`);
  console.log(`[Claims Fetcher] Tempo total: ${(duration / 1000).toFixed(2)}s`);
  console.log('[Claims Fetcher] ========================================');

  return {
    claims: allClaims,
    totalFetched: offset + pageSize,
    totalFiltered: allClaims.length,
    pagesProcessed,
    duration,
  };
}
