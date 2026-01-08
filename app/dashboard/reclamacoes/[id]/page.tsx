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

// Tradução dos tipos de claim do Mercado Livre
const getClaimTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    mediations: 'Mediação',
    return: 'Devolução',
    fulfillment: 'Full Envios',
    ml_case: 'Cancelamento (Comprador)',
    cancel_sale: 'Cancelamento (Vendedor)',
    cancel_purchase: 'Cancelamento (Comprador)',
    change: 'Troca de Produto',
    service: 'Cancelamento de Serviço',
  };
  return types[type] || type;
};

// Cor do badge por tipo
const getClaimTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    mediations: 'bg-blue-100 text-blue-800 border-blue-200',
    return: 'bg-purple-100 text-purple-800 border-purple-200',
    fulfillment: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    ml_case: 'bg-orange-100 text-orange-800 border-orange-200',
    cancel_sale: 'bg-red-100 text-red-800 border-red-200',
    cancel_purchase: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    change: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    service: 'bg-pink-100 text-pink-800 border-pink-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Descrição detalhada do tipo
const getClaimTypeDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    mediations: 'Reclamação entre comprador e vendedor',
    return: 'Devolução do produto. Não há mensagens, para devoluções siga a documentação devoluções',
    fulfillment: 'Reclamação entre comprador e Mercado Livre com origem de compra com envio full',
    ml_case: 'Cancelamento da compra por parte do comprador devido a envio demorado',
    cancel_sale: 'Cancelamento da compra por parte do vendedor',
    cancel_purchase: 'Cancelamento da compra por parte do comprador',
    change: 'Mudanças de produto. Indica que será realizada uma troca do produto',
    service: 'Cancelamento de um serviço de ordens bundle',
  };
  return descriptions[type] || 'Tipo de reclamação não especificado';
};

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
              <span className="text-sm font-medium text-slate-600">Tipo de Reclamação</span>
              <div className="mt-1">
                <Badge variant="outline" className={`${getClaimTypeColor(claimData.type)} border font-medium`}>
                  {getClaimTypeLabel(claimData.type)}
                </Badge>
                <p className="text-xs text-slate-500 mt-1">
                  {getClaimTypeDescription(claimData.type)}
                </p>
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



