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
  mlOrderId: z.string().optional().nullable(),
  responsible: z.string().optional().nullable(),
  productSku: z.string().optional().nullable(),
  problemType: z.string().optional().nullable(),
  resolutionCost: z.union([z.number(), z.string()]).optional().nullable(),
  observation: z.string().optional().nullable(),
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
    console.log('[ML Claim Data API] Recebido body:', body);
    
    const validation = mlClaimDataSchema.safeParse(body);

    if (!validation.success) {
      console.error('[ML Claim Data API] Erro de validação:', validation.error.issues);
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Converter resolutionCost para number se for string
    const resolutionCost = data.resolutionCost 
      ? (typeof data.resolutionCost === 'string' ? parseFloat(data.resolutionCost) : data.resolutionCost)
      : null;

    // Converter strings vazias para null
    const cleanData = {
      mlOrderId: data.mlOrderId || null,
      responsible: data.responsible || null,
      productSku: data.productSku || null,
      problemType: data.problemType || null,
      resolutionCost: resolutionCost,
      observation: data.observation || null,
    };

    console.log('[ML Claim Data API] Dados limpos:', cleanData);

    // Upsert: criar ou atualizar
    const claimData = await prisma.mlClaimData.upsert({
      where: {
        companyId_mlClaimId: {
          companyId,
          mlClaimId: data.mlClaimId,
        },
      },
      update: {
        ...cleanData,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        mlClaimId: data.mlClaimId,
        ...cleanData,
      },
    });

    console.log('[ML Claim Data API] Dados salvos:', claimData.id);

    return NextResponse.json({ success: true, claimData });
  } catch (error) {
    console.error('[ML Claim Data API] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados', details: String(error) },
      { status: 500 }
    );
  }
}

