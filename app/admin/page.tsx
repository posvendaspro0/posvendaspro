import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * Dashboard Principal ADMIN
 * Visão geral com estatísticas do sistema
 */
export default async function AdminDashboard() {
  // Garantir que apenas ADMINs acessem
  await requireAdmin();
  // Buscar estatísticas do sistema
  const [totalCompanies, totalUsers, totalTickets] = await Promise.all([
    prisma.company.count(),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.ticket.count(),
  ]);

  const stats = [
    {
      title: 'Total de Empresas',
      value: totalCompanies,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total de Usuários',
      value: totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total de Tickets',
      value: totalTickets,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Taxa de Resolução',
      value: totalTickets > 0 ? '0%' : '-',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Visão geral do sistema PósVendas Pro
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Nenhuma atividade recente para exibir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {totalCompanies} {totalCompanies === 1 ? 'empresa ativa' : 'empresas ativas'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

