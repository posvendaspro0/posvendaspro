import Link from 'next/link';
import { requireClient } from '@/lib/auth-helpers';
import { getOperatorsByCompany } from '@/services/operator-service';
import { Button } from '@/components/ui/button';
import { OperatorsTable } from '@/components/dashboard/operators-table';
import { UserPlus } from 'lucide-react';

/**
 * Página de Listagem de Operadores
 * Mostra todos os operadores da empresa
 */
export default async function OperadoresPage() {
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  const operators = await getOperatorsByCompany(session.user.companyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operadores</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os operadores que podem administrar os tickets
          </p>
        </div>
        <Link href="/dashboard/operadores/novo">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Operador
          </Button>
        </Link>
      </div>

      {operators.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <UserPlus className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Nenhum operador cadastrado
          </h3>
          <p className="mt-2 text-slate-500">
            Comece cadastrando seu primeiro operador
          </p>
          <Link href="/dashboard/operadores/novo">
            <Button className="mt-4">
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar Operador
            </Button>
          </Link>
        </div>
      ) : (
        <OperatorsTable operators={operators} />
      )}
    </div>
  );
}

