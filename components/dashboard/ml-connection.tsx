'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Link as LinkIcon, 
  Zap, 
  RefreshCw, 
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface MercadoLivreConnectionProps {
  isConnected: boolean;
  mlUserId?: string;
}

export function MercadoLivreConnection({ isConnected, mlUserId }: MercadoLivreConnectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Verificar status da URL (sucesso ou erro no callback)
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'connected') {
      setAlert({ type: 'success', message: 'Conta do Mercado Livre conectada com sucesso!' });
      // Limpar URL após 3 segundos
      setTimeout(() => router.push('/dashboard/integracao'), 3000);
    } else if (error) {
      let errorMessage = 'Erro ao conectar com Mercado Livre';
      if (error === 'auth_failed') errorMessage = 'Falha na autenticação';
      if (error === 'invalid_params') errorMessage = 'Parâmetros inválidos';
      setAlert({ type: 'error', message: errorMessage });
    }
  }, [searchParams, router]);

  const handleConnect = () => {
    // Redireciona para o endpoint de autenticação
    window.location.href = '/api/ml/auth';
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setAlert(null);

    try {
      const response = await fetch('/api/ml/disconnect', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Conta desconectada com sucesso!' });
        setTimeout(() => router.refresh(), 1500);
      } else {
        throw new Error(data.error || 'Erro ao desconectar');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao desconectar conta',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status da Conexão</CardTitle>
              <CardDescription>Gerencie a conexão com sua conta do Mercado Livre</CardDescription>
            </div>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-600">
                <XCircle className="h-3 w-3 mr-1" />
                Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Conta conectada com sucesso!</p>
                    <p className="text-sm text-green-700 mt-1">
                      ID do Usuário ML: <span className="font-mono">{mlUserId}</span>
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      Seus tickets agora podem ser sincronizados automaticamente com as reclamações do Mercado Livre.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    'Desconectar Conta'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Nenhuma conta conectada</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Conecte sua conta do Mercado Livre para começar a sincronizar pedidos, reclamações e envios automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleConnect}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Conectar Mercado Livre
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recursos da Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos da Integração</CardTitle>
          <CardDescription>O que você pode fazer com a integração ativa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="rounded-full bg-blue-100 p-2 h-fit">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Importação Automática</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Tickets criados automaticamente a partir de reclamações e pedidos do Mercado Livre
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-green-100 p-2 h-fit">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Sincronização em Tempo Real</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Atualizações automáticas entre o sistema e o Mercado Livre via webhook
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-purple-100 p-2 h-fit">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Segurança OAuth2</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Autenticação segura com tokens criptografados e renovação automática
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-orange-100 p-2 h-fit">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Dados Completos</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Acesso a pedidos, reclamações, envios, mensagens e métricas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

