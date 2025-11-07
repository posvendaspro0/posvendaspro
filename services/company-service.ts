import { prisma } from '@/lib/prisma';
import { Company } from '@prisma/client';

/**
 * Serviço de Empresas
 * Lógica de negócio para CRUD de empresas
 */

export interface CreateCompanyData {
  name: string;
  email: string;
  cnpj?: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  cnpj?: string;
}

/**
 * Buscar todas as empresas
 */
export async function getAllCompanies() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            complaints: true,
            mlAccounts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return companies;
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    throw new Error('Erro ao buscar empresas');
  }
}

/**
 * Buscar empresa por ID
 */
export async function getCompanyById(id: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            complaints: true,
            mlAccounts: true,
          },
        },
      },
    });

    return company;
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    throw new Error('Erro ao buscar empresa');
  }
}

/**
 * Criar nova empresa
 */
export async function createCompany(data: CreateCompanyData): Promise<Company> {
  try {
    // Verificar se já existe empresa com mesmo email
    const existingCompany = await prisma.company.findUnique({
      where: { email: data.email },
    });

    if (existingCompany) {
      throw new Error('Já existe uma empresa cadastrada com este e-mail');
    }

    // Verificar CNPJ se fornecido
    if (data.cnpj) {
      const existingCnpj = await prisma.company.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (existingCnpj) {
        throw new Error('Já existe uma empresa cadastrada com este CNPJ');
      }
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        email: data.email,
        cnpj: data.cnpj,
      },
    });

    return company;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao criar empresa:', error);
    throw new Error('Erro ao criar empresa');
  }
}

/**
 * Atualizar empresa
 */
export async function updateCompany(
  id: string,
  data: UpdateCompanyData
): Promise<Company> {
  try {
    // Verificar se empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new Error('Empresa não encontrada');
    }

    // Verificar duplicação de email se estiver sendo atualizado
    if (data.email && data.email !== existingCompany.email) {
      const duplicateEmail = await prisma.company.findUnique({
        where: { email: data.email },
      });

      if (duplicateEmail) {
        throw new Error('Já existe uma empresa cadastrada com este e-mail');
      }
    }

    // Verificar duplicação de CNPJ se estiver sendo atualizado
    if (data.cnpj && data.cnpj !== existingCompany.cnpj) {
      const duplicateCnpj = await prisma.company.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (duplicateCnpj) {
        throw new Error('Já existe uma empresa cadastrada com este CNPJ');
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data,
    });

    return company;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao atualizar empresa:', error);
    throw new Error('Erro ao atualizar empresa');
  }
}

/**
 * Deletar empresa
 * ATENÇÃO: Deleta em cascata usuários, reclamações e contas ML
 */
export async function deleteCompany(id: string): Promise<void> {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    await prisma.company.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao deletar empresa:', error);
    throw new Error('Erro ao deletar empresa');
  }
}

/**
 * Obter estatísticas de uma empresa
 */
export async function getCompanyStats(companyId: string) {
  try {
    const [totalUsers, totalComplaints, mlAccounts] = await Promise.all([
      prisma.user.count({ where: { companyId } }),
      prisma.complaint.count({ where: { companyId } }),
      prisma.mlAccount.count({ where: { companyId } }),
    ]);

    const complaintsByStatus = await prisma.complaint.groupBy({
      by: ['status'],
      where: { companyId },
      _count: true,
    });

    return {
      totalUsers,
      totalComplaints,
      mlAccounts,
      complaintsByStatus,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas da empresa:', error);
    throw new Error('Erro ao buscar estatísticas da empresa');
  }
}

