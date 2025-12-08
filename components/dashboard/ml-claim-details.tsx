'use client';

/**
 * Componente: Detalhes da Reclamação do Mercado Livre
 * Busca e exibe dados reais da API de Claims do ML
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  TrendingDown,
  Clock,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClaimData {
  connected: boolean;
  claim: any;
  messages: any[];
  actionsHistory: any[];
  statusHistory: any[];
  affectsReputation: any;
}

interface MlClaimDetailsProps {
  mlOrderId: string;
  ticketStatus: string;
}

export function MlClaimDetails({ mlOrderId, ticketStatus }: MlClaimDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaimData() {
      try {
        setLoading(true);
        setError(null);

        // Primeiro, buscar lista de claims para encontrar a claim do pedido
        const claimsResponse = await fetch(`/api/ml/claims?limit=50`);
        
        if (!claimsResponse.ok) {
          throw new Error('Erro ao buscar reclamações');
        }

        const claimsData = await claimsResponse.json();

        if (!claimsData.connected) {
          setError('Conta do Mercado Livre não conectada');
          return;
        }

        // Procurar claim relacionada ao pedido
        const claim = claimsData.claims?.find((c: any) => 
          c.resource_id === mlOrderId || 
          c.resource?.id === mlOrderId
        );

        if (!claim) {
          setError('Nenhuma reclamação encontrada para este pedido');
          return;
        }

        setClaimId(claim.id);

        // Buscar detalhes completos da claim
        const detailsResponse = await fetch(`/api/ml/claims/${claim.id}`);
        
        if (!detailsResponse.ok) {
          throw new Error('Erro ao buscar detalhes da reclamação');
        }

        const details = await detailsResponse.json();
        setClaimData(details);
      } catch (err) {
        console.error('Erro ao buscar dados da claim:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchClaimData();
  }, [mlOrderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Carregando dados do Mercado Livre...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Informação:</strong> {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!claimData || !claimData.claim) {
    return (
      <Alert className="border-slate-200 bg-slate-50">
        <AlertCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          Nenhuma reclamação encontrada para este pedido no Mercado Livre.
        </AlertDescription>
      </Alert>
    );
  }

  const { claim, messages, actionsHistory, statusHistory, affectsReputation } = claimData;

  // Mapeamento de status
  const stageLabels: Record<string, string> = {
    claim: 'Reclamação',
    dispute: 'Disputa',
    mediation: 'Mediação',
    closed: 'Fechada',
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    opened: { label: 'Aberta', color: 'bg-orange-100 text-orange-800' },
    closed: { label: 'Fechada', color: 'bg-slate-100 text-slate-800' },
    won: { label: 'Ganha', color: 'bg-green-100 text-green-800' },
    lost: { label: 'Perdida', color: 'bg-red-100 text-red-800' },
  };

  const currentStatus = statusLabels[claim.status] || { label: claim.status, color: 'bg-slate-100 text-slate-800' };

  return (
    <div className="space-y-6">
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
              <div className="flex items-center gap-2">
                <p className="text-slate-900 font-mono text-sm">{claim.id}</p>
                <a
                  href={`https://www.mercadolivre.com.br/vendas/${mlOrderId}/reclamacao/${claim.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600">Status</span>
              <Badge className={currentStatus.color + ' text-sm px-2 py-1'}>
                {currentStatus.label}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-slate-600">Etapa</span>
              <p className="text-slate-900">{stageLabels[claim.stage] || claim.stage}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600">Tipo</span>
              <p className="text-slate-900">{claim.type || 'N/A'}</p>
            </div>
          </div>

          {claim.reason && (
            <>
              <Separator />
              <div>
                <span className="text-sm font-medium text-slate-600">Motivo</span>
                <p className="text-slate-700 mt-1">{claim.reason.name || claim.reason}</p>
                {claim.reason.detail && (
                  <p className="text-sm text-slate-500 mt-1">{claim.reason.detail}</p>
                )}
              </div>
            </>
          )}

          {affectsReputation && (
            <>
              <Separator />
              <div className="flex items-start gap-3 p-3 bg-white rounded border border-slate-200">
                <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Impacto na Reputação</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {affectsReputation.affects_reputation === 'affected' && (
                      <span className="text-red-600">⚠️ Esta reclamação afeta sua reputação</span>
                    )}
                    {affectsReputation.affects_reputation === 'not_affected' && (
                      <span className="text-green-600">✓ Esta reclamação não afeta sua reputação</span>
                    )}
                    {affectsReputation.affects_reputation === 'not_applies' && (
                      <span className="text-slate-600">Não se aplica</span>
                    )}
                  </p>
                  {affectsReputation.has_incentive && (
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Responda em até 48h para não afetar sua reputação
                    </p>
                  )}
                  {affectsReputation.due_date && (
                    <p className="text-xs text-slate-500 mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Prazo: {format(new Date(affectsReputation.due_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Histórico de Status */}
      {statusHistory && statusHistory.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Histórico de Status
          </h4>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="space-y-3">
              {statusHistory.map((item: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'closed' ? 'bg-green-500' :
                      item.status === 'opened' ? 'bg-blue-500' :
                      'bg-slate-400'
                    }`} />
                    {index < statusHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-300 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-slate-900">
                      {stageLabels[item.stage] || item.stage} - {statusLabels[item.status]?.label || item.status}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(item.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {item.change_by && (
                      <p className="text-xs text-slate-600 mt-1">
                        <User className="h-3 w-3 inline mr-1" />
                        {item.change_by === 'complainant' ? 'Comprador' : 
                         item.change_by === 'respondent' ? 'Vendedor' :
                         item.change_by === 'mediator' ? 'Mercado Livre' :
                         item.change_by}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Ações */}
      {actionsHistory && actionsHistory.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Ações Tomadas
          </h4>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="space-y-2">
              {actionsHistory.map((action: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-slate-200">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">
                      {action.action_name?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(action.date_created), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {action.player_role === 'complainant' ? 'Comprador' : 
                     action.player_role === 'respondent' ? 'Vendedor' :
                     action.player_role === 'mediator' ? 'ML' :
                     action.player_role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mensagens */}
      {messages && messages.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens ({messages.length})
          </h4>
          <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((msg: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.sender_role === 'respondent'
                      ? 'bg-blue-100 ml-8'
                      : msg.sender_role === 'complainant'
                      ? 'bg-white mr-8'
                      : 'bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">
                      {msg.sender_role === 'complainant' ? '👤 Comprador' : 
                       msg.sender_role === 'respondent' ? '🏪 Vendedor' :
                       msg.sender_role === 'mediator' ? '⚖️ Mercado Livre' :
                       msg.sender_role}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(msg.message_date || msg.date_created), 'dd/MM HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{msg.message}</p>
                  {msg.status === 'blocked' && (
                    <Badge variant="destructive" className="text-xs mt-2">Bloqueada</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Link para visualizar no ML */}
      <div className="pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href={`https://www.mercadolivre.com.br/vendas/${mlOrderId}/detalhes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Visualizar no Mercado Livre
          </a>
        </Button>
      </div>
    </div>
  );
}

