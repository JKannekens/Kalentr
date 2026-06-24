-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "location" TEXT,
ADD COLUMN     "use24Hour" BOOLEAN NOT NULL DEFAULT false;
