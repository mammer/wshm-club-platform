import { prisma } from "./prisma";
import { auth } from "./auth";

export async function log(
  action: "CREATE" | "UPDATE" | "DELETE",
  entity: string,
  entityId?: string,
  details?: string,
  userName?: string
) {
  try {
    let resolvedName = userName;
    if (!resolvedName) {
      const session = await auth();
      resolvedName = session?.user?.name ?? "Système";
    }
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId ?? null,
        details: details ?? null,
        userName: resolvedName,
      },
    });
  } catch {
    // Non-blocking
  }
}
