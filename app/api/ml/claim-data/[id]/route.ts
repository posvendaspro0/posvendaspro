/**
 * API Route: Buscar dados complementares de claim ML
 * GET /api/ml/claim-data/[id]
 */

import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClient();
    const companyId = session.user.companyId;
    const { id: mlClaimId } = await params;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 400 }
      );
    }

    const claimData = await prisma.mlClaimData.findUnique({
      where: {
        companyId_mlClaimId: {
          companyId,
          mlClaimId,
        },
      },
    });

    // Se não existe, retorna 200 com claimData null (não é erro)
    return NextResponse.json({
      claimData: claimData ? {
        ...claimData,
        resolutionCost: claimData.resolutionCost ? Number(claimData.resolutionCost) : 0,
      } : null,
    });
  } catch (error) {
    console.error('[ML Claim Data API] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados', details: String(error) },
      { status: 500 }
    );
  }
}

