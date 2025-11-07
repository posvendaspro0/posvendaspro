import { ComplaintsTable } from '@/components/dashboard/complaints-table';

/**
 * Página de Listagem de Reclamações
 * Exibe reclamações mockadas preparadas para futura integração
 */
export default function ReclamacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reclamações</h1>
        <p className="text-slate-500 mt-1">
          Gerencie as reclamações dos seus pedidos no Mercado Livre
        </p>
      </div>

      <ComplaintsTable />
    </div>
  );
}

