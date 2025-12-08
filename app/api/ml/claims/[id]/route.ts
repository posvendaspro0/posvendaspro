/**
 * API Route: Buscar detalhes de uma reclamação específica do Mercado Livre
 * GET /api/ml/claims/[id]
 */

import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth-helpers';
import {
  getValidAccessToken,
  getClaim,
  getClaimMessages,
  getClaimActionsHistory,
  getClaimStatusHistory,
  getClaimAffectsReputation,
} from '@/services/mercadolivre-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClient();

    const { id: claimId } = await params;
    const companyId = session.user.companyId;

    // Buscar access token válido
    const accessToken = await getValidAccessToken(companyId);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Conta do Mercado Livre não conectada', connected: false },
        { status: 401 }
      );
    }

    // Buscar dados em paralelo
    const [claim, messages, actionsHistory, statusHistory, affectsReputation] = await Promise.all([
      getClaim(accessToken, claimId),
      getClaimMessages(accessToken, claimId).catch(() => []),
      getClaimActionsHistory(accessToken, claimId).catch(() => []),
      getClaimStatusHistory(accessToken, claimId).catch(() => []),
      getClaimAffectsReputation(accessToken, claimId).catch(() => null),
    ]);

    return NextResponse.json({
      connected: true,
      claim,
      messages,
      actionsHistory,
      statusHistory,
      affectsReputation,
    });
  } catch (error) {
    console.error('Erro ao buscar reclamação:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reclamação', details: String(error) },
      { status: 500 }
    );
  }
}

