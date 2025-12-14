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
}

export function MlClaimEditForm({ companyId, mlClaimId, mlOrderId }: MlClaimEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<MlClaimDataInput>({
    resolver: zodResolver(mlClaimDataSchema) as any,
  });

  // Carregar dados existentes
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/ml/claim-data/${mlClaimId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.claimData) {
            setValue('responsible', data.claimData.responsible || '');
            setValue('productSku', data.claimData.productSku || '');
            setValue('problemType', data.claimData.problemType || '');
            setValue('resolutionCost', data.claimData.resolutionCost?.toString() || '');
            setValue('observation', data.claimData.observation || '');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mlClaimId, setValue]);

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
        resolutionCost: data.resolutionCost ? parseFloat(data.resolutionCost) : null,
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

      {/* Responsável */}
      <div className="space-y-2">
        <Label htmlFor="responsible">
          Responsável
        </Label>
        <Input
          id="responsible"
          placeholder="Nome do operador responsável"
          {...register('responsible')}
        />
        <p className="text-sm text-slate-500">
          Quem do time está cuidando do caso
        </p>
      </div>

      {/* SKU do Produto */}
      <div className="space-y-2">
        <Label htmlFor="productSku">
          Produto (SKU)
        </Label>
        <Input
          id="productSku"
          placeholder="Ex: ABC-123"
          {...register('productSku')}
        />
        <p className="text-sm text-slate-500">
          Código do produto envolvido na reclamação
        </p>
      </div>

      {/* Tipo de Problema */}
      <div className="space-y-2">
        <Label htmlFor="problemType">
          Tipo de Problema
        </Label>
        <Controller
          name="problemType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
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
        <p className="text-sm text-slate-500">
          Padronize para gerar métricas precisas
        </p>
      </div>

      {/* Custo de Resolução */}
      <div className="space-y-2">
        <Label htmlFor="resolutionCost">
          Custo de Resolução (R$)
        </Label>
        <Input
          id="resolutionCost"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register('resolutionCost')}
        />
        <p className="text-sm text-slate-500">
          Custo total para resolver o caso (frete, peças, etc.)
        </p>
        {errors.resolutionCost && (
          <p className="text-sm text-red-600">{errors.resolutionCost.message}</p>
        )}
      </div>

      {/* Observação */}
      <div className="space-y-2">
        <Label htmlFor="observation">
          Observação
        </Label>
        <Textarea
          id="observation"
          rows={4}
          placeholder="Descreva brevemente um resumo sobre o caso..."
          {...register('observation')}
        />
        <p className="text-sm text-slate-500">
          Ex.: Cliente recebeu a peça com o vidro quebrado
        </p>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3">
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
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

