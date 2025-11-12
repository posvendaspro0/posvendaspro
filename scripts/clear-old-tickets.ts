import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Limpando tickets antigos...');

  // Deletar TODOS os tickets
  const result = await prisma.ticket.deleteMany({});

  console.log(`✅ ${result.count} ticket(s) deletado(s)`);
  console.log('✅ Banco limpo! Agora você pode criar novos tickets.');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

