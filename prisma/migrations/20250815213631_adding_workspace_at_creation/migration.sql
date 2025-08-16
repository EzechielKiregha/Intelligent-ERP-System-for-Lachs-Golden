-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "coreDivisionType" "Role"[] DEFAULT ARRAY['SUPER_ADMIN']::"Role"[],
ADD COLUMN     "description" TEXT;
