/**
 * Creates the first admin account in the database.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.org ADMIN_PASSWORD='a long passphrase' npx tsx scripts/seed-admin.ts
 *
 * Against production MySQL, run it on the server with DATABASE_URL set.
 * Credentials come from the environment so no password is ever written into the repository.
 */

import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL ?? "";
const ADMIN_NAME     = "Administrateur WSHM";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const ADMIN_ROLE     = "ADMIN";

async function main() {
  if (!ADMIN_EMAIL || ADMIN_PASSWORD.length < 12) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in the environment.");
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`✓ Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const user = await prisma.adminUser.create({
    data: { email: ADMIN_EMAIL, name: ADMIN_NAME, password: hash, role: ADMIN_ROLE },
  });

  console.log(`✅ Admin created successfully!`);
  console.log(`   Email : ${user.email}`);
  console.log(`   Name  : ${user.name}`);
  console.log(`   Role  : ${user.role}`);
  console.log(`\n⚠️  Change the password immediately after first login.`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
