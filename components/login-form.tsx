'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Componente de Formulário de Login
 * Validação com react-hook-form + zod
 * Autenticação via NextAuth.js
 */
export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Preencher email se vier do cadastro
  useEffect(() => {
    const email = searchParams.get('email');
    const registered = searchParams.get('registered');
    
    if (email) {
      setValue('email', email);
    }
    
    if (registered === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('E-mail ou senha incorretos. Tente novamente.');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Login bem-sucedido! Redirecionar para a raiz
        // A página raiz vai detectar o role e redirecionar apropriadamente
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = '/';
      } else {
        setError('Erro ao fazer login. Tente novamente.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError('Erro ao processar login. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Login
        </CardTitle>
        <CardDescription className="text-center">
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {showSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Cadastro realizado com sucesso! Faça login com suas credenciais.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isLoading}
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Não tem uma conta?{' '}
            <Link 
              href="/cadastro" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Cadastre sua empresa
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-600 mb-2">Credenciais de teste:</p>
          <p className="font-mono text-xs mt-1">
            Admin: admin@posvendaspro.com / Admin@123
          </p>
          <p className="font-mono text-xs">
            Cliente: cliente@exemplo.com / Cliente@123
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

