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
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 400 }
      );
    }

    // Buscar access token válido
    const accessToken = await getValidAccessToken(companyId);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Conta do Mercado Livre não conectada', connected: false },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      connected: true,
      claims: claims.data || [],
      paging: claims.paging || {},
    });
  } catch (error) {
    console.error('Erro ao buscar reclamações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reclamações', details: String(error) },
      { status: 500 }
    );
  }
}

