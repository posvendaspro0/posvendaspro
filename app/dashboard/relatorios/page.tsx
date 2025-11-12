import { requireClient } from '@/lib/auth-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Calendar, DollarSign } from 'lucide-react';

/**
 * Página de Relatórios
 * Em desenvolvimento - Em breve
 */
export default async function RelatoriosPage() {
  await requireClient();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
        <p className="text-slate-500 mt-1">
          Análises e insights sobre seus tickets
        </p>
      </div>

      {/* Card de "Em Breve" */}
      <Card className="border border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-slate-100 p-6 mb-6">
            <BarChart3 className="h-12 w-12 text-slate-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Em Breve: Relatórios Avançados
          </h2>
          
          <p className="text-slate-600 text-center max-w-md mb-8">
            Estamos preparando relatórios completos e dashboards analíticos para você acompanhar o desempenho do seu atendimento.
          </p>

          {/* Preview de Recursos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
            <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <TrendingUp className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Análise de Tendências
              </h3>
              <p className="text-sm text-slate-600">
                Acompanhe a evolução dos seus tickets ao longo do tempo
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <Calendar className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Tempo de Resolução
              </h3>
              <p className="text-sm text-slate-600">
                Métricas de performance e SLA do seu time
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <DollarSign className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Custos de Resolução
              </h3>
              <p className="text-sm text-slate-600">
                Análise financeira dos custos com reclamações
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <BarChart3 className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Tipos de Problemas
              </h3>
              <p className="text-sm text-slate-600">
                Identifique os problemas mais frequentes
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              <span className="font-medium">Dica:</span> Continue cadastrando seus tickets para ter dados ricos em seus relatórios!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

