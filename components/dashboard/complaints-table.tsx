'use client';

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
import { Eye } from 'lucide-react';

/**
 * Tabela de Reclamações
 * Dados mockados preparados para futura integração com API ML
 * 
 * TODO: Substituir por dados reais da API do Mercado Livre
 * Estrutura já preparada para receber dados do banco/API
 */

// Dados mockados de exemplo
const mockComplaints = [
  {
    id: '1',
    mlOrderId: 'MLB123456789',
    mlComplaintId: 'CL001',
    clientName: 'João Silva',
    reason: 'Produto não chegou',
    status: 'PENDING',
    mlCreatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    mlOrderId: 'MLB987654321',
    mlComplaintId: 'CL002',
    clientName: 'Maria Santos',
    reason: 'Produto diferente do anunciado',
    status: 'IN_PROGRESS',
    mlCreatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    mlOrderId: 'MLB555666777',
    mlComplaintId: 'CL003',
    clientName: 'Pedro Oliveira',
    reason: 'Produto com defeito',
    status: 'RESOLVED',
    mlCreatedAt: new Date('2024-01-13'),
  },
  {
    id: '4',
    mlOrderId: 'MLB111222333',
    mlComplaintId: 'CL004',
    clientName: 'Ana Costa',
    reason: 'Entrega atrasada',
    status: 'PENDING',
    mlCreatedAt: new Date('2024-01-12'),
  },
  {
    id: '5',
    mlOrderId: 'MLB444555666',
    mlComplaintId: 'CL005',
    clientName: 'Carlos Ferreira',
    reason: 'Embalagem danificada',
    status: 'CLOSED',
    mlCreatedAt: new Date('2024-01-11'),
  },
];

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    variant: 'default' as const,
    color: 'bg-orange-100 text-orange-800',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    variant: 'secondary' as const,
    color: 'bg-blue-100 text-blue-800',
  },
  RESOLVED: {
    label: 'Resolvida',
    variant: 'outline' as const,
    color: 'bg-green-100 text-green-800',
  },
  CLOSED: {
    label: 'Fechada',
    variant: 'outline' as const,
    color: 'bg-slate-100 text-slate-800',
  },
};

export function ComplaintsTable() {
  if (mockComplaints.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-500">
          Nenhuma reclamação encontrada.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Conecte sua conta do Mercado Livre para sincronizar suas reclamações.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ℹ️ <strong>Dados de Exemplo:</strong> Esta tabela exibe dados mockados para demonstração.
          Quando a integração com o Mercado Livre for implementada, os dados reais serão exibidos aqui.
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Reclamação</TableHead>
              <TableHead>Pedido ML</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockComplaints.map((complaint) => {
              const status = statusConfig[complaint.status as keyof typeof statusConfig];
              
              return (
                <TableRow key={complaint.id}>
                  <TableCell className="font-mono text-sm">
                    {complaint.mlComplaintId}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {complaint.mlOrderId}
                  </TableCell>
                  <TableCell className="font-medium">
                    {complaint.clientName}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {complaint.reason}
                  </TableCell>
                  <TableCell>
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {format(complaint.mlCreatedAt, 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

