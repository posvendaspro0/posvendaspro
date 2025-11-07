'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, type CompanyInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface CompanyFormProps {
  initialData?: CompanyInput & { id?: string };
  mode: 'create' | 'edit';
}

/**
 * Formulário de Empresa
 * Usado para criar e editar empresas
 */
export function CompanyForm({ initialData, mode }: CompanyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: CompanyInput) => {
    setError('');
    setIsLoading(true);

    try {
      const url = mode === 'create' 
        ? '/api/companies' 
        : `/api/companies/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar empresa');
      }

      router.push('/admin/empresas');
      router.refresh();
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa');
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Nova Empresa' : 'Editar Empresa'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Preencha os dados para cadastrar uma nova empresa'
            : 'Atualize as informações da empresa'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              placeholder="Ex: Minha Empresa Ltda"
              disabled={isLoading}
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              disabled={isLoading}
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ (opcional)</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              disabled={isLoading}
              {...register('cnpj')}
              className={errors.cnpj ? 'border-red-500' : ''}
            />
            {errors.cnpj && (
              <p className="text-sm text-red-500">{errors.cnpj.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Digite apenas os números do CNPJ
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                mode === 'create' ? 'Criar Empresa' : 'Salvar Alterações'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

