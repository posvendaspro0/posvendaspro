import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAuthorizationUrl } from '@/services/mercadolivre-service';

/**
 * GET /api/ml/auth
 * Redireciona para o Mercado Livre para autenticação OAuth2
 */
export async function GET() {
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

    // Gera URL de autorização do Mercado Livre
    const authUrl = getAuthorizationUrl(session.user.companyId);

    // Redireciona para o Mercado Livre
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Erro ao iniciar autenticação ML:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação' },
      { status: 500 }
    );
  }
}

