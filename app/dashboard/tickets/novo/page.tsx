import { TicketForm } from '@/components/dashboard/ticket-form';
import { requireClient } from '@/lib/auth-helpers';

/**
 * Página de Criação de Novo Ticket
 */
export default async function NovoTicketPage() {
  await requireClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Novo Ticket</h1>
        <p className="text-slate-500 mt-1">
          Cadastre um novo ticket de atendimento
        </p>
      </div>

      <TicketForm mode="create" />
    </div>
  );
}

