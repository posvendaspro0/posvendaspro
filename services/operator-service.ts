import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Operator } from '@prisma/client';

/**
 * Serviço de Operadores
 * Gerencia operadores que podem administrar tickets de uma empresa
 */

export interface CreateOperatorData {
  companyId: string;
  name: string;
  email: string;
  password: string;
}

export interface UpdateOperatorData {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

/**
 * Lista todos os operadores de uma empresa
 */
export async function getOperatorsByCompany(companyId: string): Promise<Operator[]> {
  try {
    const operators = await prisma.operator.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return operators;
  } catch (error) {
    console.error('Erro ao buscar operadores:', error);
    throw new Error('Erro ao buscar operadores');
  }
}

/**
 * Busca um operador específico
 */
export async function getOperatorById(
  id: string,
  companyId: string
): Promise<Operator | null> {
  try {
    const operator = await prisma.operator.findFirst({
      where: {
        id,
        companyId,
      },
    });
    return operator;
  } catch (error) {
    console.error('Erro ao buscar operador:', error);
    throw new Error('Erro ao buscar operador');
  }
}

/**
 * Cria um novo operador
 */
export async function createOperator(data: CreateOperatorData): Promise<Operator> {
  try {
    // Verificar se o e-mail já existe na empresa
    const existingOperator = await prisma.operator.findFirst({
      where: {
        companyId: data.companyId,
        email: data.email.toLowerCase(),
      },
    });

    if (existingOperator) {
      throw new Error('Já existe um operador com este e-mail nesta empresa');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    const operator = await prisma.operator.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        isActive: true,
      },
    });

    return operator;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao criar operador:', error);
    throw new Error('Erro ao criar operador');
  }
}

/**
 * Atualiza um operador
 */
export async function updateOperator(
  id: string,
  companyId: string,
  data: UpdateOperatorData
): Promise<Operator> {
  try {
    // Verificar se o operador existe e pertence à empresa
    const existingOperator = await prisma.operator.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingOperator) {
      throw new Error('Operador não encontrado');
    }

    // Se está atualizando o email, verificar se não existe outro com o mesmo
    if (data.email && data.email.toLowerCase() !== existingOperator.email) {
      const emailExists = await prisma.operator.findFirst({
        where: {
          companyId,
          email: data.email.toLowerCase(),
          id: { not: id },
        },
      });

      if (emailExists) {
        throw new Error('Já existe um operador com este e-mail nesta empresa');
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Se tem senha, fazer hash
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const operator = await prisma.operator.update({
      where: { id },
      data: updateData,
    });

    return operator;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao atualizar operador:', error);
    throw new Error('Erro ao atualizar operador');
  }
}

/**
 * Deleta um operador
 */
export async function deleteOperator(id: string, companyId: string): Promise<void> {
  try {
    // Verificar se o operador existe e pertence à empresa
    const existingOperator = await prisma.operator.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingOperator) {
      throw new Error('Operador não encontrado');
    }

    await prisma.operator.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao deletar operador:', error);
    throw new Error('Erro ao deletar operador');
  }
}

/**
 * Busca operador por email e companyId (para autenticação futura)
 */
export async function getOperatorByEmail(
  email: string,
  companyId: string
): Promise<Operator | null> {
  try {
    const operator = await prisma.operator.findFirst({
      where: {
        email: email.toLowerCase(),
        companyId,
        isActive: true,
      },
    });
    return operator;
  } catch (error) {
    console.error('Erro ao buscar operador por email:', error);
    return null;
  }
}

/**
 * Conta total de operadores de uma empresa
 */
export async function countOperatorsByCompany(companyId: string): Promise<number> {
  try {
    const count = await prisma.operator.count({
      where: { companyId },
    });
    return count;
  } catch (error) {
    console.error('Erro ao contar operadores:', error);
    return 0;
  }
}

