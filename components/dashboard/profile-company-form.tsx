'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { applyWhatsAppMask, applyCepMask } from '@/lib/input-masks';

const profileCompanySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da empresa é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cnpj: z.string().optional(),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .toLowerCase(),
  responsibleFirstName: z.string().optional(),
  responsibleLastName: z.string().optional(),
  whatsapp: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ProfileCompanyInput = z.infer<typeof profileCompanySchema>;

interface ProfileCompanyFormProps {
  company: {
    id: string;
    name: string;
    cnpj: string | null;
    email: string;
    responsibleFirstName: string | null;
    responsibleLastName: string | null;
    whatsapp: string | null;
    cep: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
  };
}

export function ProfileCompanyForm({ company }: ProfileCompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProfileCompanyInput>({
    resolver: zodResolver(profileCompanySchema),
    defaultValues: {
      name: company.name,
      cnpj: company.cnpj || '',
      email: company.email,
      responsibleFirstName: company.responsibleFirstName || '',
      responsibleLastName: company.responsibleLastName || '',
      whatsapp: company.whatsapp || '',
      cep: company.cep || '',
      street: company.street || '',
      number: company.number || '',
      complement: company.complement || '',
      neighborhood: company.neighborhood || '',
      city: company.city || '',
      state: company.state || '',
    },
  });

  const whatsapp = watch('whatsapp');
  const cep = watch('cep');

  const onSubmit = async (data: ProfileCompanyInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar informações da empresa');
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar informações da empresa'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Informações da empresa atualizadas com sucesso!</AlertDescription>
        </Alert>
      )}

      {/* Dados da Empresa */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Dados da Empresa</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              placeholder="Nome da empresa"
              disabled={isLoading}
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              disabled={isLoading}
              {...register('cnpj')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail da Empresa *</Label>
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
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="(00) 00000-0000"
              disabled={isLoading}
              value={whatsapp}
              onChange={(e) => setValue('whatsapp', applyWhatsAppMask(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Responsável */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Responsável</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="responsibleFirstName">Nome</Label>
            <Input
              id="responsibleFirstName"
              placeholder="Nome do responsável"
              disabled={isLoading}
              {...register('responsibleFirstName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibleLastName">Sobrenome</Label>
            <Input
              id="responsibleLastName"
              placeholder="Sobrenome do responsável"
              disabled={isLoading}
              {...register('responsibleLastName')}
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Endereço</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              placeholder="00000-000"
              disabled={isLoading}
              value={cep}
              onChange={(e) => setValue('cep', applyCepMask(e.target.value))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              placeholder="Nome da rua"
              disabled={isLoading}
              {...register('street')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              placeholder="Nº"
              disabled={isLoading}
              {...register('number')}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              placeholder="Apto, sala, etc"
              disabled={isLoading}
              {...register('complement')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              placeholder="Bairro"
              disabled={isLoading}
              {...register('neighborhood')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              placeholder="Cidade"
              disabled={isLoading}
              {...register('city')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              placeholder="UF"
              maxLength={2}
              disabled={isLoading}
              {...register('state')}
              onChange={(e) => setValue('state', e.target.value.toUpperCase())}
            />
          </div>
        </div>
      </div>

      {/* Botão */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>
    </form>
  );
}

