/*
  Warnings:

  - Made the column `description` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "description" SET NOT NULL;
