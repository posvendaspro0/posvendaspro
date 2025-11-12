import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getOperatorsByCompany, createOperator } from '@/services/operator-service';
import { operatorSchema } from '@/lib/validations';

/**
 * GET /api/operators
 * Lista todos os operadores da empresa do usuário logado
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

    const operators = await getOperatorsByCompany(session.user.companyId);

    // Remove o passwordHash dos operadores antes de enviar
    const operatorsWithoutPassword = operators.map(({ passwordHash, ...operator }) => operator);

    return NextResponse.json({ success: true, data: operatorsWithoutPassword });
  } catch (error) {
    console.error('Erro ao buscar operadores:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar operadores' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/operators
 * Cria um novo operador
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
    const validation = operatorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const operator = await createOperator({
      companyId: session.user.companyId,
      name: data.name,
      email: data.email,
      password: data.password,
    });

    // Remove o passwordHash antes de enviar
    const { passwordHash, ...operatorWithoutPassword } = operator;

    return NextResponse.json(
      { success: true, data: operatorWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar operador:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar operador' },
      { status: 500 }
    );
  }
}

