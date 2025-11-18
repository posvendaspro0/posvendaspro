'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerCompanySchema, type RegisterCompanyInput } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import { maskWhatsApp, maskCEP } from '@/lib/input-masks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle, Search } from 'lucide-react';

/**
 * Componente de Cadastro de Empresa
 * Self-service para novas empresas se cadastrarem
 */
export function RegisterCompanyForm() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterCompanyInput>({
    resolver: zodResolver(registerCompanySchema) as any,
    mode: 'onChange', // Validação em tempo real
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const cep = watch('cep');

  // Verificar força da senha em tempo real
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Fraca', color: 'text-red-500' };
    if (score === 3 || score === 4) return { score, label: 'Média', color: 'text-orange-500' };
    return { score, label: 'Forte', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  // Buscar endereço por CEP
  const handleCepSearch = async () => {
    if (!cep || cep.length < 9) return;

    setSearchingCep(true);
    const cleanCep = cep.replace(/\D/g, '');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        setSearchingCep(false);
        return;
      }

      // Preencher campos automaticamente
      setValue('street', data.logradouro);
      setValue('neighborhood', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.uf);
      
      setError('');
      setSearchingCep(false);
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      setError('Erro ao buscar CEP. Tente novamente.');
      setSearchingCep(false);
    }
  };

  const onSubmit = async (data: RegisterCompanyInput) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar empresa');
      }

      setSuccess(true);
      
      // Aguardar 2 segundos e redirecionar para login
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(data.email)}&registered=true`);
      }, 2000);
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar empresa');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="shadow-lg border-slate-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-slate-900">
              Cadastro Realizado com Sucesso!
            </h3>
            <p className="text-slate-600">
              Sua empresa foi cadastrada. Redirecionando para o login...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Cadastrar Empresa
        </CardTitle>
        <CardDescription className="text-center">
          Preencha os dados para criar sua conta
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

          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                placeholder="João"
                disabled={isLoading}
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome *</Label>
              <Input
                id="lastName"
                placeholder="Silva"
                disabled={isLoading}
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa *</Label>
            <Input
              id="companyName"
              placeholder="Minha Empresa Ltda"
              disabled={isLoading}
              {...register('companyName')}
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-xs text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              autoComplete="email"
              disabled={isLoading}
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              disabled={isLoading}
              {...register('whatsapp')}
              onChange={(e) => {
                const masked = maskWhatsApp(e.target.value);
                setValue('whatsapp', masked);
              }}
              className={errors.whatsapp ? 'border-red-500' : ''}
            />
            {errors.whatsapp && (
              <p className="text-xs text-red-500">{errors.whatsapp.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600">Força da senha:</span>
                <span className={`font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      passwordStrength.score <= 2 ? 'bg-red-500' :
                      passwordStrength.score <= 4 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && password && (
              <div className="flex items-center gap-1 text-xs">
                {confirmPassword === password ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Senhas conferem</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Senhas não conferem</span>
                  </>
                )}
              </div>
            )}
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* CEP com busca */}
          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="cep"
                  placeholder="00000-000"
                  disabled={isLoading}
                  {...register('cep')}
                  onChange={(e) => {
                    const masked = maskCEP(e.target.value);
                    setValue('cep', masked);
                  }}
                  className={errors.cep ? 'border-red-500' : ''}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCepSearch}
                disabled={isLoading || searchingCep || !cep || cep.length < 9}
              >
                {searchingCep ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.cep && (
              <p className="text-xs text-red-500">{errors.cep.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Clique na lupa para buscar o endereço automaticamente
            </p>
          </div>

          {/* Rua e Número */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                placeholder="Nome da rua"
                disabled={isLoading}
                {...register('street')}
                className={errors.street ? 'border-red-500' : ''}
              />
              {errors.street && (
                <p className="text-xs text-red-500">{errors.street.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                placeholder="123"
                disabled={isLoading}
                {...register('number')}
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && (
                <p className="text-xs text-red-500">{errors.number.message}</p>
              )}
            </div>
          </div>

          {/* Complemento e Bairro */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                placeholder="Apto, Sala, etc"
                disabled={isLoading}
                {...register('complement')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                placeholder="Centro"
                disabled={isLoading}
                {...register('neighborhood')}
                className={errors.neighborhood ? 'border-red-500' : ''}
              />
              {errors.neighborhood && (
                <p className="text-xs text-red-500">{errors.neighborhood.message}</p>
              )}
            </div>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                placeholder="São Paulo"
                disabled={isLoading}
                {...register('city')}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">UF *</Label>
              <Input
                id="state"
                placeholder="SP"
                maxLength={2}
                disabled={isLoading}
                {...register('state')}
                className={errors.state ? 'border-red-500' : 'uppercase'}
                onChange={(e) => setValue('state', e.target.value.toUpperCase())}
              />
              {errors.state && (
                <p className="text-xs text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/login')}
              disabled={isLoading}
            >
              Voltar
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500 mt-4">
            Ao criar sua conta, você concorda com nossos termos de uso
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

