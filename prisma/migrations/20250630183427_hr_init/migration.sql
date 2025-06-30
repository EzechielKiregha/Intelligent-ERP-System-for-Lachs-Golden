/*
  Warnings:

  - The values [POOR,AVERAGE,GOOD,EXCELLENT] on the enum `PerformanceRating` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `netAmount` on table `Payroll` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PerformanceRating_new" AS ENUM ('EXCEEDS', 'MEETS', 'NEEDS_IMPROVEMENT');
ALTER TABLE "PerformanceReview" ALTER COLUMN "rating" TYPE "PerformanceRating_new" USING ("rating"::text::"PerformanceRating_new");
ALTER TYPE "PerformanceRating" RENAME TO "PerformanceRating_old";
ALTER TYPE "PerformanceRating_new" RENAME TO "PerformanceRating";
DROP TYPE "PerformanceRating_old";
COMMIT;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Payroll" ALTER COLUMN "grossAmount" DROP NOT NULL,
ALTER COLUMN "netAmount" SET NOT NULL;
