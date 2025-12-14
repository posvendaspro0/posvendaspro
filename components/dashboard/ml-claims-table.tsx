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
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Search,
  Filter,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
  Package,
  Calendar as CalendarIcon,
  User,
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MlClaimsTableProps {
  onClaimsLoaded?: (count: number) => void;
}

type SortField = 'date_created' | 'date_closed' | 'status' | 'responsible';
type SortOrder = 'asc' | 'desc';
type DateFilter = 'all' | 'today' | 'yesterday' | 'last7' | 'last15' | 'last30' | 'custom';

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
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(undefined);
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(undefined);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date_created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Mais recente primeiro por padrão

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

    // 3. Filtro de data
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateFrom: Date;
      let dateTo: Date = endOfDay(now);

      switch (dateFilter) {
        case 'today':
          dateFrom = startOfDay(now);
          break;
        case 'yesterday':
          dateFrom = startOfDay(subDays(now, 1));
          dateTo = endOfDay(subDays(now, 1));
          break;
        case 'last7':
          dateFrom = startOfDay(subDays(now, 7));
          break;
        case 'last15':
          dateFrom = startOfDay(subDays(now, 15));
          break;
        case 'last30':
          dateFrom = startOfDay(subDays(now, 30));
          break;
        case 'custom':
          if (customDateFrom && customDateTo) {
            dateFrom = startOfDay(customDateFrom);
            dateTo = endOfDay(customDateTo);
          } else {
            break;
          }
          break;
        default:
          dateFrom = new Date(0); // Todas as datas
      }

      result = result.filter((claim) => {
        if (!claim.date_created) return false;
        const claimDate = new Date(claim.date_created);
        return isWithinInterval(claimDate, { start: dateFrom!, end: dateTo });
      });
    }

    // 4. Ordenação
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
  }, [claims, searchTerm, statusFilter, dateFilter, customDateFrom, customDateTo, sortField, sortOrder]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClaims = filteredClaims.slice(startIndex, endIndex);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, customDateFrom, customDateTo, sortField, sortOrder]);

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
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-slate-600 font-medium">Carregando reclamações do Mercado Livre...</span>
        </CardContent>
      </Card>
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
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 p-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Integração Mercado Livre</h3>
                <p className="text-sm text-blue-700 mb-3">{error}</p>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href="/dashboard/integracao">
                      Conectar Conta ML
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkStatus}
                  >
                    Ver Detalhes Técnicos
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {showDebug && debugInfo && (
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-slate-900">Informações de Debug</span>
              </div>
              <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 font-mono">
                {typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const hasAnyClaims = claims.length > 0;
  const hasFilteredClaims = filteredClaims.length > 0;
  const hasPaginatedClaims = paginatedClaims.length > 0;

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
    <div className="space-y-6">
      {/* Filtros */}
      {hasAnyClaims && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 shadow-sm">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Filtros e Ordenação</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filteredClaims.length} de {claims.length} reclamações encontradas
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de Filtros */}
            <div className="space-y-4">
              {/* Primeira Linha: Busca */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  Buscar Reclamação
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Pesquisar por ID, responsável ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Segunda Linha: Status, Data, Ordenar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro de Status */}
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5" />
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter" className="h-11 border-slate-300">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3 w-3" />
                          <span>Todos</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="opened">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                          <span>Aberta</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-3 w-3 text-blue-600" />
                          <span>Em Andamento</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="closed">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span>Concluída</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Data */}
                <div className="space-y-2">
                  <Label htmlFor="date-filter" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Período
                  </Label>
                  <Select 
                    value={dateFilter} 
                    onValueChange={(value) => {
                      setDateFilter(value as DateFilter);
                      if (value !== 'custom') {
                        setCustomDateFrom(undefined);
                        setCustomDateTo(undefined);
                      }
                    }}
                  >
                    <SelectTrigger id="date-filter" className="h-11 border-slate-300">
                      <SelectValue placeholder="Todas as datas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3 w-3" />
                          <span>Todas as datas</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="today">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 text-blue-600" />
                          <span>Hoje</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="yesterday">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 text-slate-600" />
                          <span>Ontem</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="last7">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-3 w-3 text-purple-600" />
                          <span>Últimos 7 dias</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="last15">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-3 w-3 text-indigo-600" />
                          <span>Últimos 15 dias</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="last30">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-3 w-3 text-violet-600" />
                          <span>Últimos 30 dias</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 text-amber-600" />
                          <span>Período personalizado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                  <Label htmlFor="sort-field" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Ordenar por
                  </Label>
                  <Select 
                    value={sortField} 
                    onValueChange={(value) => setSortField(value as SortField)}
                  >
                    <SelectTrigger id="sort-field" className="h-11 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_created">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Data de Criação</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="date_closed">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Data de Resolução</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="status">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          <span>Status</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="responsible">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>Responsável</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calendário Personalizado (se selecionado) */}
              {dateFilter === 'custom' && (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Data Inicial</Label>
                      <Popover open={dateFromOpen} onOpenChange={setDateFromOpen} modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full h-11 justify-start text-left font-normal border-slate-300 ${
                              !customDateFrom && 'text-slate-500'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customDateFrom ? format(customDateFrom, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[100]" align="start">
                          <Calendar
                            mode="single"
                            selected={customDateFrom}
                            onSelect={(date) => {
                              setCustomDateFrom(date);
                              setDateFromOpen(false);
                            }}
                            locale={ptBR}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Data Final</Label>
                      <Popover open={dateToOpen} onOpenChange={setDateToOpen} modal={true}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full h-11 justify-start text-left font-normal border-slate-300 ${
                              !customDateTo && 'text-slate-500'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customDateTo ? format(customDateTo, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[100]" align="start">
                          <Calendar
                            mode="single"
                            selected={customDateTo}
                            onSelect={(date) => {
                              setCustomDateTo(date);
                              setDateToOpen(false);
                            }}
                            locale={ptBR}
                            disabled={(date) => date > new Date() || (customDateFrom ? date < customDateFrom : false)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              {/* Terceira Linha: Ordem e Ações */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Ordem:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="h-8 text-xs font-medium"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <ArrowUp className="h-3 w-3 mr-1.5" />
                        Crescente
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-3 w-3 mr-1.5" />
                        Decrescente
                      </>
                    )}
                  </Button>
                </div>

                {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter('all');
                      setCustomDateFrom(undefined);
                      setCustomDateTo(undefined);
                    }}
                    className="h-8 text-xs text-slate-600 hover:text-slate-900"
                  >
                    <XCircle className="h-3 w-3 mr-1.5" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há claims */}
      {!hasAnyClaims && (
        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Nenhuma reclamação encontrada
            </h3>
            <p className="text-sm text-slate-600 text-center max-w-md">
              Quando houver reclamações no Mercado Livre, elas aparecerão aqui automaticamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legenda de Status */}
      {hasAnyClaims && (
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Legenda de Status</h3>
                <p className="text-xs text-slate-600 mt-0.5">Entenda o significado de cada status e quando agir</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status: Não Iniciada */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Circle className="h-4 w-4 text-slate-600" />
                  <span className="font-semibold text-slate-900 text-sm">Não Iniciada</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Reclamação criada pelo comprador. <strong className="text-slate-900">Responda em até 2-3 dias</strong> para evitar que escale.
                </p>
              </div>

              {/* Status: Aberta */}
              <div className="border border-orange-200 rounded-lg p-3 bg-orange-50 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-900 text-sm">Aberta</span>
                </div>
                <p className="text-xs text-orange-700 leading-relaxed">
                  Aguardando ação. <strong className="text-orange-900">Urgente!</strong> Propor solução, oferecer reembolso ou troca o quanto antes.
                </p>
              </div>

              {/* Status: Em Andamento */}
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-sm">Em Andamento</span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Disputa ou mediação do ML. <strong className="text-blue-900">Envie evidências</strong> (fotos, notas, rastreio) para defender seu caso.
                </p>
              </div>

              {/* Status: Concluída */}
              <div className="border border-green-200 rounded-lg p-3 bg-green-50 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-900 text-sm">Concluída</span>
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  Resolvida ou fechada. <strong className="text-green-900">Caso encerrado.</strong> Pode ter sido resolvida amigavelmente ou você ganhou a disputa.
                </p>
              </div>
            </div>

            {/* Dica Pro */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 mb-1">💡 Dica Profissional</p>
                  <p className="text-xs text-amber-700">
                    <strong>Priorize:</strong> Disputas/Mediações (urgente!) → Abertas +48h (risco alto) → Abertas recentes (resolver rápido). 
                    Responder em até 24h reduz drasticamente o risco de impacto na reputação.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando filtros não retornam resultados */}
      {hasAnyClaims && !hasFilteredClaims && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-orange-100 p-3 mb-4">
              <Search className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-base font-semibold text-orange-900 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-sm text-orange-700 text-center max-w-md mb-4">
              Nenhuma reclamação corresponde aos filtros aplicados. Tente ajustar os critérios de busca.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="bg-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      {hasPaginatedClaims && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold">ID Reclamação</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 -ml-2 hover:bg-slate-200 font-semibold"
                      onClick={() => toggleSort('responsible')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Responsável
                      <span className="ml-2">{getSortIcon('responsible')}</span>
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 -ml-2 hover:bg-slate-200 font-semibold"
                      onClick={() => toggleSort('date_created')}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Data Criação
                      <span className="ml-2">{getSortIcon('date_created')}</span>
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Produto
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Problema
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 -ml-2 hover:bg-slate-200 font-semibold"
                      onClick={() => toggleSort('date_closed')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolução
                      <span className="ml-2">{getSortIcon('date_closed')}</span>
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Custo
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tempo
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClaims.map((claim) => {
                // Mapear status do ML para status do sistema
                let mappedStatus = { 
                  label: 'Não Iniciada', 
                  color: 'bg-slate-100 text-slate-700',
                  icon: <Circle className="h-3 w-3" /> 
                };
                
                if (claim.stage === 'dispute' || claim.stage === 'mediation') {
                  mappedStatus = { 
                    label: 'Em Andamento', 
                    color: 'bg-blue-100 text-blue-700',
                    icon: <PlayCircle className="h-3 w-3" />
                  };
                } else if (claim.status === 'closed' || claim.status === 'won') {
                  mappedStatus = { 
                    label: 'Concluído', 
                    color: 'bg-green-100 text-green-700',
                    icon: <CheckCircle2 className="h-3 w-3" />
                  };
                } else if (claim.stage === 'claim') {
                  mappedStatus = { 
                    label: 'Aberta', 
                    color: 'bg-orange-100 text-orange-700',
                    icon: <AlertCircle className="h-3 w-3" />
                  };
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
                  <TableRow key={claim.id} className="hover:bg-slate-50 transition-colors">
                    {/* ID Reclamação */}
                    <TableCell className="font-mono text-sm font-medium text-slate-900">
                      {claim.resource_id || claim.resource?.id || claim.id}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${mappedStatus.color} border-0 font-medium`}
                      >
                        {mappedStatus.icon}
                        <span className="ml-1.5">{mappedStatus.label}</span>
                      </Badge>
                    </TableCell>

                    {/* Responsável */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-slate-100 p-1.5">
                          <User className="h-3 w-3 text-slate-600" />
                        </div>
                        <span className="text-sm text-slate-700 font-medium">
                          {claim._complementary?.responsible || claim.assigned_to || (
                            <span className="text-slate-400 italic">Não atribuído</span>
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Data Reclamação */}
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">
                          {claim.date_created 
                            ? format(new Date(claim.date_created), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : '-'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Produto (SKU) */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-700 font-mono">
                          {claim._complementary?.productSku || claim.item_id || (
                            <span className="text-slate-400">-</span>
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Tipo de Problema */}
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-sm text-slate-700 truncate">
                          {tipoProblemaMapeado}
                        </span>
                      </div>
                    </TableCell>

                    {/* Data Resolução */}
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">
                          {claim.date_closed && (claim.status === 'closed' || claim.status === 'won')
                            ? format(new Date(claim.date_closed), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : <span className="text-slate-400">-</span>}
                        </span>
                      </div>
                    </TableCell>

                    {/* Custo Resolução */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-sm text-slate-700 font-medium">
                          {claim._complementary?.resolutionCost 
                            ? `R$ ${Number(claim._complementary.resolutionCost).toFixed(2)}`
                            : (claim.resolution_amount 
                              ? `R$ ${Number(claim.resolution_amount).toFixed(2)}` 
                              : <span className="text-slate-400">R$ 0,00</span>)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Tempo Resolução */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-sm text-slate-700 font-medium">
                          {tempoResolucao}
                        </span>
                      </div>
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8"
                      >
                        <Link href={`/dashboard/reclamacoes/${claim.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Detalhes
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <CardContent className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClaims.length)} de {filteredClaims.length} reclamações
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostrar apenas páginas próximas
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      )}
    </div>
  );
}

