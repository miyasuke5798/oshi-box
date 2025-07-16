import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { XButton } from "@/components/ui/x_button";
import { GoogleButton } from "@/components/ui/google-button";

// 動的レンダリングを強制
export const dynamic = "force-dynamic";

export default async function UsersNew() {
  // サーバーサイドでセッションチェック
  const session = await getSession();

  // ログイン中のユーザーがアクセスした場合はrootページにリダイレクト
  if (session) {
    redirect("/?req=already_logged_in");
  }

  return (
    <div className="mt-3 mb-16">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-[#52525b]">持っている外部アカウントで登録</h1>
        </CardHeader>
        <CardContent className="py-5">
          <div className="text-sm mb-6">
            <p></p>
          </div>
          <div className="flex flex-col gap-4 max-w-64 sm:max-w-72 mx-auto mb-6">
            <XButton />
            <GoogleButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
