/**
 * API Route: Verificar status da conexão do Mercado Livre
 * GET /api/ml/status
 */

import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth-helpers';
import { getMlAccountByCompanyId, getValidAccessToken } from '@/services/mercadolivre-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireClient();

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json({
        connected: false,
        error: 'Usuário não está vinculado a uma empresa',
        details: null,
      });
    }

    let mlAccount = await getMlAccountByCompanyId(companyId);

    if (!mlAccount) {
      return NextResponse.json({
        connected: false,
        error: 'Nenhuma conta do Mercado Livre conectada',
        details: {
          companyId,
          hasAccount: false,
        },
      });
    }

    // Verificar se o token está expirado
    const now = new Date();
    let expiresAt = new Date(mlAccount.expiresAt);
    let isExpired = expiresAt.getTime() < now.getTime();
    let timeUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000 / 60);

    // Se expirado, tenta renovar automaticamente
    if (isExpired) {
      await getValidAccessToken(companyId);
      mlAccount = await getMlAccountByCompanyId(companyId);
      if (mlAccount) {
        expiresAt = new Date(mlAccount.expiresAt);
        isExpired = expiresAt.getTime() < now.getTime();
        timeUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000 / 60);
      }
    }

    if (!mlAccount) {
      return NextResponse.json({
        connected: false,
        error: 'Nenhuma conta do Mercado Livre conectada',
        details: {
          companyId,
          hasAccount: false,
        },
      });
    }

    return NextResponse.json({
      connected: !isExpired,
      details: {
        companyId,
        mercadoLivreUserId: mlAccount.mercadoLivreUserId,
        isActive: mlAccount.isActive,
        expiresAt: mlAccount.expiresAt,
        isExpired,
        timeUntilExpiry: isExpired ? 0 : timeUntilExpiry,
        createdAt: mlAccount.createdAt,
        updatedAt: mlAccount.updatedAt,
      },
    });
  } catch (error) {
    console.error('[ML Status API] Erro:', error);
    return NextResponse.json({
      connected: false,
      error: 'Erro ao verificar status',
      details: String(error),
    });
  }
}



