import { Suspense } from 'react';
import { LoginForm } from '@/components/login-form';

/**
 * Página de Login
 * Redirecionamento é feito no client-side após login bem-sucedido
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            PósVendas Pro
          </h1>
          <p className="text-slate-600">
            Gestão de Reclamações Mercado Livre
          </p>
        </div>
        
        <Suspense fallback={<div className="text-center">Carregando...</div>}>
          <LoginForm />
        </Suspense>
        
        <p className="text-center text-sm text-slate-500 mt-6">
          Sistema seguro e profissional para gestão de atendimentos
        </p>
      </div>
    </div>
  );
}

