'use client';

/**
 * Formulário de Edição de Dados Complementares da Claim ML
 * Permite editar campos que o ML não fornece
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

// Schema de validação
const mlClaimDataSchema = z.object({
  responsible: z.string().optional(),
  productSku: z.string().optional(),
  problemType: z.string().optional(),
  resolutionCost: z.string().optional(),
  observation: z.string().optional(),
});

type MlClaimDataInput = z.infer<typeof mlClaimDataSchema>;

interface MlClaimEditFormProps {
  companyId: string;
  mlClaimId: string;
  mlOrderId?: string;
  initialData?: {
    responsible?: string | null;
    productSku?: string | null;
    problemType?: string | null;
    resolutionCost?: string | number | null;
    observation?: string | null;
  };
}

export function MlClaimEditForm({
  companyId,
  mlClaimId,
  mlOrderId,
  initialData,
}: MlClaimEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<MlClaimDataInput>({
    resolver: zodResolver(mlClaimDataSchema) as any,
    defaultValues: initialData
      ? {
          responsible: initialData.responsible ?? '',
          productSku: initialData.productSku ?? '',
          problemType: initialData.problemType ?? '',
          resolutionCost:
            initialData.resolutionCost !== null &&
            initialData.resolutionCost !== undefined
              ? String(initialData.resolutionCost)
              : '',
          observation: initialData.observation ?? '',
        }
      : undefined,
  });

  // Carregar dados existentes
  useEffect(() => {
    async function loadData() {
      try {
        if (initialData) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await fetch(`/api/ml/claim-data/${mlClaimId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.claimData) {
            reset({
              responsible: data.claimData.responsible || '',
              productSku: data.claimData.productSku || '',
              problemType: data.claimData.problemType || '',
              resolutionCost: data.claimData.resolutionCost?.toString() || '',
              observation: data.claimData.observation || '',
            });
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [initialData, mlClaimId, reset]);

  const parseCurrencyToNumber = (value?: string) => {
    if (!value) return null;
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const formatCurrencyBRL = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = Number(digits) / 100;
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const onSubmit = async (data: MlClaimDataInput) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Preparar dados para envio
      const payload = {
        mlClaimId: String(mlClaimId),  // ✅ Converter para string
        mlOrderId: mlOrderId ? String(mlOrderId) : null,  // ✅ Converter para string
        responsible: data.responsible || null,
        productSku: data.productSku || null,
        problemType: data.problemType || null,
        resolutionCost: parseCurrencyToNumber(data.resolutionCost),
        observation: data.observation || null,
      };

      console.log('[ML Claim Edit Form] Enviando dados:', payload);

      const response = await fetch(`/api/ml/claim-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[ML Claim Edit Form] Erro na resposta:', result);
        throw new Error(result.error || 'Erro ao salvar dados');
      }

      console.log('[ML Claim Edit Form] Salvo com sucesso:', result);
      setSuccess(true);
      // Salva alterações localmente para refletir na tabela ao voltar
      try {
        const rawEdits = localStorage.getItem('ml-claim-edits');
        const edits = rawEdits ? JSON.parse(rawEdits) : {};
        edits[String(mlClaimId)] = {
          responsible: payload.responsible,
          productSku: payload.productSku,
          problemType: payload.problemType,
          resolutionCost: payload.resolutionCost,
          observation: payload.observation,
        };
        localStorage.setItem('ml-claim-edits', JSON.stringify(edits));
      } catch (err) {
        console.warn('[ML Claim Edit Form] Falha ao salvar cache local:', err);
      }
      // Atualiza o cache da listagem sem travar a UI
      fetch('/api/ml/claims?refresh=1', { cache: 'no-store' }).catch(() => null);
      localStorage.setItem('ml-claims-refresh', '1');
      window.dispatchEvent(new Event('ml-claims-updated'));
      router.refresh();

      // Limpar mensagem de sucesso após 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[ML Claim Edit Form] Erro ao salvar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
        <span className="ml-2 text-slate-600">Carregando dados...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Mensagens */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Dados salvos com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Responsável */}
        <div className="space-y-2">
          <Label htmlFor="responsible" className="text-sm font-semibold text-slate-700">
            Responsável
          </Label>
          <Input
            id="responsible"
            placeholder="Nome do operador responsável"
            className="h-11"
            {...register('responsible')}
          />
          <p className="text-xs text-slate-500">
            Quem do time está cuidando do caso
          </p>
        </div>

        {/* SKU do Produto */}
        <div className="space-y-2">
          <Label htmlFor="productSku" className="text-sm font-semibold text-slate-700">
            Produto (SKU)
          </Label>
          <Input
            id="productSku"
            placeholder="Ex: ABC-123"
            className="h-11 font-mono"
            {...register('productSku')}
          />
          <p className="text-xs text-slate-500">
            Código do produto envolvido na reclamação
          </p>
        </div>

        {/* Tipo de Problema */}
        <div className="space-y-2">
          <Label htmlFor="problemType" className="text-sm font-semibold text-slate-700">
            Tipo de Problema
          </Label>
          <Controller
            name="problemType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione o tipo de problema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quebrado">Quebrado</SelectItem>
                  <SelectItem value="enviado_errado">Enviado Errado</SelectItem>
                  <SelectItem value="quantidade_incorreta">Quantidade Incorreta</SelectItem>
                  <SelectItem value="enviado_mesmo_lado">Enviado Mesmo Lado</SelectItem>
                  <SelectItem value="erro_cliente">Erro Cliente</SelectItem>
                  <SelectItem value="lado_cor_incorreto">Lado/Cor Incorreto</SelectItem>
                  <SelectItem value="defeito_fabrica">Defeito Fábrica</SelectItem>
                  <SelectItem value="arrependimento_compra">Arrependimento Compra</SelectItem>
                  <SelectItem value="compatibilidade">Compatibilidade</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-slate-500">
            Padronize para gerar métricas precisas
          </p>
        </div>

        {/* Custo de Resolução */}
        <div className="space-y-2">
          <Label htmlFor="resolutionCost" className="text-sm font-semibold text-slate-700">
            Custo de Resolução (R$)
          </Label>
          <Input
            id="resolutionCost"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            className="h-11"
            {...register('resolutionCost', {
              onChange: (event) => {
                const formatted = formatCurrencyBRL(event.target.value);
                setValue('resolutionCost', formatted, {
                  shouldDirty: true,
                  shouldValidate: false,
                });
              },
            })}
          />
          <p className="text-xs text-slate-500">
            Custo total para resolver o caso (frete, peças, etc.)
          </p>
          {errors.resolutionCost && (
            <p className="text-xs text-red-600">{errors.resolutionCost.message}</p>
          )}
        </div>
      </div>

      {/* Observação */}
      <div className="space-y-2">
        <Label htmlFor="observation" className="text-sm font-semibold text-slate-700">
          Observação
        </Label>
        <Textarea
          id="observation"
          rows={4}
          placeholder="Descreva brevemente um resumo sobre o caso..."
          className="min-h-[120px]"
          {...register('observation')}
        />
        <p className="text-xs text-slate-500">
          Ex.: Cliente recebeu a peça com o vidro quebrado
        </p>
      </div>

      <Separator className="bg-slate-200" />

      {/* Botão Salvar */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saving || !isDirty}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

