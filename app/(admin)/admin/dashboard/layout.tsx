import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { AdminSideMenu } from "@/components/admin/side_menu";

// 動的レンダリングを強制
export const dynamic = "force-dynamic";

async function checkAdminAuth() {
  try {
    if (!adminAuth || !adminDb) {
      return false;
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return false;
    }

    // セッションクッキーからユーザー情報を取得
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
    const uid = decodedClaims.uid;

    // Firestoreからユーザー情報を取得
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return false;
    }

    const userData = userDoc.data();
    return userData?.admin === true;
  } catch (error) {
    console.error("Admin auth check error:", error);
    return false;
  }
}

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 管理者認証チェック
  const isAdmin = await checkAdminAuth();

  if (!isAdmin) {
    redirect("/admin?req=auth");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSideMenu />
      <main className="flex-1 p-3 pt-12 md:p-6">{children}</main>
    </div>
  );
}
