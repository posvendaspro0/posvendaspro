import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { requireClient } from '@/lib/auth-helpers';

/**
 * Dashboard Principal CLIENT
 * Visão geral com estatísticas de reclamações
 */
export default async function ClientDashboard() {
  // Garantir que apenas CLIENTs acessem
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  // Buscar estatísticas reais da empresa
  const totalComplaints = await prisma.complaint.count({
    where: { companyId: session.user.companyId },
  });

  const pendingComplaints = await prisma.complaint.count({
    where: {
      companyId: session.user.companyId,
      status: 'PENDING',
    },
  });

  const inProgressComplaints = await prisma.complaint.count({
    where: {
      companyId: session.user.companyId,
      status: 'IN_PROGRESS',
    },
  });

  const resolvedComplaints = await prisma.complaint.count({
    where: {
      companyId: session.user.companyId,
      status: 'RESOLVED',
    },
  });

  const stats = [
    {
      title: 'Total de Reclamações',
      value: totalComplaints,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pendentes',
      value: pendingComplaints,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Em Andamento',
      value: inProgressComplaints,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Resolvidas',
      value: resolvedComplaints,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Acompanhe suas reclamações do Mercado Livre
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
            <CardTitle>Integração Mercado Livre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Para começar a sincronizar suas reclamações, conecte sua conta do Mercado Livre.
              </p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ A integração com o Mercado Livre será implementada em breve.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Atualizações</CardTitle>
          </CardHeader>
          <CardContent>
            {totalComplaints === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhuma reclamação ainda. Conecte sua conta do Mercado Livre para começar.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Suas reclamações estão atualizadas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

