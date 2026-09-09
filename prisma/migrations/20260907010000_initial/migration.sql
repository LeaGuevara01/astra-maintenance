-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TECHNICIAN', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "csrfToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "meter" INTEGER NOT NULL,
    "operatingStatus" TEXT NOT NULL DEFAULT 'A_CONFIRMAR',
    "planId" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "blocking" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT NOT NULL DEFAULT 'SYNTHETIC',
    "sourceReference" TEXT NOT NULL DEFAULT 'A_CONFIRMAR',
    "partId" TEXT,
    "quantity" DECIMAL(12,3),

    CONSTRAINT "PlanTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL DEFAULT 'A_CONFIRMAR',
    "unit" TEXT NOT NULL,
    "onHand" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "reserved" DECIMAL(12,3) NOT NULL DEFAULT 0,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "assetSnapshot" JSONB NOT NULL,
    "planSnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "targetMeter" INTEGER NOT NULL,
    "actualMeter" INTEGER NOT NULL,
    "nextServiceMeter" INTEGER NOT NULL,
    "result" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTask" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "mandatory" BOOLEAN NOT NULL,
    "blocking" BOOLEAN NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceReference" TEXT NOT NULL,
    "partId" TEXT,
    "quantity" DECIMAL(12,3),
    "deferredReason" TEXT,
    "deferredUntil" TIMESTAMP(3),
    "deferredBy" TEXT,

    CONSTRAINT "OrderTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeferredLink" (
    "id" TEXT NOT NULL,
    "sourceTaskId" TEXT NOT NULL,
    "targetTaskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeferredLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderMaterial" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "partSnapshot" JSONB NOT NULL,
    "quantityPlanned" DECIMAL(12,3) NOT NULL,
    "quantityReserved" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "quantityUsed" DECIMAL(12,3) NOT NULL DEFAULT 0,

    CONSTRAINT "OrderMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "critical" BOOLEAN NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "orderId" TEXT,
    "kind" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "reference" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idempotency" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Idempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_code_key" ON "Asset"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_revision_key" ON "Plan"("code", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTask_planId_code_key" ON "PlanTask"("planId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Part_code_key" ON "Part"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_number_key" ON "WorkOrder"("number");

-- CreateIndex
CREATE INDEX "WorkOrder_status_createdAt_idx" ON "WorkOrder"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_assetId_planId_targetMeter_key" ON "WorkOrder"("assetId", "planId", "targetMeter");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTask_orderId_code_key" ON "OrderTask"("orderId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "DeferredLink_sourceTaskId_key" ON "DeferredLink"("sourceTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderMaterial_orderId_partId_key" ON "OrderMaterial"("orderId", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_orderId_code_key" ON "Checkpoint"("orderId", "code");

-- CreateIndex
CREATE INDEX "StockMovement_partId_createdAt_idx" ON "StockMovement"("partId", "createdAt");

-- CreateIndex
CREATE INDEX "Audit_entityId_createdAt_idx" ON "Audit"("entityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Idempotency_scope_key_key" ON "Idempotency"("scope", "key");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTask" ADD CONSTRAINT "PlanTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTask" ADD CONSTRAINT "PlanTask_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTask" ADD CONSTRAINT "OrderTask_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeferredLink" ADD CONSTRAINT "DeferredLink_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "OrderTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeferredLink" ADD CONSTRAINT "DeferredLink_targetTaskId_fkey" FOREIGN KEY ("targetTaskId") REFERENCES "OrderTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMaterial" ADD CONSTRAINT "OrderMaterial_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMaterial" ADD CONSTRAINT "OrderMaterial_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
