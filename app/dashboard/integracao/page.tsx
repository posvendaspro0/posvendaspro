import { requireClient } from '@/lib/auth-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Link as LinkIcon, Zap, RefreshCw, Shield } from 'lucide-react';

/**
 * Página de Integração com Mercado Livre
 * Em desenvolvimento - Em breve
 */
export default async function IntegracaoPage() {
  await requireClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Integração Mercado Livre</h1>
        <p className="text-slate-500 mt-1">
          Conecte sua conta e automatize o gerenciamento de tickets
        </p>
      </div>

      {/* Card de "Em Breve" */}
      <Card className="border-2 border-dashed border-slate-300">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 p-6 mb-6">
            <LinkIcon className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Em Breve: Integração Completa com Mercado Livre
          </h2>
          
          <p className="text-slate-600 text-center max-w-md mb-8">
            Conecte sua conta do Mercado Livre e importe automaticamente suas reclamações, pedidos e dados dos clientes.
          </p>

          {/* Preview de Recursos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-3">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Importação Automática
              </h3>
              <p className="text-sm text-slate-600">
                Tickets criados automaticamente das reclamações do ML
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Sincronização Bidirecional
              </h3>
              <p className="text-sm text-slate-600">
                Atualizações automáticas entre o sistema e o ML
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Conexão Segura
              </h3>
              <p className="text-sm text-slate-600">
                OAuth2 com tokens criptografados
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                <LinkIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Múltiplas Contas
              </h3>
              <p className="text-sm text-slate-600">
                Conecte várias contas do Mercado Livre
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              🔌 <span className="font-medium">Em desenvolvimento:</span> A integração será liberada em breve!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

