import { Suspense } from 'react';
import { requireClient } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { MercadoLivreConnection } from '@/components/dashboard/ml-connection';

/**
 * Página de Integração com Mercado Livre
 * Gerencia conexão OAuth2 e sincronização de dados
 */
export const dynamic = 'force-dynamic';

export default async function IntegracaoPage() {
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  // Busca conta ML ativa da empresa
  const mlAccount = await prisma.mlAccount.findFirst({
    where: {
      companyId: session.user.companyId,
      isActive: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Integração Mercado Livre</h1>
        <p className="text-slate-500 mt-1">
          Conecte sua conta e automatize o gerenciamento de tickets
        </p>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <MercadoLivreConnection 
          isConnected={!!mlAccount} 
          mlUserId={mlAccount?.mercadoLivreUserId}
        />
      </Suspense>
    </div>
  );
}

