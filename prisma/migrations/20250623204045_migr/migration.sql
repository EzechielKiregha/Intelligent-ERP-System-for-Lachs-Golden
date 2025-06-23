-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_companyId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "action" DROP NOT NULL,
ALTER COLUMN "entity" DROP NOT NULL,
ALTER COLUMN "entityId" DROP NOT NULL,
ALTER COLUMN "companyId" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
