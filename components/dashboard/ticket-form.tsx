'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema, type TicketInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle } from 'lucide-react';

interface TicketFormProps {
  initialData?: Partial<TicketInput> & { id?: string };
  mode: 'create' | 'edit';
}

const problemTypeOptions = [
  { value: 'PRODUCT_NOT_RECEIVED', label: 'Produto não recebido' },
  { value: 'PRODUCT_DEFECTIVE', label: 'Produto com defeito' },
  { value: 'WRONG_PRODUCT', label: 'Produto errado' },
  { value: 'LATE_DELIVERY', label: 'Entrega atrasada' },
  { value: 'DAMAGED_PACKAGE', label: 'Embalagem danificada' },
  { value: 'RETURN_REQUEST', label: 'Solicitação de devolução' },
  { value: 'OTHER', label: 'Outro' },
];

const statusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'RESOLVED', label: 'Resolvido' },
  { value: 'CLOSED', label: 'Fechado' },
];

/**
 * Formulário de Ticket
 * Usado para criar e editar tickets
 */
export function TicketForm({ initialData, mode }: TicketFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Função para obter data/hora local no formato correto para datetime-local
  const getLocalDateTimeString = (date?: Date | string) => {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      complaintDate: initialData.complaintDate 
        ? getLocalDateTimeString(initialData.complaintDate)
        : getLocalDateTimeString(),
    } : {
      status: 'PENDING',
      complaintDate: getLocalDateTimeString(), // Data e hora atuais
      affectedReputation: false,
    },
  });

  const onSubmit = async (data: TicketInput) => {
    setError('');
    setIsLoading(true);

    try {
      const url = mode === 'create' 
        ? '/api/tickets' 
        : `/api/tickets/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar ticket');
      }

      router.push('/dashboard/tickets');
      router.refresh();
    } catch (err) {
      console.error('Erro ao salvar ticket:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar ticket');
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Novo Ticket' : 'Editar Ticket'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Preencha os dados para cadastrar um novo ticket'
            : 'Atualize as informações do ticket'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ID do Ticket (apenas exibição no modo editar) */}
          {mode === 'edit' && initialData?.id && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-600">ID do Ticket</Label>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {initialData.id}
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Gerado automaticamente
                </div>
              </div>
            </div>
          )}

          {/* Informativo de ID Automático (apenas no modo criar) */}
          {mode === 'create' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🎫 <strong>ID Automático:</strong> O ID do ticket será gerado automaticamente de forma sequencial (ex: TICKET-0001, TICKET-0002...).
              </p>
            </div>
          )}

          {/* Data da Reclamação */}
          <div className="space-y-2">
            <Label htmlFor="complaintDate">Data e Hora da Reclamação *</Label>
            <Input
              id="complaintDate"
              type="datetime-local"
              disabled={isLoading}
              {...register('complaintDate')}
              className={errors.complaintDate ? 'border-red-500' : ''}
            />
            {errors.complaintDate && (
              <p className="text-sm text-red-500">{errors.complaintDate.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Data e hora em que a reclamação foi registrada (preenchido automaticamente)
            </p>
          </div>

          {/* Status e Responsável */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                placeholder="Nome do responsável"
                disabled={isLoading}
                {...register('responsible')}
              />
            </div>
          </div>

          {/* ID do Pedido ML e SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mlOrderId">ID Pedido ML</Label>
              <Input
                id="mlOrderId"
                placeholder="MLB1234567890"
                disabled={isLoading}
                {...register('mlOrderId')}
              />
              <p className="text-xs text-slate-500">
                ID do pedido no Mercado Livre (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productSku">SKU do Produto</Label>
              <Input
                id="productSku"
                placeholder="SKU123456"
                disabled={isLoading}
                {...register('productSku')}
              />
            </div>
          </div>

          {/* Tipo de Problema */}
          <div className="space-y-2">
            <Label htmlFor="problemType">Tipo de Problema *</Label>
            <Controller
              name="problemType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.problemType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo de problema" />
                  </SelectTrigger>
                  <SelectContent>
                    {problemTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.problemType && (
              <p className="text-sm text-red-500">{errors.problemType.message}</p>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label htmlFor="observation">Observação *</Label>
            <Textarea
              id="observation"
              placeholder="Descreva o problema e as ações tomadas..."
              rows={4}
              disabled={isLoading}
              {...register('observation')}
              className={errors.observation ? 'border-red-500' : ''}
            />
            {errors.observation && (
              <p className="text-sm text-red-500">{errors.observation.message}</p>
            )}
          </div>

          {/* Informações de Resolução */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-900 mb-4">Informações de Resolução</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resolutionCost">Custo da Resolução (R$)</Label>
                <Input
                  id="resolutionCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isLoading}
                  {...register('resolutionCost')}
                  className={errors.resolutionCost ? 'border-red-500' : ''}
                />
                {errors.resolutionCost && (
                  <p className="text-sm text-red-500">{errors.resolutionCost.message}</p>
                )}
                <p className="text-xs text-slate-500">
                  Valor gasto para resolver este ticket (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="affectedReputation" className="block mb-3">
                  Afetou a Reputação?
                </Label>
                <Controller
                  name="affectedReputation"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="affectedReputation"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="affectedReputation"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sim, afetou a reputação no Mercado Livre
                      </label>
                    </div>
                  )}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Resolução Automática:</strong> A data e o tempo de resolução serão calculados automaticamente quando o status for alterado para "Resolvido" ou "Fechado".
                </p>
              </div>
            </div>
          </div>

          {/* Informações do Cliente (opcional) */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-900 mb-4">Informações do Cliente (Opcional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Nome do cliente"
                  disabled={isLoading}
                  {...register('clientName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">E-mail do Cliente</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="cliente@email.com"
                  disabled={isLoading}
                  {...register('clientEmail')}
                  className={errors.clientEmail ? 'border-red-500' : ''}
                />
                {errors.clientEmail && (
                  <p className="text-sm text-red-500">{errors.clientEmail.message}</p>
                )}
              </div>
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
                  Salvando...
                </>
              ) : (
                mode === 'create' ? 'Criar Ticket' : 'Salvar Alterações'
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

