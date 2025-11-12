import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTicketById, updateTicket, deleteTicket } from '@/services/ticket-service';
import { ticketSchema } from '@/lib/validations';
import { ProblemType, TicketStatus } from '@prisma/client';

/**
 * GET /api/tickets/:id
 * Busca um ticket específico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const ticket = await getTicketById(id, session.user.companyId);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ticket' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tickets/:id
 * Atualiza um ticket
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const validation = ticketSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const { id } = await params;
    const ticket = await updateTicket(id, session.user.companyId, {
      status: data.status as TicketStatus | undefined,
      responsible: data.responsible,
      complaintDate: data.complaintDate ? new Date(data.complaintDate) : undefined,
      mlOrderId: data.mlOrderId,
      productSku: data.productSku,
      problemType: data.problemType as ProblemType | undefined,
      observation: data.observation,
      resolutionDate: data.resolutionDate ? new Date(data.resolutionDate) : undefined,
      resolutionCost: data.resolutionCost ? parseFloat(data.resolutionCost) : undefined,
      affectedReputation: data.affectedReputation,
      resolutionTime: data.resolutionTime ? parseInt(data.resolutionTime, 10) : undefined,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar ticket' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tickets/:id
 * Deleta um ticket
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    console.log('Tentando deletar ticket:', id, 'da empresa:', session.user.companyId);

    await deleteTicket(id, session.user.companyId);

    console.log('Ticket deletado com sucesso:', id);

    return NextResponse.json({ success: true, message: 'Ticket deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao deletar ticket' },
      { status: 500 }
    );
  }
}

