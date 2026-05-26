"use client";
import { usePathname } from "next/navigation";
import AdminShell from "./AdminShell";

export default function AdminShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noShell = pathname === "/admin/login" || pathname === "/admin/login/";
  if (noShell) return <>{children}</>;
  return <AdminShell>{children}</AdminShell>;
}
