import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { requireClient } from '@/lib/auth-helpers';
import { getTicketsByCompany } from '@/services/ticket-service';
import { TicketsTable } from '@/components/dashboard/tickets-table';

/**
 * Página de Listagem de Tickets
 * Exibe todos os tickets da empresa
 */
export default async function TicketsPage() {
  const session = await requireClient();
  
  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  const tickets = await getTicketsByCompany(session.user.companyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os tickets de atendimento da sua empresa
          </p>
        </div>
        <Link href="/dashboard/tickets/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ticket
          </Button>
        </Link>
      </div>

      <TicketsTable tickets={tickets} />
    </div>
  );
}
