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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MlClaimsTableProps {
  onClaimsLoaded?: (count: number) => void;
}

type SortField = 'date_created' | 'date_closed' | 'status' | 'responsible';
type SortOrder = 'asc' | 'desc';

export function MlClaimsTable({ onClaimsLoaded }: MlClaimsTableProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date_created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Mais recente primeiro por padrão

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
        const claimsData = data.claims || [];
        setClaims(claimsData);
        setFilteredClaims(claimsData); // Inicializar filteredClaims
        onClaimsLoaded?.(claimsData.length);
      } catch (err) {
        console.error('[ML Claims Table] Erro ao buscar claims:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setClaims([]);
        setFilteredClaims([]);
        onClaimsLoaded?.(0);
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [onClaimsLoaded]);

  // Aplicar filtros e ordenação
  useEffect(() => {
    let result = [...claims];

    // 1. Filtro de busca (ID, responsável, produto)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((claim) => {
        const id = String(claim.resource_id || claim.resource?.id || claim.id).toLowerCase();
        const responsible = (claim._complementary?.responsible || claim.assigned_to || '').toLowerCase();
        const product = (claim._complementary?.productSku || claim.item_id || '').toLowerCase();
        
        return id.includes(term) || responsible.includes(term) || product.includes(term);
      });
    }

    // 2. Filtro de status
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((claim) => {
        if (statusFilter === 'opened') {
          return claim.status === 'opened' || claim.stage === 'claim';
        } else if (statusFilter === 'in_progress') {
          return claim.stage === 'dispute' || claim.stage === 'mediation';
        } else if (statusFilter === 'closed') {
          return claim.status === 'closed' || claim.status === 'won';
        }
        return true;
      });
    }

    // 3. Ordenação
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date_created':
          aValue = new Date(a.date_created || 0).getTime();
          bValue = new Date(b.date_created || 0).getTime();
          break;
        case 'date_closed':
          aValue = a.date_closed ? new Date(a.date_closed).getTime() : 0;
          bValue = b.date_closed ? new Date(b.date_closed).getTime() : 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'responsible':
          aValue = (a._complementary?.responsible || a.assigned_to || '').toLowerCase();
          bValue = (b._complementary?.responsible || b.assigned_to || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClaims(result);
  }, [claims, searchTerm, statusFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      // Alternar ordem
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Novo campo, ordenar descendente por padrão
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

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
                <p className="font-semibold text-slate-900">Informações de Debug:</p>
                <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-auto max-h-96">
                  {typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  const hasAnyClaims = claims.length > 0;
  const hasFilteredClaims = filteredClaims.length > 0;

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
      {/* Header com Badge e Contadores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800">
            Integração API ML
          </Badge>
          <span className="text-sm text-slate-600">
            {filteredClaims.length} de {claims.length} reclamação(ões)
          </span>
        </div>
      </div>

      {/* Filtros */}
      {hasAnyClaims && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-slate-600" />
            <span className="font-medium text-slate-900">Filtros e Ordenação</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm text-slate-700">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="ID, responsável, produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filtro de Status */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm text-slate-700">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="opened">🟡 Aberta</SelectItem>
                  <SelectItem value="in_progress">🔵 Em Andamento</SelectItem>
                  <SelectItem value="closed">🟢 Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <Label htmlFor="sort-field" className="text-sm text-slate-700">
                Ordenar por
              </Label>
              <Select 
                value={sortField} 
                onValueChange={(value) => setSortField(value as SortField)}
              >
                <SelectTrigger id="sort-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_created">📅 Data de Criação</SelectItem>
                  <SelectItem value="date_closed">✅ Data de Resolução</SelectItem>
                  <SelectItem value="status">🔄 Status</SelectItem>
                  <SelectItem value="responsible">👤 Responsável</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indicador de ordem */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <span>Ordem:</span>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </Badge>
          </div>
        </div>
      )}

      {/* Mensagem quando não há claims */}
      {!hasAnyClaims && (
        <Alert className="border-slate-200 bg-slate-50">
          <AlertCircle className="h-4 w-4 text-slate-600" />
          <AlertDescription className="text-slate-700">
            Nenhuma reclamação encontrada no Mercado Livre.
          </AlertDescription>
        </Alert>
      )}

      {/* Mensagem quando filtros não retornam resultados */}
      {hasAnyClaims && !hasFilteredClaims && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Nenhuma reclamação encontrada com os filtros aplicados. Tente ajustar os critérios de busca.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela */}
      {hasFilteredClaims && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>ID Reclamação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-slate-200"
                    onClick={() => toggleSort('responsible')}
                  >
                    Responsável
                    {getSortIcon('responsible')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-slate-200"
                    onClick={() => toggleSort('date_created')}
                  >
                    Data Reclamação
                    {getSortIcon('date_created')}
                  </Button>
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo de Problema</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-slate-200"
                    onClick={() => toggleSort('date_closed')}
                  >
                    Data Resolução
                    {getSortIcon('date_closed')}
                  </Button>
                </TableHead>
                <TableHead>Custo Resolução</TableHead>
                <TableHead>Tempo Resolução</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => {
              // Mapear status do ML para status do sistema
              let mappedStatus = { label: 'Não Iniciada', color: 'bg-slate-100 text-slate-600', icon: '⚪' };
              
              if (claim.stage === 'dispute' || claim.stage === 'mediation') {
                mappedStatus = { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: '🔵' };
              } else if (claim.status === 'closed' || claim.status === 'won') {
                mappedStatus = { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: '🟢' };
              } else if (claim.stage === 'claim') {
                mappedStatus = { label: 'Não Iniciada', color: 'bg-slate-100 text-slate-600', icon: '⚪' };
              }

              // Mapear tipo de problema do ML para tipos do sistema
              const problemTypeMap: Record<string, string> = {
                'not_received': 'Não Recebido',
                'not_as_described': 'Enviado Errado',
                'defective': 'Quebrado',
                'damaged': 'Quebrado',
                'wrong_item': 'Enviado Errado',
                'missing_parts': 'Quantidade Incorreta',
                'manufacturing_defect': 'Defeito Fábrica',
                'buyer_regret': 'Arrependimento Compra',
                'does_not_fit': 'Compatibilidade',
              };

              const reasonKey = claim.reason?.id || claim.reason || '';
              const tipoProblemaMapeado = problemTypeMap[reasonKey] || claim.reason?.name || 'Não especificado';

              // Calcular tempo de resolução
              let tempoResolucao = '-';
              if (claim.date_created) {
                const dataAbertura = new Date(claim.date_created);
                const dataResolucao = claim.date_closed ? new Date(claim.date_closed) : new Date();
                const diffMs = dataResolucao.getTime() - dataAbertura.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                if (claim.status === 'closed' || claim.status === 'won') {
                  tempoResolucao = diffDays > 0 
                    ? `${diffDays}d ${diffHours}h ${diffMins}m` 
                    : `${diffHours}h ${diffMins}m`;
                } else {
                  tempoResolucao = 'Em andamento';
                }
              }
              
              return (
                <TableRow key={claim.id} className="hover:bg-slate-50">
                  {/* ID Reclamação */}
                  <TableCell className="font-mono text-sm font-medium">
                    {claim.resource_id || claim.resource?.id || claim.id}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge className={mappedStatus.color + ' text-xs'}>
                      {mappedStatus.icon} {mappedStatus.label}
                    </Badge>
                  </TableCell>

                  {/* Responsável */}
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {claim._complementary?.responsible || claim.assigned_to || 'Não atribuído'}
                    </span>
                  </TableCell>

                  {/* Data Reclamação */}
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {claim.date_created 
                        ? format(new Date(claim.date_created), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </div>
                  </TableCell>

                  {/* Produto (SKU) */}
                  <TableCell>
                    <span className="text-sm text-slate-700 font-mono">
                      {claim._complementary?.productSku || claim.item_id || '-'}
                    </span>
                  </TableCell>

                  {/* Tipo de Problema */}
                  <TableCell className="max-w-xs">
                    <span className="text-sm text-slate-700 truncate block">
                      {tipoProblemaMapeado}
                    </span>
                  </TableCell>

                  {/* Data Resolução */}
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {claim.date_closed && (claim.status === 'closed' || claim.status === 'won')
                        ? format(new Date(claim.date_closed), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </div>
                  </TableCell>

                  {/* Custo Resolução */}
                  <TableCell>
                    <span className="text-sm text-slate-700 font-mono">
                      R$ {claim._complementary?.resolutionCost 
                        ? Number(claim._complementary.resolutionCost).toFixed(2)
                        : (claim.resolution_amount ? Number(claim.resolution_amount).toFixed(2) : '0,00')}
                    </span>
                  </TableCell>

                  {/* Tempo Resolução */}
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {tempoResolucao}
                    </span>
                  </TableCell>

                  {/* Ações */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/dashboard/reclamacoes/${claim.id}`}>
                          <Eye className="h-4 w-4" />
                          Editar
                        </Link>
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

