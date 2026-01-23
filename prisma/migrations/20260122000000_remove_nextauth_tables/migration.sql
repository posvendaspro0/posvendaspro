-- Remove tabelas do NextAuth não utilizadas (JWT)
DROP TABLE IF EXISTS "accounts";
DROP TABLE IF EXISTS "sessions";
DROP TABLE IF EXISTS "verification_tokens";
