/**
 * Serviço profissional para busca de claims do Mercado Livre
 * Busca TODAS as claims sem limite e filtra por data
 */

import { getClaims } from './mercadolivre-service';

interface FetchAllClaimsOptions {
  accessToken: string;
  userId: string;
  connectedAt: Date;
  status?: string;
}

interface FetchResult {
  claims: any[];
  totalFetched: number;
  totalFiltered: number;
  pagesProcessed: number;
  duration: number;
}

/**
 * Busca TODAS as claims da conta (sem limite)
 * Filtra apenas claims >= connectedAt (últimos 7 dias)
 */
export async function fetchAllClaims(
  options: FetchAllClaimsOptions
): Promise<FetchResult> {
  const startTime = Date.now();
  const { accessToken, userId, connectedAt, status } = options;

  const allClaimsRaw: any[] = [];
  const connectedAtTime = connectedAt.getTime();
  
  let offset = 0;
  const pageSize = 100;
  let pagesProcessed = 0;
  let hasMore = true;

  console.log('[Claims Fetcher] 🚀 Buscando TODAS as claims');
  console.log(`[Claims Fetcher] Filtro: claims >= ${connectedAt.toISOString()}`);

  // Buscar TODAS as páginas sem limite
  while (hasMore) {
    try {
      const response = await getClaims(accessToken, {
        offset,
        limit: pageSize,
        status,
        userId,
        connectedAt,
      });

      if (!response.data || response.data.length === 0) {
        // Página vazia = última página
        hasMore = false;
        break;
      }

      pagesProcessed++;
      allClaimsRaw.push(...response.data);

      // Log a cada 10 páginas para não poluir console
      if (pagesProcessed % 10 === 0) {
        console.log(
          `[Claims Fetcher] Página ${pagesProcessed}: ${allClaimsRaw.length} claims acumuladas`
        );
      }

      // Verificar se há mais páginas
      if (!response.paging || response.paging.total <= offset + pageSize) {
        hasMore = false;
      } else {
        offset += pageSize;
      }
    } catch (error) {
      console.error(`[Claims Fetcher] ❌ Erro na página ${pagesProcessed + 1}:`, error);
      throw error;
    }
  }

  console.log('[Claims Fetcher] ========================================');
  console.log('[Claims Fetcher] 📊 BUSCA COMPLETA');
  console.log('[Claims Fetcher] ========================================');
  console.log(`[Claims Fetcher] Total buscado: ${allClaimsRaw.length} claims`);
  console.log(`[Claims Fetcher] Páginas processadas: ${pagesProcessed}`);

  // Filtrar apenas claims >= connectedAt
  const filteredClaims = allClaimsRaw.filter((claim: any) => {
    const claimDate = new Date(claim.date_created).getTime();
    return claimDate >= connectedAtTime;
  });

  const duration = Date.now() - startTime;

  console.log('[Claims Fetcher] ========================================');
  console.log('[Claims Fetcher] 🔍 FILTRO APLICADO');
  console.log('[Claims Fetcher] ========================================');
  console.log(`[Claims Fetcher] Claims filtradas: ${filteredClaims.length}`);
  console.log(`[Claims Fetcher] Claims removidas: ${allClaimsRaw.length - filteredClaims.length}`);
  console.log(`[Claims Fetcher] Tempo total: ${(duration / 1000).toFixed(2)}s`);
  console.log('[Claims Fetcher] ========================================');

  return {
    claims: filteredClaims,
    totalFetched: allClaimsRaw.length,
    totalFiltered: filteredClaims.length,
    pagesProcessed,
    duration,
  };
}
