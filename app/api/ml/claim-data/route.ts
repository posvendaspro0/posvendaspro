/**
 * API Route: Salvar dados complementares de claim ML
 * POST /api/ml/claim-data
 */

import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const mlClaimDataSchema = z.object({
  mlClaimId: z.string(),
  mlOrderId: z.string().optional(),
  responsible: z.string().optional(),
  productSku: z.string().optional(),
  resolutionCost: z.number().optional(),
  observation: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireClient();
    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = mlClaimDataSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Upsert: criar ou atualizar
    const claimData = await prisma.mlClaimData.upsert({
      where: {
        companyId_mlClaimId: {
          companyId,
          mlClaimId: data.mlClaimId,
        },
      },
      update: {
        mlOrderId: data.mlOrderId,
        responsible: data.responsible,
        productSku: data.productSku,
        resolutionCost: data.resolutionCost,
        observation: data.observation,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        mlClaimId: data.mlClaimId,
        mlOrderId: data.mlOrderId,
        responsible: data.responsible,
        productSku: data.productSku,
        resolutionCost: data.resolutionCost,
        observation: data.observation,
      },
    });

    return NextResponse.json({ success: true, claimData });
  } catch (error) {
    console.error('[ML Claim Data API] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados', details: String(error) },
      { status: 500 }
    );
  }
}

