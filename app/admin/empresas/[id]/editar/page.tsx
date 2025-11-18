import { notFound } from 'next/navigation';
import { CompanyForm } from '@/components/admin/company-form';
import { getCompanyById } from '@/services/company-service';

/**
 * Página de Edição de Empresa
 */
export const dynamic = 'force-dynamic';

export default async function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Empresa</h1>
        <p className="text-slate-500 mt-1">
          Atualize as informações da empresa
        </p>
      </div>

      <CompanyForm
        mode="edit"
        initialData={{
          id: company.id,
          name: company.name,
          email: company.email,
          cnpj: company.cnpj || undefined,
        }}
      />
    </div>
  );
}

