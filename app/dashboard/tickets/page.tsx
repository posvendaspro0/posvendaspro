import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { requireClient } from '@/lib/auth-helpers';
import { getTicketsByCompany } from '@/services/ticket-service';
import { TicketsTable } from '@/components/dashboard/tickets-table';
import { MlClaimsTable } from '@/components/dashboard/ml-claims-table';

/**
 * Página de Listagem de Tickets
 * Exibe todos os tickets da empresa + reclamações do Mercado Livre
 */
export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  const session = await requireClient();
  
  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  const tickets = await getTicketsByCompany(session.user.companyId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tickets e Reclamações</h1>
          <p className="text-slate-500 mt-1">
            Gerencie tickets internos e reclamações do Mercado Livre
          </p>
        </div>
        <Link href="/dashboard/tickets/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ticket
          </Button>
        </Link>
      </div>

      {/* Reclamações do Mercado Livre */}
      <MlClaimsTable />

      <Separator className="my-8" />

      {/* Tickets Cadastrados Manualmente */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Tickets Internos</h2>
          <p className="text-sm text-slate-600">
            Tickets cadastrados manualmente no sistema
          </p>
        </div>
        <TicketsTable tickets={tickets} />
      </div>
    </div>
  );
}
