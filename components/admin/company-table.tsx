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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Edit, Users, AlertCircle } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
  cnpj: string | null;
  createdAt: Date;
  _count: {
    users: number;
    tickets: number;
    mlAccounts: number;
  };
}

interface CompanyTableProps {
  companies: Company[];
}

/**
 * Tabela de Empresas
 * Exibe lista de empresas com informações e ações
 */
export function CompanyTable({ companies }: CompanyTableProps) {
  if (companies.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-500">
          Nenhuma empresa cadastrada ainda.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Clique em &quot;Nova Empresa&quot; para começar.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="text-center">Usuários</TableHead>
            <TableHead className="text-center">Tickets</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="text-slate-600">{company.email}</TableCell>
              <TableCell className="text-slate-600">
                {company.cnpj || '-'}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {company._count.users}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {company._count.tickets}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-600">
                {format(new Date(company.createdAt), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/empresas/${company.id}/editar`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

