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

    // Desativa a conta ML (não deleta para manter histórico)
    await prisma.mlAccount.updateMany({
      where: {
        companyId: session.user.companyId,
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Conta do Mercado Livre desconectada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao desconectar ML:', error);
    return NextResponse.json(
      { error: 'Erro ao desconectar conta' },
      { status: 500 }
    );
  }
}

