-- CreateTable
CREATE TABLE "time_off" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_off_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_off_tenantId_idx" ON "time_off"("tenantId");

-- CreateIndex
CREATE INDEX "time_off_tenantId_startDate_idx" ON "time_off"("tenantId", "startDate");

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
