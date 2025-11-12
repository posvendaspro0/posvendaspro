import { Role, TicketStatus, ProblemType } from '@prisma/client';

// Re-exportar enums do Prisma para facilitar importação
export { Role, TicketStatus, ProblemType };

// Tipos para sessão customizada do NextAuth
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
}

// Tipo estendido para a sessão do NextAuth
export interface ExtendedSession {
  user: SessionUser;
  expires: string;
}

// Tipos para dados de empresa
export interface Company {
  id: string;
  name: string;
  cnpj?: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyWithUsers extends Company {
  users: User[];
  _count?: {
    tickets: number;
    mlAccounts: number;
  };
}

// Tipos para usuários
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithCompany extends User {
  company?: Company | null;
}

// Tipos para tickets
export interface Ticket {
  id: string;
  companyId: string;
  status: TicketStatus;
  responsible?: string | null;
  mlOrderId?: string | null;
  productSku?: string | null;
  problemType: ProblemType;
  observation: string;
  resolutionDate?: Date | null;
  resolutionCost?: number | null;
  affectedReputation: boolean;
  resolutionTime?: number | null;
  mlComplaintId?: string | null;
  mlStatus?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date | null;
}

export interface TicketWithCompany extends Ticket {
  company: Company;
}

// Tipos para conta do Mercado Livre
export interface MlAccount {
  id: string;
  companyId: string;
  mercadoLivreUserId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para formulários
export interface LoginFormData {
  email: string;
  password: string;
}

export interface CompanyFormData {
  name: string;
  email: string;
  cnpj?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: Role;
  companyId?: string;
}

// Tipos para estatísticas
export interface DashboardStats {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
}

export interface AdminStats {
  totalCompanies: number;
  totalUsers: number;
  totalTickets: number;
  activeCompanies: number;
}

// Tipo para resposta de API padrão
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

