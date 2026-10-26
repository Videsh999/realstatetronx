import AccessDenied from "@/components/admin/AccessDenied";

export const metadata = {
  title: "Access Denied",
};

export default function AccessDeniedPage() {
  return (
    <main className="min-h-screen bg-white pt-24">
      <AccessDenied />
    </main>
  );
}
