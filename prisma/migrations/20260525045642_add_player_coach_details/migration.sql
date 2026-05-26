-- AlterTable
ALTER TABLE "Coach" ADD COLUMN "address" TEXT;
ALTER TABLE "Coach" ADD COLUMN "birthDate" DATETIME;
ALTER TABLE "Coach" ADD COLUMN "cin" TEXT;
ALTER TABLE "Coach" ADD COLUMN "experience" TEXT;
ALTER TABLE "Coach" ADD COLUMN "medicalDate" DATETIME;
ALTER TABLE "Coach" ADD COLUMN "nationality" TEXT DEFAULT 'Marocaine';
ALTER TABLE "Coach" ADD COLUMN "notes" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "address" TEXT;
ALTER TABLE "Player" ADD COLUMN "cin" TEXT;
ALTER TABLE "Player" ADD COLUMN "medicalDate" DATETIME;
ALTER TABLE "Player" ADD COLUMN "nationality" TEXT DEFAULT 'Marocaine';
ALTER TABLE "Player" ADD COLUMN "notes" TEXT;
ALTER TABLE "Player" ADD COLUMN "parentCin" TEXT;
ALTER TABLE "Player" ADD COLUMN "parentName" TEXT;
ALTER TABLE "Player" ADD COLUMN "parentPhone" TEXT;
