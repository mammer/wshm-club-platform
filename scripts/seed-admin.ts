/**
 * Creates the first admin account in the database.
 *
 * Usage (local SQLite):
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-admin.ts
 *
 * Usage (production MySQL — run on PlanetHoster terminal after deploy):
 *   DATABASE_URL="mysql://user:pass@localhost/wshm_db" \
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-admin.ts
 *
 * Change the values below before running.
 */

import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL    = "admin@wshm.ma";
const ADMIN_NAME     = "Administrateur WSHM";
const ADMIN_PASSWORD = "ChangeMe123!";   // ← change this before running
const ADMIN_ROLE     = "ADMIN";

async function main() {
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
