import { CompanyForm } from '@/components/admin/company-form';

/**
 * Página de Criação de Nova Empresa
 */
export default function NovaEmpresaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nova Empresa</h1>
        <p className="text-slate-500 mt-1">
          Cadastre uma nova empresa no sistema
        </p>
      </div>

      <CompanyForm mode="create" />
    </div>
  );
}

