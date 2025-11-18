import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getOperatorById, updateOperator, deleteOperator } from '@/services/operator-service';
import { updateOperatorSchema } from '@/lib/validations';

/**
 * GET /api/operators/:id
 * Busca um operador específico
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
    const operator = await getOperatorById(id, session.user.companyId);

    if (!operator) {
      return NextResponse.json(
        { error: 'Operador não encontrado' },
        { status: 404 }
      );
    }

    // Remove o passwordHash antes de enviar
    const { passwordHash, ...operatorWithoutPassword } = operator;

    return NextResponse.json({ success: true, data: operatorWithoutPassword });
  } catch (error) {
    console.error('Erro ao buscar operador:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar operador' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/operators/:id
 * Atualiza um operador
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
    const validation = updateOperatorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const { id } = await params;

    const operator = await updateOperator(id, session.user.companyId, {
      name: data.name,
      email: data.email,
      password: data.password || undefined,
      isActive: data.isActive,
    });

    // Remove o passwordHash antes de enviar
    const { passwordHash, ...operatorWithoutPassword } = operator;

    return NextResponse.json({ success: true, data: operatorWithoutPassword });
  } catch (error) {
    console.error('Erro ao atualizar operador:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar operador' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/operators/:id
 * Deleta um operador
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

    await deleteOperator(id, session.user.companyId);

    return NextResponse.json({ success: true, message: 'Operador deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar operador:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao deletar operador' },
      { status: 500 }
    );
  }
}

