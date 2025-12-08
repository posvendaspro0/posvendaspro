'use client';

/**
 * Tabela de Reclamações do Mercado Livre
 * Exibe reclamações vindas diretamente da API ML
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Eye,
  Loader2,
  AlertCircle,
  ExternalLink,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MlClaimsTableProps {
  onClaimsLoaded?: (count: number) => void;
}

export function MlClaimsTable({ onClaimsLoaded }: MlClaimsTableProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        setLoading(true);
        setError(null);

        console.log('[ML Claims Table] Iniciando busca de reclamações...');
        const response = await fetch('/api/ml/claims?limit=100');
        
        console.log('[ML Claims Table] Resposta recebida:', response.status);
        const data = await response.json();
        console.log('[ML Claims Table] Dados completos:', data);

        if (!data.connected) {
          const errorMsg = data.error || 'Conecte sua conta do Mercado Livre para ver as reclamações';
          console.log('[ML Claims Table] Não conectado:', errorMsg);
          
          // Se tem detalhes, adicionar ao erro
          const fullError = data.details ? `${errorMsg}\n\nDetalhes técnicos: ${data.details}` : errorMsg;
          
          setError(fullError);
          setDebugInfo(data);
          setClaims([]);
          onClaimsLoaded?.(0);
          return;
        }

        if (!response.ok && response.status !== 200) {
          const errorMsg = data.error || 'Erro ao buscar reclamações';
          const fullError = data.details ? `${errorMsg}\n\nDetalhes: ${data.details}` : errorMsg;
          throw new Error(fullError);
        }

        console.log('[ML Claims Table] Claims encontradas:', data.claims?.length || 0);
        setClaims(data.claims || []);
        onClaimsLoaded?.(data.claims?.length || 0);
      } catch (err) {
        console.error('[ML Claims Table] Erro ao buscar claims:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setClaims([]);
        onClaimsLoaded?.(0);
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [onClaimsLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 border border-slate-200 rounded-lg bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Carregando reclamações do Mercado Livre...</span>
      </div>
    );
  }

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/ml/status');
      const data = await response.json();
      setDebugInfo(data);
      setShowDebug(true);
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Integração Mercado Livre:</strong> {error}
                <Link href="/dashboard/integracao" className="ml-2 underline">
                  Conectar agora
                </Link>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkStatus}
              >
                Ver Detalhes
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {showDebug && debugInfo && (
          <Alert className="border-slate-200 bg-slate-50">
            <AlertCircle className="h-4 w-4 text-slate-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Informações de Debug:</p>
                <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <Alert className="border-slate-200 bg-slate-50">
        <AlertCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          Nenhuma reclamação encontrada no Mercado Livre.
        </AlertDescription>
      </Alert>
    );
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Reclamações do Mercado Livre
          </h3>
          <p className="text-sm text-slate-600">
            {claims.length} reclamação(ões) encontrada(s)
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          Integração API ML
        </Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>ID da Claim</TableHead>
              <TableHead>Pedido ML</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead>Reputação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => {
              const status = statusLabels[claim.status] || { 
                label: claim.status, 
                color: 'bg-slate-100 text-slate-800' 
              };
              
              return (
                <TableRow key={claim.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm">
                    {claim.id}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {claim.resource_id || claim.resource?.id || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={status.color + ' text-xs'}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {stageLabels[claim.stage] || claim.stage}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    <span className="text-sm text-slate-700">
                      {claim.reason?.name || claim.reason || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="h-3 w-3" />
                      {claim.date_created 
                        ? format(new Date(claim.date_created), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {claim.affects_reputation === 'affected' ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs">Afeta</span>
                      </div>
                    ) : claim.affects_reputation === 'not_affected' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="text-xs">Não afeta</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://www.mercadolivre.com.br/vendas/${claim.resource_id || claim.resource?.id}/detalhes`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver no ML
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

