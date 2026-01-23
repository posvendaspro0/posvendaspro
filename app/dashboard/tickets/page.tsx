import { requireClient } from '@/lib/auth-helpers';
import { MlClaimsTable } from '@/components/dashboard/ml-claims-table';

/**
 * Página de Listagem de Reclamações do Mercado Livre
 * Exibe apenas reclamações vindas do Mercado Livre
 */
export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  const session = await requireClient();
  
  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  return (
    <div className="space-y-6">
      {/* Reclamações do Mercado Livre */}
      <MlClaimsTable />
    </div>
  );
}
