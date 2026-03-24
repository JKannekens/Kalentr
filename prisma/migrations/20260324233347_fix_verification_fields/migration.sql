/*
  Warnings:

  - You are about to drop the column `isVerified` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenExpiry` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenHash` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "isVerified",
DROP COLUMN "verificationTokenExpiry",
DROP COLUMN "verificationTokenHash";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationTokenHash" TEXT;
