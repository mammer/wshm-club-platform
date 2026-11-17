-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "photoUrl" TEXT;

-- CreateTable
CREATE TABLE "Archive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "description" TEXT,
    "year" INTEGER,
    "uploadedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "birthDate" DATETIME,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photoUrl" TEXT,
    "cin" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TournamentRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "clubName" TEXT,
    "clubAddress" TEXT,
    "clubCity" TEXT,
    "presidentName" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "coachName" TEXT,
    "coachLicense" TEXT,
    "category" TEXT NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "ageGroupMin" INTEGER,
    "ageGroupMax" INTEGER,
    "hasMedicalCerts" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentRegistration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TournamentRegistration" ("category", "clubName", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "playerCount", "status", "tournamentId") SELECT "category", "clubName", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "playerCount", "status", "tournamentId" FROM "TournamentRegistration";
DROP TABLE "TournamentRegistration";
ALTER TABLE "new_TournamentRegistration" RENAME TO "TournamentRegistration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

