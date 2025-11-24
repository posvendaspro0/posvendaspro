import { prisma } from '@/lib/prisma';
import { Ticket, TicketStatus, ProblemType, Prisma } from '@prisma/client';

/**
 * Serviço de Tickets
 * Lógica de negócio para gestão de tickets
 */

/**
 * Tipo serializado de Ticket (converte Decimal para number)
 */
export type SerializedTicket = Omit<Ticket, 'resolutionCost'> & {
  resolutionCost: number | null;
};

/**
 * Serializa um ticket convertendo Decimal para number
 */
function serializeTicket(ticket: Ticket): SerializedTicket {
  return {
    ...ticket,
    resolutionCost: ticket.resolutionCost ? Number(ticket.resolutionCost) : null,
  };
}

/**
 * Serializa uma lista de tickets
 */
function serializeTickets(tickets: Ticket[]): SerializedTicket[] {
  return tickets.map(serializeTicket);
}

export interface CreateTicketData {
  companyId: string;
  status: TicketStatus;
  responsible?: string;
  complaintDate: Date; // Data da reclamação
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
  complaintDate?: Date;
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
 * Gera o próximo ID sequencial para um ticket
 * Formato: TICKET-0001, TICKET-0002, etc.
 */
async function generateNextTicketId(companyId: string): Promise<string> {
  try {
    // Buscar o último ticket da empresa ordenado por ID decrescente
    const lastTicket = await prisma.ticket.findFirst({
      where: { 
        companyId,
        id: {
          startsWith: 'TICKET-'
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    if (!lastTicket) {
      // Primeiro ticket da empresa
      return 'TICKET-0001';
    }

    // Extrair o número do último ID (ex: TICKET-0042 -> 42)
    const lastNumber = parseInt(lastTicket.id.replace('TICKET-', ''), 10);
    
    if (isNaN(lastNumber)) {
      // Se não conseguir extrair número, começar do 1
      return 'TICKET-0001';
    }

    // Incrementar e formatar com zeros à esquerda (4 dígitos)
    const nextNumber = lastNumber + 1;
    return `TICKET-${String(nextNumber).padStart(4, '0')}`;
  } catch (error) {
    console.error('Erro ao gerar ID do ticket:', error);
    // Em caso de erro, gerar um ID único com timestamp
    return `TICKET-${Date.now()}`;
  }
}

/**
 * Buscar todos os tickets de uma empresa
 */
export async function getTicketsByCompany(companyId: string): Promise<SerializedTicket[]> {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { companyId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return serializeTickets(tickets);
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    throw new Error('Erro ao buscar tickets');
  }
}

/**
 * Buscar ticket por ID
 */
export async function getTicketById(id: string, companyId: string): Promise<SerializedTicket | null> {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        companyId, // Garantir que o ticket pertence à empresa
      },
    });

    return ticket ? serializeTicket(ticket) : null;
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    throw new Error('Erro ao buscar ticket');
  }
}

/**
 * Criar novo ticket com ID gerado automaticamente
 */
export async function createTicket(data: CreateTicketData): Promise<SerializedTicket> {
  try {
    // Gerar ID sequencial automaticamente
    const ticketId = await generateNextTicketId(data.companyId);

    const ticket = await prisma.ticket.create({
      data: {
        id: ticketId, // ID gerado automaticamente
        companyId: data.companyId,
        status: data.status,
        responsible: data.responsible || null,
        complaintDate: data.complaintDate,
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

    return serializeTicket(ticket);
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
): Promise<SerializedTicket> {
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

    // Calcular tempo de resolução automaticamente se status mudar para RESOLVED ou CLOSED
    let autoResolutionTime = data.resolutionTime;
    let autoResolutionDate = data.resolutionDate;

    if (data.status && (data.status === 'RESOLVED' || data.status === 'CLOSED')) {
      // Se não forneceu data de resolução, usar agora
      if (!autoResolutionDate) {
        autoResolutionDate = new Date();
      }

      // Calcular tempo em horas entre complaintDate e resolutionDate
      const complaintDate = data.complaintDate || existingTicket.complaintDate;
      const resolutionDate = autoResolutionDate;
      
      const diffInMs = resolutionDate.getTime() - complaintDate.getTime();
      const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
      
      // Se não forneceu tempo manualmente, calcular automaticamente
      if (!autoResolutionTime) {
        autoResolutionTime = diffInHours >= 0 ? diffInHours : 0;
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...data,
        resolutionDate: autoResolutionDate,
        resolutionTime: autoResolutionTime,
        resolutionCost: data.resolutionCost ? new Prisma.Decimal(data.resolutionCost) : undefined,
      },
    });

    return serializeTicket(ticket);
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

