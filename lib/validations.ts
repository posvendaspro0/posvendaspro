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
    message: 'Perfil inválido',
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

// Schema para criação de ticket
export const ticketSchema = z.object({
  id: z
    .string()
    .min(1, 'ID é obrigatório')
    .max(50, 'ID deve ter no máximo 50 caracteres')
    .regex(/^[A-Za-z0-9-_]+$/, 'ID deve conter apenas letras, números, hífens e underscores'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], {
    message: 'Status inválido',
  }),
  responsible: z.string().optional(),
  complaintDate: z.string().min(1, 'Data da reclamação é obrigatória'),
  mlOrderId: z.string().optional(),
  productSku: z.string().optional(),
  problemType: z.enum([
    'PRODUCT_NOT_RECEIVED',
    'PRODUCT_DEFECTIVE',
    'WRONG_PRODUCT',
    'LATE_DELIVERY',
    'DAMAGED_PACKAGE',
    'RETURN_REQUEST',
    'OTHER',
  ], {
    message: 'Tipo de problema inválido',
  }),
  observation: z
    .string()
    .min(1, 'Observação é obrigatória')
    .min(10, 'Observação deve ter no mínimo 10 caracteres'),
  resolutionCost: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, { message: 'Custo deve ser um número válido' }),
  affectedReputation: z.boolean().default(false),
  clientName: z.string().optional(),
  clientEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export type TicketInput = z.infer<typeof ticketSchema>;

// Schema para cadastro de empresa (self-service)
export const registerCompanySchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  companyName: z
    .string()
    .min(1, 'Nome da empresa é obrigatório')
    .min(3, 'Nome da empresa deve ter no mínimo 3 caracteres')
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial'),
  confirmPassword: z.string().min(1, 'Confirme sua senha'),
  whatsapp: z
    .string()
    .min(1, 'WhatsApp é obrigatório')
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'WhatsApp inválido. Use: (11) 99999-9999'),
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .regex(/^\d{5}-\d{3}$/, 'CEP inválido. Use: 00000-000'),
  street: z
    .string()
    .min(1, 'Rua é obrigatória')
    .min(3, 'Rua deve ter no mínimo 3 caracteres'),
  number: z
    .string()
    .min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .min(2, 'Bairro deve ter no mínimo 2 caracteres'),
  city: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  state: z
    .string()
    .min(1, 'Estado é obrigatório')
    .length(2, 'Use a sigla do estado (ex: SP)'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;

// Schema de validação para criação de operador
export const operatorSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

export type OperatorInput = z.infer<typeof operatorSchema>;

// Schema para atualização de operador (senha opcional)
export const updateOperatorSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type UpdateOperatorInput = z.infer<typeof updateOperatorSchema>;

