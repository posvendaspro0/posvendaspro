import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário ADMIN principal
  const adminEmail = 'admin@posvendaspro.com';
  const adminPassword = 'Admin@123';

  // Verificar se o admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️  Usuário ADMIN já existe. Pulando criação.');
    return;
  }

  // Criar hash da senha
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Criar usuário ADMIN
  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      companyId: null, // Admin não pertence a nenhuma empresa
    },
  });

  console.log('✅ Usuário ADMIN criado com sucesso!');
  console.log('📧 Email:', adminEmail);
  console.log('🔑 Senha:', adminPassword);
  console.log('');
  console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  console.log('');

  // Criar uma empresa de exemplo para testes (opcional)
  const testCompany = await prisma.company.create({
    data: {
      name: 'Empresa Exemplo',
      email: 'empresa@exemplo.com',
      cnpj: '12345678000190',
    },
  });

  console.log('✅ Empresa de exemplo criada:', testCompany.name);

  // Criar um usuário CLIENT de exemplo
  const clientPasswordHash = await bcrypt.hash('Cliente@123', 10);
  
  await prisma.user.create({
    data: {
      name: 'Cliente Exemplo',
      email: 'cliente@exemplo.com',
      passwordHash: clientPasswordHash,
      role: 'CLIENT',
      companyId: testCompany.id,
    },
  });

  console.log('✅ Usuário CLIENT de exemplo criado!');
  console.log('📧 Email:', 'cliente@exemplo.com');
  console.log('🔑 Senha:', 'Cliente@123');
  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

