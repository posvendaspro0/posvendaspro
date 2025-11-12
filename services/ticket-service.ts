import { prisma } from '@/lib/prisma';
import { Ticket, TicketStatus, ProblemType, Prisma } from '@prisma/client';

/**
 * Serviço de Tickets
 * Lógica de negócio para gestão de tickets
 */

export interface CreateTicketData {
  id: string; // ID customizado pelo usuário
  companyId: string;
  status: TicketStatus;
  responsible?: string;
  mlOrderId?: string;
  productSku?: string;
  problemType: ProblemType;
  observation: string;
  resolutionDate?: Date;
  resolutionCost?: number;
  affectedReputation?: boolean;
  resolutionTime?: number;
  clientName?: string;
  clientEmail?: string;
}

export interface UpdateTicketData {
  status?: TicketStatus;
  responsible?: string;
  mlOrderId?: string;
  productSku?: string;
  problemType?: ProblemType;
  observation?: string;
  resolutionDate?: Date;
  resolutionCost?: number;
  affectedReputation?: boolean;
  resolutionTime?: number;
  clientName?: string;
  clientEmail?: string;
}

/**
 * Buscar todos os tickets de uma empresa
 */
export async function getTicketsByCompany(companyId: string) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { companyId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    throw new Error('Erro ao buscar tickets');
  }
}

/**
 * Buscar ticket por ID
 */
export async function getTicketById(id: string, companyId: string) {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        companyId, // Garantir que o ticket pertence à empresa
      },
    });

    return ticket;
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    throw new Error('Erro ao buscar ticket');
  }
}

/**
 * Criar novo ticket
 */
export async function createTicket(data: CreateTicketData): Promise<Ticket> {
  try {
    // Verificar se já existe ticket com mesmo ID na empresa
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: data.id,
        companyId: data.companyId,
      },
    });

    if (existingTicket) {
      throw new Error('Já existe um ticket com este ID');
    }

    const ticket = await prisma.ticket.create({
      data: {
        id: data.id, // ID customizado
        companyId: data.companyId,
        status: data.status,
        responsible: data.responsible || null,
        mlOrderId: data.mlOrderId || null,
        productSku: data.productSku || null,
        problemType: data.problemType,
        observation: data.observation,
        resolutionDate: data.resolutionDate || null,
        resolutionCost: data.resolutionCost ? new Prisma.Decimal(data.resolutionCost) : null,
        affectedReputation: data.affectedReputation || false,
        resolutionTime: data.resolutionTime || null,
        clientName: data.clientName || null,
        clientEmail: data.clientEmail || null,
      },
    });

    return ticket;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao criar ticket:', error);
    throw new Error('Erro ao criar ticket');
  }
}

/**
 * Atualizar ticket
 */
export async function updateTicket(
  id: string,
  companyId: string,
  data: UpdateTicketData
): Promise<Ticket> {
  try {
    // Verificar se ticket existe e pertence à empresa
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingTicket) {
      throw new Error('Ticket não encontrado');
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...data,
        resolutionCost: data.resolutionCost ? new Prisma.Decimal(data.resolutionCost) : undefined,
      },
    });

    return ticket;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao atualizar ticket:', error);
    throw new Error('Erro ao atualizar ticket');
  }
}

/**
 * Deletar ticket
 */
export async function deleteTicket(id: string, companyId: string): Promise<void> {
  try {
    // Verificar se ticket existe e pertence à empresa
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }

    await prisma.ticket.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Erro ao deletar ticket:', error);
    throw new Error('Erro ao deletar ticket');
  }
}

/**
 * Obter estatísticas de tickets de uma empresa
 */
export async function getTicketStats(companyId: string) {
  try {
    const [total, pending, inProgress, resolved] = await Promise.all([
      prisma.ticket.count({ where: { companyId } }),
      prisma.ticket.count({ where: { companyId, status: 'PENDING' } }),
      prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { companyId, status: 'RESOLVED' } }),
    ]);

    return {
      total,
      pending,
      inProgress,
      resolved,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw new Error('Erro ao buscar estatísticas');
  }
}

