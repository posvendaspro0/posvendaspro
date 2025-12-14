import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ml/disconnect
 * Desconecta a conta do Mercado Livre
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 400 }
      );
    }

    const companyId = session.user.companyId;

    // 1. Deletar todos os dados complementares das claims
    await prisma.mlClaimData.deleteMany({
      where: {
        companyId,
      },
    });

    console.log('[ML Disconnect] Dados complementares deletados');

    // 2. Deletar a conta ML (limpar tudo para reconexão limpa)
    await prisma.mlAccount.deleteMany({
      where: {
        companyId,
      },
    });

    console.log('[ML Disconnect] Conta ML deletada');

    return NextResponse.json({
      success: true,
      message: 'Conta do Mercado Livre desconectada com sucesso. Todos os dados foram limpos.',
    });
  } catch (error) {
    console.error('Erro ao desconectar ML:', error);
    return NextResponse.json(
      { error: 'Erro ao desconectar conta' },
      { status: 500 }
    );
  }
}

