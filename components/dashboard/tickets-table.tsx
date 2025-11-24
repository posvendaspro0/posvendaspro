'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatResolutionTime, calculateResolutionTime } from '@/lib/time-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { TicketStatus, ProblemType } from '@prisma/client';

interface Ticket {
  id: string;
  status: TicketStatus;
  responsible: string | null;
  complaintDate: Date;
  productSku: string | null;
  problemType: ProblemType;
  observation: string;
  createdAt: Date;
  resolutionDate: Date | null;
  resolutionCost: any;
  affectedReputation: boolean;
  resolutionTime: number | null;
}

interface TicketsTableProps {
  tickets: Ticket[];
}

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-orange-100 text-orange-800',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-800',
  },
  RESOLVED: {
    label: 'Resolvido',
    color: 'bg-green-100 text-green-800',
  },
  CLOSED: {
    label: 'Fechado',
    color: 'bg-slate-100 text-slate-800',
  },
};

const problemTypeLabels = {
  PRODUCT_NOT_RECEIVED: 'Produto não recebido',
  PRODUCT_DEFECTIVE: 'Produto com defeito',
  WRONG_PRODUCT: 'Produto errado',
  LATE_DELIVERY: 'Entrega atrasada',
  DAMAGED_PACKAGE: 'Embalagem danificada',
  RETURN_REQUEST: 'Solicitação de devolução',
  OTHER: 'Outro',
};

/**
 * Componente de Tempo Aberto (atualiza em tempo real)
 */
function OpenTime({ ticket }: { ticket: Ticket }) {
  const [openTime, setOpenTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      // Se o ticket está resolvido/fechado, mostrar o tempo de resolução
      if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        if (ticket.resolutionTime) {
          setOpenTime(formatResolutionTime(ticket.resolutionTime));
        } else {
          setOpenTime('Resolvido');
        }
        return;
      }

      // Se está aberto, calcular o tempo desde a data de reclamação
      const now = new Date();
      const complaintDate = new Date(ticket.complaintDate);
      const hoursOpen = calculateResolutionTime(complaintDate, now);
      setOpenTime(formatResolutionTime(hoursOpen));
    };

    updateTime(); // Atualizar imediatamente
    const interval = setInterval(updateTime, 60000); // Atualizar a cada 1 minuto

    return () => clearInterval(interval);
  }, [ticket]);

  const isOpen = ticket.status === 'PENDING' || ticket.status === 'IN_PROGRESS';

  return (
    <div className="flex items-center gap-2">
      {isOpen && <Clock className="h-3 w-3 text-orange-500 animate-pulse" />}
      <span className={`font-medium ${isOpen ? 'text-orange-600' : 'text-green-600'}`}>
        {openTime}
      </span>
    </div>
  );
}

/**
 * Tabela de Tickets
 * Exibe listagem de tickets com campos reorganizados
 */
export function TicketsTable({ tickets }: TicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-500 mb-2">
          Nenhum ticket cadastrado ainda.
        </p>
        <p className="text-sm text-slate-400">
          Clique em &quot;Novo Ticket&quot; para começar.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Ticket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data de Reclamação</TableHead>
              <TableHead>Tipo de Problema</TableHead>
              <TableHead className="text-center">Reputação Afetada</TableHead>
              <TableHead>Tempo Aberto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              
              return (
                <TableRow key={ticket.id}>
                  {/* 1. Ticket (ID) */}
                  <TableCell className="font-mono text-xs font-medium">
                    {ticket.id}
                  </TableCell>

                  {/* 2. Status */}
                  <TableCell>
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </TableCell>

                  {/* 3. Responsável */}
                  <TableCell className="font-medium">
                    {ticket.responsible || '-'}
                  </TableCell>

                  {/* 4. Data de Reclamação */}
                  <TableCell className="text-slate-600">
                    {ticket.complaintDate 
                      ? format(new Date(ticket.complaintDate), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>

                  {/* 5. Tipo de Problema */}
                  <TableCell className="text-sm">
                    {problemTypeLabels[ticket.problemType]}
                  </TableCell>

                  {/* 6. Reputação Afetada */}
                  <TableCell className="text-center">
                    {ticket.affectedReputation ? (
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">Sim</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Não</span>
                      </div>
                    )}
                  </TableCell>

                  {/* 7. Tempo Aberto (em tempo real) */}
                  <TableCell>
                    <OpenTime ticket={ticket} />
                  </TableCell>

                  {/* 8. Ações */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/tickets/${ticket.id}/editar`}>
                        <Button variant="ghost" size="sm" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

