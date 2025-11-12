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
  XCircle
} from 'lucide-react';

/**
 * Página de Visualização de Ticket
 * Mostra todos os detalhes do ticket
 */
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
              <p className="text-slate-900 font-semibold">
                {ticket.resolutionTime ? `${ticket.resolutionTime}h` : 'Não informado'}
              </p>
              {ticket.resolutionTime && (
                <p className="text-xs text-slate-500">
                  {Math.floor(ticket.resolutionTime / 24)}d {ticket.resolutionTime % 24}h
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

