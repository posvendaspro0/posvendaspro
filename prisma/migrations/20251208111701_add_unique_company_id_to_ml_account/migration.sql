-- AlterTable
-- Add unique constraint to companyId in ml_accounts table
-- Remove existing index if present
DROP INDEX IF EXISTS "ml_accounts_companyId_idx";

-- Add unique constraint
ALTER TABLE "ml_accounts" ADD CONSTRAINT "ml_accounts_companyId_key" UNIQUE ("companyId");

