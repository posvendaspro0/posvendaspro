'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { Eye, Edit, CheckCircle2, XCircle } from 'lucide-react';
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
 * Tabela de Tickets
 * Exibe listagem completa de tickets com todos os campos
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
              <TableHead className="w-[140px]">ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data Reclamação</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data Resolução</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead className="text-center">Reputação</TableHead>
              <TableHead>Tempo (h)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              
              return (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {ticket.id}
                  </TableCell>
                  <TableCell>
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {ticket.responsible || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {ticket.complaintDate 
                      ? format(new Date(ticket.complaintDate), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {ticket.productSku || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {problemTypeLabels[ticket.problemType]}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {ticket.resolutionDate
                      ? format(new Date(ticket.resolutionDate), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {ticket.resolutionCost
                      ? `R$ ${Number(ticket.resolutionCost).toFixed(2)}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {ticket.affectedReputation ? (
                      <XCircle className="h-4 w-4 text-red-500 inline" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {ticket.resolutionTime || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/tickets/${ticket.id}/editar`}>
                        <Button variant="ghost" size="sm">
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

