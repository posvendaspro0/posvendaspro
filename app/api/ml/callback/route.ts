import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exchangeCodeForTokens } from '@/services/mercadolivre-service';

/**
 * GET /api/ml/callback
 * Recebe o código de autorização do ML e troca pelos tokens
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const companyId = searchParams.get('state'); // O state contém o ID da empresa

    if (!code || !companyId) {
      return NextResponse.redirect(
        new URL('/dashboard/integracao?error=invalid_params', request.url)
      );
    }

    // Troca o código pelos tokens
    const tokens = await exchangeCodeForTokens(code);

    // Calcula data de expiração
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    // Verifica se já existe uma conta ML para essa empresa
    const existingAccount = await prisma.mlAccount.findFirst({
      where: { companyId },
    });

    if (existingAccount) {
      // Atualiza a conta existente
      await prisma.mlAccount.update({
        where: { id: existingAccount.id },
        data: {
          mercadoLivreUserId: String(tokens.userId),
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    } else {
      // Cria nova conta ML
      await prisma.mlAccount.create({
        data: {
          companyId,
          mercadoLivreUserId: String(tokens.userId),
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
          isActive: true,
        },
      });
    }

    // Redireciona de volta para a página de integração com sucesso
    return NextResponse.redirect(
      new URL('/dashboard/integracao?success=connected', request.url)
    );
  } catch (error) {
    console.error('Erro no callback ML:', error);
    return NextResponse.redirect(
      new URL('/dashboard/integracao?error=auth_failed', new URL(request.url).origin)
    );
  }
}

