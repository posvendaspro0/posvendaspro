import { requireClient } from '@/lib/auth-helpers';
import { OperatorForm } from '@/components/dashboard/operator-form';

/**
 * Página de Criação de Operador
 */
export default async function NovoOperadorPage() {
  await requireClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Novo Operador</h1>
        <p className="text-slate-500 mt-1">
          Cadastre um novo operador para gerenciar os tickets
        </p>
      </div>

      <OperatorForm mode="create" />
    </div>
  );
}

