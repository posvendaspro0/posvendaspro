import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createTicket, getTicketsByCompany } from '@/services/ticket-service';
import { ticketSchema } from '@/lib/validations';
import { ProblemType, TicketStatus } from '@prisma/client';

/**
 * GET /api/tickets
 * Lista todos os tickets da empresa do usuário logado
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 400 }
      );
    }

    const tickets = await getTicketsByCompany(session.user.companyId);

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * Cria um novo ticket
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = ticketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Preparar dados para criação
    const ticket = await createTicket({
      id: data.id, // ID customizado pelo usuário
      companyId: session.user.companyId,
      status: data.status as TicketStatus,
      responsible: data.responsible,
      complaintDate: new Date(data.complaintDate),
      mlOrderId: data.mlOrderId,
      productSku: data.productSku,
      problemType: data.problemType as ProblemType,
      observation: data.observation,
      resolutionDate: data.resolutionDate ? new Date(data.resolutionDate) : undefined,
      resolutionCost: data.resolutionCost ? parseFloat(data.resolutionCost) : undefined,
      affectedReputation: data.affectedReputation,
      resolutionTime: data.resolutionTime ? parseInt(data.resolutionTime, 10) : undefined,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
    });

    return NextResponse.json(
      { success: true, data: ticket },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar ticket' },
      { status: 500 }
    );
  }
}

