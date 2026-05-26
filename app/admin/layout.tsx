import SessionWrapper from "@/components/admin/SessionWrapper";
import AdminShellWrapper from "@/components/admin/AdminShellWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionWrapper>
      <AdminShellWrapper>{children}</AdminShellWrapper>
    </SessionWrapper>
  );
}
