import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTicketById } from '@/services/ticket-service';
import { requireClient } from '@/lib/auth-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DeleteTicketButton } from '@/components/dashboard/delete-ticket-button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatResolutionTimeDetailed, getResolutionTimeColor } from '@/lib/time-utils';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  Package, 
  AlertCircle,
  DollarSign,
  Clock,
  TrendingDown,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  Activity
} from 'lucide-react';

/**
 * Página de Visualização de Ticket
 * Mostra todos os detalhes do ticket
 */
export const dynamic = 'force-dynamic';

export default async function VisualizarTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  const { id } = await params;
  const ticket = await getTicketById(id, session.user.companyId);

  if (!ticket) {
    notFound();
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Pendente', color: 'bg-orange-100 text-orange-800' },
    IN_PROGRESS: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
    RESOLVED: { label: 'Resolvido', color: 'bg-green-100 text-green-800' },
    CLOSED: { label: 'Fechado', color: 'bg-slate-100 text-slate-800' },
  };

  const problemTypeLabels: Record<string, string> = {
    PRODUCT_NOT_RECEIVED: 'Produto não recebido',
    PRODUCT_DEFECTIVE: 'Produto com defeito',
    WRONG_PRODUCT: 'Produto errado',
    LATE_DELIVERY: 'Entrega atrasada',
    DAMAGED_PACKAGE: 'Embalagem danificada',
    RETURN_REQUEST: 'Solicitação de devolução',
    OTHER: 'Outro',
  };

  const status = statusConfig[ticket.status];

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
              Ticket {ticket.id}
            </h1>
            <p className="text-slate-500 mt-1">
              Visualize todos os detalhes do ticket
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/tickets/${ticket.id}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <DeleteTicketButton ticketId={ticket.id} />
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Status</span>
              </div>
              <Badge className={status.color + ' text-sm px-3 py-1'}>
                {status.label}
              </Badge>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <User className="h-4 w-4" />
                <span className="font-medium">Responsável</span>
              </div>
              <p className="text-slate-900">{ticket.responsible || 'Não atribuído'}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Data da Reclamação</span>
              </div>
              <p className="text-slate-900">
                {ticket.complaintDate 
                  ? format(new Date(ticket.complaintDate), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })
                  : 'Não informada'}
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Package className="h-4 w-4" />
                <span className="font-medium">Tipo de Problema</span>
              </div>
              <p className="text-slate-900">{problemTypeLabels[ticket.problemType]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.mlOrderId && (
              <>
                <div>
                  <span className="text-sm font-medium text-slate-600">ID Pedido ML</span>
                  <p className="text-slate-900 font-mono">{ticket.mlOrderId}</p>
                </div>
                <Separator />
              </>
            )}

            <div>
              <span className="text-sm font-medium text-slate-600">SKU do Produto</span>
              <p className="text-slate-900 font-mono">{ticket.productSku || 'Não informado'}</p>
            </div>

            {ticket.clientName && (
              <>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-slate-600">Cliente</span>
                  <p className="text-slate-900">{ticket.clientName}</p>
                  {ticket.clientEmail && (
                    <p className="text-sm text-slate-500">{ticket.clientEmail}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Observação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 whitespace-pre-wrap">{ticket.observation}</p>
        </CardContent>
      </Card>

      {/* Seção: Reclamação (Claim do Mercado Livre) */}
      {ticket.mlOrderId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Reclamação (Mercado Livre)</CardTitle>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Integração API ML
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações da Claim */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Detalhes da Reclamação
              </h4>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-slate-600">ID da Claim</span>
                    <p className="text-slate-900 font-mono text-sm">
                      {ticket.mlComplaintId || 'Aguardando sincronização...'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Status da Claim</span>
                    <p className="text-slate-900">
                      {ticket.mlStatus || 'Não disponível'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <span className="text-sm font-medium text-slate-600">Motivo da Reclamação</span>
                  <p className="text-slate-700 mt-1">
                    {problemTypeLabels[ticket.problemType]}
                  </p>
                </div>
              </div>
            </div>

            {/* Histórico de Eventos */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Histórico de Eventos
              </h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-3">
                  {/* Timeline de eventos (mockado - será preenchido pela API) */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="w-0.5 h-full bg-slate-300 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-slate-900">Reclamação aberta</p>
                      <p className="text-xs text-slate-500">
                        {ticket.complaintDate 
                          ? format(new Date(ticket.complaintDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  
                  {ticket.resolutionDate && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Reclamação resolvida</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(ticket.resolutionDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ℹ️ <strong>Integração em desenvolvimento:</strong> O histórico completo de eventos será carregado automaticamente da API do Mercado Livre quando a integração estiver ativa.
                  </p>
                </div>
              </div>
            </div>

            {/* Ações Tomadas na Claim */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Ações Tomadas
              </h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid gap-3">
                  {/* Status das ações */}
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Status da Ação</p>
                      <p className="text-sm text-slate-500">Última atualização da claim</p>
                    </div>
                    <Badge className={statusConfig[ticket.status].color}>
                      {statusConfig[ticket.status].label}
                    </Badge>
                  </div>

                  {/* Possíveis ações da API ML */}
                  <div className="p-3 bg-white rounded border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Ações disponíveis via API ML:</strong>
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4">
                      <li>• Aceitar reclamação</li>
                      <li>• Recusar reclamação</li>
                      <li>• Entrar em disputa</li>
                      <li>• Enviar mensagem ao comprador</li>
                      <li>• Solicitar mediação do ML</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Resolução */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resolução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Data de Resolução</span>
              </div>
              <p className="text-slate-900">
                {ticket.resolutionDate
                  ? format(new Date(ticket.resolutionDate), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })
                  : 'Não resolvido'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Custo</span>
              </div>
              <p className="text-slate-900 font-semibold">
                {ticket.resolutionCost
                  ? `R$ ${Number(ticket.resolutionCost).toFixed(2)}`
                  : 'Não informado'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Tempo de Resolução</span>
              </div>
              {ticket.resolutionTime ? (
                <>
                  <p className="text-slate-900 font-semibold">
                    {formatResolutionTimeDetailed(ticket.resolutionTime)}
                  </p>
                  <Badge className={`${getResolutionTimeColor(ticket.resolutionTime).color} text-xs mt-1`}>
                    {getResolutionTimeColor(ticket.resolutionTime).label}
                  </Badge>
                </>
              ) : (
                <p className="text-slate-500">
                  {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' 
                    ? 'Calculado automaticamente' 
                    : 'Aguardando resolução'}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="font-medium">Afetou Reputação</span>
              </div>
              <div className="flex items-center gap-2">
                {ticket.affectedReputation ? (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 font-medium">Sim</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-medium">Não</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-slate-600">Criado em</span>
              <p className="text-slate-900">
                {format(new Date(ticket.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600">Última atualização</span>
              <p className="text-slate-900">
                {format(new Date(ticket.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

