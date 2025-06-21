import { AdminSideMenu } from "@/components/admin/side_menu";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <AdminSideMenu />
      <main className="flex-1 p-3 pt-12 md:p-6">{children}</main>
    </div>
  );
}
