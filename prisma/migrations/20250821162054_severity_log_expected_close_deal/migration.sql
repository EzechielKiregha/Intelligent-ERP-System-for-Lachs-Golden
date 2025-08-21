-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('NONE', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "severity" "Severity" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "expectedCloseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "backgroundCheckCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
