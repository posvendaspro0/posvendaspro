gh auth login-- CreateTable
CREATE TABLE "ml_claim_data" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mlClaimId" TEXT NOT NULL,
    "mlOrderId" TEXT,
    "responsible" TEXT,
    "productSku" TEXT,
    "resolutionCost" DECIMAL(10,2) DEFAULT 0,
    "observation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ml_claim_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ml_claim_data_mlClaimId_idx" ON "ml_claim_data"("mlClaimId");

-- CreateIndex
CREATE INDEX "ml_claim_data_mlOrderId_idx" ON "ml_claim_data"("mlOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ml_claim_data_companyId_mlClaimId_key" ON "ml_claim_data"("companyId", "mlClaimId");

-- AddForeignKey
ALTER TABLE "ml_claim_data" ADD CONSTRAINT "ml_claim_data_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;



