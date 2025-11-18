'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { operatorSchema, updateOperatorSchema, type OperatorInput, type UpdateOperatorInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

interface OperatorFormProps {
  mode: 'create' | 'edit';
  initialData?: UpdateOperatorInput & { id: string };
}

export function OperatorForm({ mode, initialData }: OperatorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const schema = mode === 'create' ? operatorSchema : updateOperatorSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OperatorInput | UpdateOperatorInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData || {
      name: '',
      email: '',
      password: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  const onSubmit = async (data: OperatorInput | UpdateOperatorInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = mode === 'create' 
        ? '/api/operators' 
        : `/api/operators/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar operador');
      }

      router.push('/dashboard/operadores');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar operador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Ex: João Silva"
                disabled={isLoading}
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="operador@exemplo.com"
                disabled={isLoading}
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
              <p className="text-xs text-slate-500">
                {mode === 'create' 
                  ? 'O operador usará este e-mail para fazer login'
                  : 'Altere apenas se necessário'}
              </p>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Senha {mode === 'create' ? '*' : '(deixe vazio para manter)'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === 'create' ? 'Mínimo 6 caracteres' : 'Nova senha'}
                disabled={isLoading}
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
              <p className="text-xs text-slate-500">
                {mode === 'create'
                  ? 'A senha deve ter no mínimo 6 caracteres'
                  : 'Preencha apenas se quiser alterar a senha'}
              </p>
            </div>

            {/* Status (apenas no modo edição) */}
            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={isActive as boolean}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer font-normal">
                    {isActive ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
                <p className="text-xs text-slate-500">
                  Operadores inativos não podem acessar o sistema
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Link href="/dashboard/operadores">
              <Button type="button" variant="outline" disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : mode === 'create' ? (
                'Cadastrar Operador'
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

