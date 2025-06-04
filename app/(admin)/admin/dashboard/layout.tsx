import { AdminSideMenu } from "@/components/admin/side_menu";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <AdminSideMenu />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
