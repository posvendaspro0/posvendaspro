import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getAllCompanies } from '@/services/company-service';
import { CompanyTable } from '@/components/admin/company-table';

/**
 * Página de Listagem de Empresas
 * Lista todas as empresas cadastradas no sistema
 */
export const dynamic = 'force-dynamic';

export default async function EmpresasPage() {
  const companies = await getAllCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500 mt-1">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
        <Link href="/admin/empresas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        </Link>
      </div>

      <CompanyTable companies={companies} />
    </div>
  );
}

