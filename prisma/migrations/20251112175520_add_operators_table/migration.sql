-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operators_companyId_idx" ON "operators"("companyId");

-- CreateIndex
CREATE INDEX "operators_email_idx" ON "operators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "operators_companyId_email_key" ON "operators"("companyId", "email");

-- AddForeignKey
ALTER TABLE "operators" ADD CONSTRAINT "operators_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
