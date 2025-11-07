import { RegisterCompanyForm } from '@/components/register-company-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Página de Cadastro de Empresas
 * Self-service para novas empresas
 */
export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl">
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            PósVendas Pro
          </h1>
          <p className="text-slate-600">
            Cadastre sua empresa e comece a gerenciar suas reclamações
          </p>
        </div>
        
        <RegisterCompanyForm />
      </div>
    </div>
  );
}

