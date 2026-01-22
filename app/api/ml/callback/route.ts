import { NextResponse } from 'next/server';
import { exchangeCodeForTokens, saveMlAccount } from '@/services/mercadolivre-service';

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

    console.log('[ML Callback] ========================================');
    console.log('[ML Callback] 🔗 CONECTANDO CONTA MERCADO LIVRE');
    console.log('[ML Callback] ========================================');
    console.log('[ML Callback] Company ID:', companyId);
    console.log('[ML Callback] Code recebido:', code.substring(0, 20) + '...');

    // Troca o código pelos tokens
    const tokens = await exchangeCodeForTokens(code);

    console.log('[ML Callback] ✅ Tokens obtidos com sucesso');
    console.log('[ML Callback] User ID ML:', tokens.userId);
    console.log('[ML Callback] Expira em:', tokens.expiresIn, 'segundos');

    // 🎯 USAR saveMlAccount que mantém connectedAt da 1a conexão
    await saveMlAccount(
      companyId,
      String(tokens.userId),
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresIn
    );

    console.log('[ML Callback] ========================================');
    console.log('[ML Callback] ✅ CONTA CONECTADA COM SUCESSO!');
    console.log('[ML Callback] ✅ connectedAt mantido na 1a conexão');
    console.log('[ML Callback] ========================================');

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

