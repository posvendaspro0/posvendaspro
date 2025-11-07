import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';
import { Role, User } from '@prisma/client';

/**
 * Serviço de Usuários
 * Lógica de negócio para CRUD de usuários
 */

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: Role;
  companyId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  companyId?: string;
}

/**
 * Buscar todos os usuários (apenas ADMIN)
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remover passwordHash da resposta
    return users.map((user) => {
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Erro ao buscar usuários');
  }
}

/**
 * Buscar usuários por empresa
 */
export async function getUsersByCompany(companyId: string) {
  try {
    const users = await prisma.user.findMany({
      where: { companyId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remover passwordHash da resposta
    return users.map((user) => {
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    console.error('Erro ao buscar usuários da empresa:', error);
    throw new Error('Erro ao buscar usuários da empresa');
  }
}

/**
 * Buscar usuário por ID
 */
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Remover passwordHash da resposta
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw new Error('Erro ao buscar usuário');
  }
}

/**
 * Buscar usuário por email
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw new Error('Erro ao buscar usuário por email');
  }
}

/**
 * Criar novo usuário
 */
export async function createUser(data: CreateUserData): Promise<Omit<User, 'passwordHash'>> {
  try {
    // Verificar se já existe usuário com mesmo email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Já existe um usuário cadastrado com este e-mail');
    }

    // Validar companyId para usuários CLIENT
    if (data.role === 'CLIENT' && !data.companyId) {
      throw new Error('Usuários CLIENT devem estar vinculados a uma empresa');
    }

    // Verificar se a empresa existe (se fornecida)
    if (data.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new Error('Empresa não encontrada');
      }
    }

    // Hash da senha
    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        companyId: data.companyId || null,
      },
    });

    // Remover passwordHash da resposta
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao criar usuário:', error);
    throw new Error('Erro ao criar usuário');
  }
}

/**
 * Atualizar usuário
 */
export async function updateUser(
  id: string,
  data: UpdateUserData
): Promise<Omit<User, 'passwordHash'>> {
  try {
    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar duplicação de email se estiver sendo atualizado
    if (data.email && data.email !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (duplicateEmail) {
        throw new Error('Já existe um usuário cadastrado com este e-mail');
      }
    }

    // Validar companyId para usuários CLIENT
    if (data.role === 'CLIENT' && data.companyId === undefined && !existingUser.companyId) {
      throw new Error('Usuários CLIENT devem estar vinculados a uma empresa');
    }

    // Preparar dados para atualização
    const updateData: {
      name?: string;
      email?: string;
      role?: Role;
      companyId?: string;
      passwordHash?: string;
    } = {
      name: data.name,
      email: data.email,
      role: data.role,
      companyId: data.companyId,
    };

    // Atualizar senha se fornecida
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Remover passwordHash da resposta
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao atualizar usuário:', error);
    throw new Error('Erro ao atualizar usuário');
  }
}

/**
 * Deletar usuário
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao deletar usuário:', error);
    throw new Error('Erro ao deletar usuário');
  }
}

