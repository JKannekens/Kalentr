-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- Flag the already-seeded demo tenant (no-op if it doesn't exist)
UPDATE "tenants" SET "isDemo" = true WHERE "subdomain" = 'alexmorgan';
