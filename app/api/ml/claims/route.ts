/**
 * API Route: Buscar reclamações do Mercado Livre
 * GET /api/ml/claims
 */

import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth-helpers';
import { getValidAccessToken, getClaims, getMlAccountByCompanyId } from '@/services/mercadolivre-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireClient();

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        { 
          error: 'Usuário não está vinculado a uma empresa',
          connected: false 
        },
        { status: 400 }
      );
    }

    // Buscar conta ML e access token válido
    console.log('[ML Claims API] Buscando conta ML para empresa:', companyId);
    
    const mlAccount = await getMlAccountByCompanyId(companyId);
    
    if (!mlAccount) {
      console.log('[ML Claims API] Conta ML não encontrada para empresa:', companyId);
      return NextResponse.json(
        { 
          error: 'Conta do Mercado Livre não conectada. Por favor, conecte sua conta na página de Integrações.', 
          connected: false 
        },
        { status: 200 }
      );
    }

    const accessToken = await getValidAccessToken(companyId);
    
    if (!accessToken) {
      console.log('[ML Claims API] Token não encontrado para empresa:', companyId);
      return NextResponse.json(
        { 
          error: 'Token do Mercado Livre inválido. Por favor, reconecte sua conta.', 
          connected: false 
        },
        { status: 200 }
      );
    }

    console.log('[ML Claims API] Token encontrado. User ID:', mlAccount.mercadoLivreUserId);

    // Extrair filtros da query string
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || undefined;

    // Buscar reclamações na API do ML
    let claims;
    try {
      claims = await getClaims(accessToken, {
        offset,
        limit,
        status,
        userId: mlAccount.mercadoLivreUserId, // ID do usuário no ML (obrigatório)
      });
      
      console.log('[ML Claims API] Reclamações encontradas:', claims.data?.length || 0);
    } catch (mlError) {
      console.error('[ML Claims API] Erro ao chamar API ML:', mlError);
      
      // Capturar detalhes do erro
      const errorMessage = mlError instanceof Error ? mlError.message : String(mlError);
      
      // Se for erro 401 (não autorizado)
      if (errorMessage.includes('401')) {
        return NextResponse.json(
          { 
            error: 'Token do Mercado Livre inválido ou expirado. Por favor, reconecte sua conta.', 
            connected: false,
            details: errorMessage
          },
          { status: 200 }
        );
      }
      
      // Se for erro 403 (sem permissão)
      if (errorMessage.includes('403')) {
        return NextResponse.json(
          { 
            error: 'Sem permissão para acessar reclamações. Verifique as permissões do aplicativo no Mercado Livre.', 
            connected: false,
            details: errorMessage
          },
          { status: 200 }
        );
      }
      
      // Se for erro 404 (endpoint não encontrado)
      if (errorMessage.includes('404')) {
        return NextResponse.json(
          { 
            error: 'Endpoint de reclamações não encontrado. Pode não haver reclamações ou o endpoint mudou.', 
            connected: true,
            claims: [],
            details: errorMessage
          },
          { status: 200 }
        );
      }
      
      // Erro genérico da API ML
      return NextResponse.json(
        { 
          error: 'Erro ao buscar reclamações do Mercado Livre', 
          connected: false,
          details: errorMessage
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
    console.error('[ML Claims API] Erro geral:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno ao processar requisição', 
        details: error instanceof Error ? error.message : String(error),
        connected: false 
      },
      { status: 500 }
    );
  }
}

