-- Atualizar tickets existentes sem complaintDate
UPDATE tickets 
SET "complaintDate" = "createdAt"
WHERE "complaintDate" IS NULL;
