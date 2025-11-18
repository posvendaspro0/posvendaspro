import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { hashPassword } from '@/lib/auth-utils';
import { registerCompanySchema } from '@/lib/validations';

/**
 * POST /api/register
 * Cadastro self-service de nova empresa
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar dados
    const validation = registerCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se já existe empresa com mesmo email
    const existingCompany = await prisma.company.findUnique({
      where: { email: data.email },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Já existe uma empresa cadastrada com este e-mail' },
        { status: 400 }
      );
    }

    // Verificar se já existe usuário com mesmo email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário cadastrado com este e-mail' },
        { status: 400 }
      );
    }

    // Criar empresa e usuário em uma transação
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Criar empresa
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          email: data.email,
          responsibleFirstName: data.firstName,
          responsibleLastName: data.lastName,
          whatsapp: data.whatsapp,
          cep: data.cep,
          street: data.street,
          number: data.number,
          complement: data.complement || null,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        },
      });

      // Hash da senha
      const passwordHash = await hashPassword(data.password);

      // Criar usuário CLIENT vinculado à empresa
      const user = await tx.user.create({
        data: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          passwordHash,
          role: 'CLIENT',
          companyId: company.id,
        },
      });

      return { company, user };
    });

    console.log('✅ Nova empresa cadastrada:', result.company.name);
    console.log('✅ Usuário criado:', result.user.email);

    // TODO: Enviar email de boas-vindas
    // await sendWelcomeEmail(result.user.email, result.user.name);

    return NextResponse.json(
      {
        success: true,
        message: 'Empresa cadastrada com sucesso!',
        data: {
          companyId: result.company.id,
          userId: result.user.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao cadastrar empresa' },
      { status: 500 }
    );
  }
}

