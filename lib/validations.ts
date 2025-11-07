import { z } from 'zod';

// Schema de validação para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Schema de validação para criação de empresa
export const companySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da empresa é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  cnpj: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // Remove caracteres não numéricos
        const cleanCnpj = val.replace(/\D/g, '');
        return cleanCnpj.length === 14;
      },
      { message: 'CNPJ deve ter 14 dígitos' }
    ),
});

export type CompanyInput = z.infer<typeof companySchema>;

// Schema de validação para criação de usuário
export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial'),
  role: z.enum(['ADMIN', 'CLIENT'], {
    errorMap: () => ({ message: 'Perfil inválido' }),
  }),
  companyId: z.string().optional(),
});

export type UserInput = z.infer<typeof userSchema>;

// Schema para atualização de usuário (senha opcional)
export const updateUserSchema = userSchema.extend({
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial')
    .optional()
    .or(z.literal('')),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Schema para reclamação (preparado para futura integração)
export const complaintSchema = z.object({
  mlOrderId: z.string().min(1, 'ID do pedido é obrigatório'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  clientEmail: z.string().email('E-mail inválido').optional(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;

