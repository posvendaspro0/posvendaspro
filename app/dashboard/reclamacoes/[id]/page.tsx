import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireClient } from '@/lib/auth-helpers';
import { getValidAccessToken, getClaim, getMlAccountByCompanyId } from '@/services/mercadolivre-service';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Hash, 
  Layers, 
  Tag 
} from 'lucide-react';
import { MlClaimEditForm } from '@/components/dashboard/ml-claim-edit-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tradução dos tipos de claim do Mercado Livre
const getClaimTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    mediations: 'Reclamação',
    return: 'Devolução',
    returns: 'Devolução', // API ML usa "returns" (plural)
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
    returns: 'bg-purple-100 text-purple-800 border-purple-200', // API ML usa "returns" (plural)
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
    returns: 'Devolução do produto. Não há mensagens, para devoluções siga a documentação devoluções', // API ML usa "returns" (plural)
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

  // Buscar dados complementares já salvos no banco (para abrir rápido)
  const complementary = await prisma.mlClaimData.findUnique({
    where: {
      companyId_mlClaimId: {
        companyId: session.user.companyId,
        mlClaimId: claimId,
      },
    },
  });

  const complementaryData = complementary
    ? {
        responsible: complementary.responsible ?? '',
        productSku: complementary.productSku ?? '',
        problemType: complementary.problemType ?? '',
        resolutionCost: complementary.resolutionCost
          ? complementary.resolutionCost.toString()
          : '',
        observation: complementary.observation ?? '',
      }
    : undefined;

  // Mapear STATUS
  let status = { 
    label: 'Aberta', 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: <AlertCircle className="h-3.5 w-3.5" /> 
  };
  
  if (claimData.status === 'closed' || claimData.status === 'won') {
    status = { 
      label: 'Concluído', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: <CheckCircle2 className="h-3.5 w-3.5" /> 
    };
  } else if (claimData.status === 'lost') {
    status = { 
      label: 'Perdida', 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: <XCircle className="h-3.5 w-3.5" /> 
    };
  } else if (claimData.status === 'opened') {
    status = { 
      label: 'Aberta', 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      icon: <AlertCircle className="h-3.5 w-3.5" /> 
    };
  }

  // Mapear ETAPA (stage)
  const getStageInfo = (stage: string) => {
    const stages: Record<string, { label: string; description: string; color: string }> = {
      claim: { 
        label: 'Reclamação', 
        description: 'Etapa onde intervém o comprador e o vendedor',
        color: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      dispute: { 
        label: 'Mediação', 
        description: 'Etapa onde intervém um representante do Mercado Livre',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      recontact: { 
        label: 'Recontato', 
        description: 'Uma parte entra em contato após o fechamento',
        color: 'bg-violet-100 text-violet-800 border-violet-200'
      },
      none: { 
        label: 'N/A', 
        description: 'Não se aplica',
        color: 'bg-slate-100 text-slate-800 border-slate-200'
      },
      stale: { 
        label: 'ML Case', 
        description: 'Intervém comprador e ML para reclamações ml_case',
        color: 'bg-amber-100 text-amber-800 border-amber-200'
      },
    };
    return stages[stage] || { label: stage, description: 'Etapa não mapeada', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const stageInfo = getStageInfo(claimData.stage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Resumo */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Status</span>
              </div>
              <Badge variant="outline" className={`${status.color} border font-medium w-fit`}>
                <span className="mr-1">{status.icon}</span>
                {status.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Tag className="h-3.5 w-3.5" />
                <span>Tipo de Reclamação</span>
              </div>
              <Badge variant="outline" className={`${getClaimTypeColor(claimData.type)} border font-medium w-fit`}>
                {getClaimTypeLabel(claimData.type)}
              </Badge>
              <p className="text-xs text-slate-500">{getClaimTypeDescription(claimData.type)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Layers className="h-3.5 w-3.5" />
                <span>Etapa (Stage)</span>
              </div>
              <Badge variant="outline" className={`${stageInfo.color} border font-medium w-fit`}>
                {stageInfo.label}
              </Badge>
              <p className="text-xs text-slate-500">{stageInfo.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Data de Criação</span>
              </div>
              <p className="text-sm text-slate-900 font-medium">
                {claimData.date_created
                  ? format(new Date(claimData.date_created), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da API ML (Não editáveis) */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informações do Mercado Livre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Hash className="h-4 w-4" />
                <span className="font-medium">ID da Claim</span>
              </div>
              <p className="text-slate-900 font-mono text-sm">{claimData.id}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Hash className="h-4 w-4" />
                <span className="font-medium">ID do Pedido</span>
              </div>
              <p className="text-slate-900 font-mono text-sm">
                {claimData.resource_id || claimData.resource?.id || '-'}
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Motivo (ML)</span>
              </div>
              <p className="text-slate-900">
                {claimData.reason?.name || claimData.reason || 'Não especificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Formulário de Edição (Dados complementares) */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informações Complementares (Editável)</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Preencha os dados que o Mercado Livre não fornece automaticamente
          </p>
        </CardHeader>
        <CardContent>
          <MlClaimEditForm
            companyId={session.user.companyId}
            mlClaimId={claimData.id}
            mlOrderId={claimData.resource_id || claimData.resource?.id}
            initialData={complementaryData}
          />
        </CardContent>
      </Card>
    </div>
  );
}



