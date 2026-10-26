import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { checkAdminStatus } from "@/utils/actions/admin";
import AccessDenied from "@/components/admin/AccessDenied";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Tronx",
  description:
    "Administrative portal for managing Tronx projects and plots.",
};

export default async function AdminLayout({ children }) {
  const { isAdmin } = await checkAdminStatus();

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
