/*
  Warnings:

  - You are about to drop the column `description` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "description",
DROP COLUMN "duration",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationTokenHash" TEXT;
