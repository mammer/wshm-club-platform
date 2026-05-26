-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN "attendeeCount" INTEGER;
ALTER TABLE "Meeting" ADD COLUMN "decisions" TEXT;
ALTER TABLE "Meeting" ADD COLUMN "documentUrl" TEXT;

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "expenseDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "vendor" TEXT,
    "paidBy" TEXT,
    "receiptUrl" TEXT,
    "season" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ClubSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubSettings_key_key" ON "ClubSettings"("key");
