-- Create table to store full ML claim payloads
CREATE TABLE IF NOT EXISTS "ml_claims" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "mlClaimId" TEXT NOT NULL,
  "status" TEXT,
  "stage" TEXT,
  "type" TEXT,
  "resource" TEXT,
  "resourceId" TEXT,
  "orderId" TEXT,
  "reasonId" TEXT,
  "siteId" TEXT,
  "dateCreated" TIMESTAMP(3),
  "lastUpdated" TIMESTAMP(3),
  "dateClosed" TIMESTAMP(3),
  "raw" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ml_claims_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ml_claims_companyId_mlClaimId_key" ON "ml_claims"("companyId", "mlClaimId");
CREATE INDEX IF NOT EXISTS "ml_claims_companyId_dateCreated_idx" ON "ml_claims"("companyId", "dateCreated");
CREATE INDEX IF NOT EXISTS "ml_claims_companyId_status_idx" ON "ml_claims"("companyId", "status");
CREATE INDEX IF NOT EXISTS "ml_claims_companyId_stage_idx" ON "ml_claims"("companyId", "stage");

ALTER TABLE "ml_claims"
ADD CONSTRAINT "ml_claims_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
