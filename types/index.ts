import { Role, ComplaintStatus } from '@prisma/client';

// Re-exportar enums do Prisma para facilitar importação
export { Role, ComplaintStatus };

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
    complaints: number;
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

// Tipos para reclamações (preparado para integração ML)
export interface Complaint {
  id: string;
  companyId: string;
  mlOrderId: string;
  mlComplaintId: string;
  clientName: string;
  clientEmail?: string | null;
  reason: string;
  description: string;
  status: ComplaintStatus;
  mlStatus: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
  mlCreatedAt: Date;
  lastSyncAt: Date;
}

export interface ComplaintWithCompany extends Complaint {
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
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
}

export interface AdminStats {
  totalCompanies: number;
  totalUsers: number;
  totalComplaints: number;
  activeCompanies: number;
}

// Tipo para resposta de API padrão
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

