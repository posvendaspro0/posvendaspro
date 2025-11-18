import { notFound } from 'next/navigation';
import { TicketForm } from '@/components/dashboard/ticket-form';
import { getTicketById } from '@/services/ticket-service';
import { requireClient } from '@/lib/auth-helpers';

/**
 * Página de Edição de Ticket
 */
export const dynamic = 'force-dynamic';

export default async function EditarTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  const { id } = await params;
  const ticket = await getTicketById(id, session.user.companyId);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Ticket</h1>
        <p className="text-slate-500 mt-1">
          Atualize as informações do ticket
        </p>
      </div>

      <TicketForm
        mode="edit"
        initialData={{
          id: ticket.id,
          status: ticket.status,
          responsible: ticket.responsible || '',
          complaintDate: ticket.complaintDate 
            ? new Date(ticket.complaintDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          mlOrderId: ticket.mlOrderId || '',
          productSku: ticket.productSku || '',
          problemType: ticket.problemType,
          observation: ticket.observation,
          resolutionDate: ticket.resolutionDate 
            ? new Date(ticket.resolutionDate).toISOString().split('T')[0]
            : '',
          resolutionCost: ticket.resolutionCost 
            ? Number(ticket.resolutionCost).toString()
            : '',
          affectedReputation: ticket.affectedReputation,
          resolutionTime: ticket.resolutionTime?.toString() || '',
          clientName: ticket.clientName || '',
          clientEmail: ticket.clientEmail || '',
        }}
      />
    </div>
  );
}

