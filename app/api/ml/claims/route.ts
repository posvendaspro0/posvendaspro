/**
 * API Route: Buscar reclamações do Mercado Livre
 * GET /api/ml/claims
 */

import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth-helpers';
import { getValidAccessToken, getClaims } from '@/services/mercadolivre-service';

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

    // Buscar access token válido
    console.log('[ML Claims API] Buscando token para empresa:', companyId);
    const accessToken = await getValidAccessToken(companyId);
    
    if (!accessToken) {
      console.log('[ML Claims API] Token não encontrado para empresa:', companyId);
      return NextResponse.json(
        { 
          error: 'Conta do Mercado Livre não conectada. Por favor, conecte sua conta na página de Integrações.', 
          connected: false 
        },
        { status: 200 } // Mudar para 200 para não causar erro no frontend
      );
    }

    console.log('[ML Claims API] Token encontrado, buscando reclamações...');

    // Extrair filtros da query string
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || undefined;

    // Buscar reclamações na API do ML
    const claims = await getClaims(accessToken, {
      offset,
      limit,
      status,
    });

    console.log('[ML Claims API] Reclamações encontradas:', claims.data?.length || 0);

    return NextResponse.json({
      connected: true,
      claims: claims.data || [],
      paging: claims.paging || {},
    });
  } catch (error) {
    console.error('[ML Claims API] Erro ao buscar reclamações:', error);
    
    // Se for erro de autenticação da API ML
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Token do Mercado Livre expirado. Reconecte sua conta.', 
          connected: false 
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar reclamações', 
        details: String(error),
        connected: false 
      },
      { status: 500 }
    );
  }
}

