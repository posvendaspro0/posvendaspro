import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireClient } from '@/lib/auth-helpers';
import { getOperatorById } from '@/services/operator-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Edit, User, Mail, Calendar, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Página de Visualização de Operador
 * Mostra todos os detalhes do operador
 */
export const dynamic = 'force-dynamic';

export default async function VisualizarOperadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireClient();

  if (!session.user.companyId) {
    return <div>Erro: Usuário não está vinculado a uma empresa</div>;
  }

  const { id } = await params;
  const operator = await getOperatorById(id, session.user.companyId);

  if (!operator) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/operadores">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{operator.name}</h1>
            <p className="text-slate-500 mt-1">
              Visualize as informações do operador
            </p>
          </div>
        </div>

        <Link href={`/dashboard/operadores/${operator.id}/editar`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Informações do Operador */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <User className="h-4 w-4" />
                <span className="font-medium">Nome</span>
              </div>
              <p className="text-slate-900 font-medium">{operator.name}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Mail className="h-4 w-4" />
                <span className="font-medium">E-mail</span>
              </div>
              <p className="text-slate-900">{operator.email}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Status</span>
              </div>
              <div className="flex items-center gap-2">
                {operator.isActive ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-slate-500" />
                    <Badge className="bg-slate-100 text-slate-800">Inativo</Badge>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Cadastrado em</span>
              </div>
              <p className="text-slate-900">
                {format(new Date(operator.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Última atualização</span>
              </div>
              <p className="text-slate-900">
                {format(new Date(operator.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sobre</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">
            {operator.isActive
              ? 'Este operador tem permissão para gerenciar os tickets da empresa.'
              : 'Este operador está inativo e não pode acessar o sistema.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

