import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Atualizando tickets antigos...');

  // Atualizar tickets que não têm complaintDate
  const result = await prisma.$executeRaw`
    UPDATE tickets 
    SET "complaintDate" = "createdAt"
    WHERE "complaintDate" IS NULL
  `;

  console.log(`✅ ${result} ticket(s) atualizado(s)`);
  console.log('✅ Concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

