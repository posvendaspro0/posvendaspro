import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCompanySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da empresa é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cnpj: z.string().optional(),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .toLowerCase(),
  responsibleFirstName: z.string().optional(),
  responsibleLastName: z.string().optional(),
  whatsapp: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

/**
 * PUT /api/profile/company
 * Atualiza informações da empresa
 */
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: 'Usuário não está vinculado a uma empresa' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = updateCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar se o email já existe para outra empresa
    const currentCompany = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { email: true },
    });

    if (currentCompany && data.email !== currentCompany.email) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          email: data.email,
          id: { not: session.user.companyId },
        },
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: 'Este e-mail já está em uso por outra empresa' },
          { status: 400 }
        );
      }
    }

    // Atualizar empresa
    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        name: data.name,
        cnpj: data.cnpj || null,
        email: data.email,
        responsibleFirstName: data.responsibleFirstName || null,
        responsibleLastName: data.responsibleLastName || null,
        whatsapp: data.whatsapp || null,
        cep: data.cep || null,
        street: data.street || null,
        number: data.number || null,
        complement: data.complement || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        state: data.state || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
      { status: 500 }
    );
  }
}

