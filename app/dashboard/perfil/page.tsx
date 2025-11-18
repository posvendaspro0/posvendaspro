import { requireClient } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileUserForm } from '@/components/dashboard/profile-user-form';
import { ProfileCompanyForm } from '@/components/dashboard/profile-company-form';
import { ProfilePasswordForm } from '@/components/dashboard/profile-password-form';
import { Separator } from '@/components/ui/separator';
import { User, Building2, Lock, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Página de Perfil do Cliente
 * Permite visualizar e editar informações pessoais, da empresa e alterar senha
 */
export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  // Buscar dados do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Buscar dados da empresa
  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: {
      id: true,
      name: true,
      cnpj: true,
      email: true,
      responsibleFirstName: true,
      responsibleLastName: true,
      whatsapp: true,
      cep: true,
      street: true,
      number: true,
      complement: true,
      neighborhood: true,
      city: true,
      state: true,
      createdAt: true,
    },
  });

  // Buscar estatísticas
  const [totalTickets, totalOperators] = await Promise.all([
    prisma.ticket.count({
      where: { companyId: session.user.companyId },
    }),
    prisma.operator.count({
      where: { companyId: session.user.companyId },
    }),
  ]);

  if (!user || !company) {
    return <div>Erro ao carregar informações</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-500 mt-1">
          Gerencie suas informações pessoais e da empresa
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Membro desde
            </CardTitle>
            <User className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {format(new Date(user.createdAt), 'MMM/yyyy', { locale: ptBR })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Tickets
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalTickets}</div>
            <p className="text-xs text-slate-500 mt-1">
              {totalTickets === 0
                ? 'Nenhum ticket cadastrado'
                : totalTickets === 1
                ? '1 ticket cadastrado'
                : `${totalTickets} tickets cadastrados`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Operadores
            </CardTitle>
            <User className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalOperators}</div>
            <p className="text-xs text-slate-500 mt-1">
              {totalOperators === 0
                ? 'Nenhum operador cadastrado'
                : totalOperators === 1
                ? '1 operador ativo'
                : `${totalOperators} operadores ativos`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-700" />
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Seus dados de acesso ao sistema</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileUserForm
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
            }}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-700" />
            <div>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados cadastrais da sua empresa
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileCompanyForm company={company} />
        </CardContent>
      </Card>

      <Separator />

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-700" />
            <div>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Altere sua senha de acesso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfilePasswordForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}

