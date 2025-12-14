import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireClient } from '@/lib/auth-helpers';
import { getValidAccessToken, getClaim, getMlAccountByCompanyId } from '@/services/mercadolivre-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { MlClaimEditForm } from '@/components/dashboard/ml-claim-edit-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Página de Detalhes e Edição de Reclamação do ML
 */
export const dynamic = 'force-dynamic';

export default async function MlClaimDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireClient();
  const { id: claimId } = await params;

  if (!session.user.companyId) {
    redirect('/dashboard');
  }

  // Buscar dados do ML
  const mlAccount = await getMlAccountByCompanyId(session.user.companyId);
  
  if (!mlAccount) {
    redirect('/dashboard/integracao');
  }

  const accessToken = await getValidAccessToken(session.user.companyId);
  
  if (!accessToken) {
    redirect('/dashboard/integracao');
  }

  // Buscar detalhes da claim no ML
  let claimData;
  try {
    claimData = await getClaim(accessToken, claimId);
  } catch (error) {
    console.error('Erro ao buscar claim:', error);
    notFound();
  }

  // Mapear status
  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
    opened: { label: 'Não Iniciada', color: 'bg-slate-100 text-slate-600', icon: '⚪' },
    closed: { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: '🟢' },
    won: { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: '🟢' },
    lost: { label: 'Concluído', color: 'bg-red-100 text-red-800', icon: '🔴' },
  };

  if (claimData.stage === 'dispute' || claimData.stage === 'mediation') {
    statusMap[claimData.status] = { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: '🔵' };
  }

  const status = statusMap[claimData.status] || statusMap.opened;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tickets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Reclamação ML-{claimData.id}
            </h1>
            <p className="text-slate-500 mt-1">
              Detalhes e edição da reclamação
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a
              href={`https://www.mercadolivre.com.br/vendas/${claimData.resource_id || claimData.resource?.id}/detalhes`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no Mercado Livre
            </a>
          </Button>
        </div>
      </div>

      {/* Informações da API ML (Não editáveis) */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Mercado Livre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-slate-600">Status</span>
              <div className="mt-1">
                <Badge className={status.color}>
                  {status.icon} {status.label}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-600">Etapa</span>
              <p className="text-slate-900 mt-1">{claimData.stage}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-600">ID da Claim</span>
              <p className="text-slate-900 font-mono text-sm mt-1">{claimData.id}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-600">ID do Pedido</span>
              <p className="text-slate-900 font-mono text-sm mt-1">
                {claimData.resource_id || claimData.resource?.id || '-'}
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-600">Data de Criação</span>
              <p className="text-slate-900 mt-1">
                {claimData.date_created 
                  ? format(new Date(claimData.date_created), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                  : '-'}
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-600">Motivo (ML)</span>
              <p className="text-slate-900 mt-1">
                {claimData.reason?.name || claimData.reason || 'Não especificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Formulário de Edição (Dados complementares) */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Complementares (Editável)</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Preencha os dados que o Mercado Livre não fornece automaticamente
          </p>
        </CardHeader>
        <CardContent>
          <MlClaimEditForm
            companyId={session.user.companyId}
            mlClaimId={claimData.id}
            mlOrderId={claimData.resource_id || claimData.resource?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}



