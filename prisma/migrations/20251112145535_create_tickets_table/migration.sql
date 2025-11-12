/*
  Warnings:

  - You are about to drop the `complaints` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProblemType" AS ENUM ('PRODUCT_NOT_RECEIVED', 'PRODUCT_DEFECTIVE', 'WRONG_PRODUCT', 'LATE_DELIVERY', 'DAMAGED_PACKAGE', 'RETURN_REQUEST', 'OTHER');

-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_companyId_fkey";

-- DropTable
DROP TABLE "complaints";

-- DropEnum
DROP TYPE "ComplaintStatus";

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "responsible" TEXT,
    "mlOrderId" TEXT,
    "productSku" TEXT,
    "problemType" "ProblemType" NOT NULL,
    "observation" TEXT NOT NULL,
    "resolutionDate" TIMESTAMP(3),
    "resolutionCost" DECIMAL(10,2),
    "affectedReputation" BOOLEAN NOT NULL DEFAULT false,
    "resolutionTime" INTEGER,
    "mlComplaintId" TEXT,
    "mlStatus" TEXT,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_mlComplaintId_key" ON "tickets"("mlComplaintId");

-- CreateIndex
CREATE INDEX "tickets_companyId_idx" ON "tickets"("companyId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_mlOrderId_idx" ON "tickets"("mlOrderId");

-- CreateIndex
CREATE INDEX "tickets_createdAt_idx" ON "tickets"("createdAt");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
