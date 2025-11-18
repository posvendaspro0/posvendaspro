import { notFound } from 'next/navigation';
import { requireClient } from '@/lib/auth-helpers';
import { getOperatorById } from '@/services/operator-service';
import { OperatorForm } from '@/components/dashboard/operator-form';

/**
 * Página de Edição de Operador
 */
export const dynamic = 'force-dynamic';

export default async function EditarOperadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  const { id } = await params;
  const operator = await getOperatorById(id, session.user.companyId);

  if (!operator) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Operador</h1>
        <p className="text-slate-500 mt-1">
          Atualize as informações do operador
        </p>
      </div>

      <OperatorForm
        mode="edit"
        initialData={{
          id: operator.id,
          name: operator.name,
          email: operator.email,
          password: '',
          isActive: operator.isActive,
        }}
      />
    </div>
  );
}

