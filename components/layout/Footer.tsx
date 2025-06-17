"use client";
import Link from "next/link";
//import { XIcon } from "@/components/svg/x_icon";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export const Footer = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // セッションクッキーを削除
      const response = await fetch("/api/auth/session", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("セッションの削除に失敗しました");
      }

      // Firebase認証からログアウト
      await signOut();

      setTimeout(() => {
        toast.success("ログアウトしました", { icon: <SuccessCircle /> });
      }, 500);

      router.push("/");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      toast.error("ログアウトに失敗しました", {
        icon: <AlertCircle />,
      });
    }
  };

  return (
    <footer className="border-t border-gray-200 pb-4 mb-[100px]">
      <div className="container px-3 sm:px-0 pt-8">
        <div className="grid sm:grid-cols-2 gap-y-6">
          <div>
            <h3 className="text-[#3f3f46] font-semibold">サンプルリンク</h3>
            <ul className="text-sm my-3 space-y-4">
              <li>
                <Link href="/admin" className="text-[#71717a]">
                  admin
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#3f3f46] font-semibold">サンプルリンク</h3>
            <ul className="text-sm my-3 space-y-4">
              <li>
                <Link href="/#" className="text-[#71717a]">
                  サンプルリンク
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#3f3f46] font-semibold">あなたのページ</h3>
            <ul className="text-sm my-3 space-y-4">
              <li>
                <Link
                  href={user ? `/${user.uid}` : "/session/new?req=auth"}
                  className="text-[#71717a]"
                >
                  マイページ
                </Link>
              </li>
              <li>
                <Link href="/settings/profile" className="text-[#71717a]">
                  設定
                </Link>
              </li>
              {user ? (
                <li>
                  <button
                    onClick={handleSignOut}
                    className="text-[#71717a] cursor-pointer"
                  >
                    ログアウト
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/users/new" className="text-[#71717a]">
                      新規登録
                    </Link>
                  </li>
                  <li>
                    <Link href="/session/new" className="text-[#71717a]">
                      ログイン
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200">
          {/*<div className="mt-4 mb-6">
            <h3 className="text-[#3f3f46] text-sm font-semibold mb-2">
              公式アカウント
            </h3>
            <div>
              <Link href="https://x.com/oshiboxbox" target="_blank">
                <XIcon width={23} height={23} className="text-[#9a9a9a]" />
              </Link>
            </div>
          </div>*/}
          <div className="mt-4 mb-6">
            <h3 className="text-[#3f3f46] text-sm font-semibold mb-2">
              サポート
            </h3>
            <div>
              <Link href="/about" className="text-[#71717a] text-sm">
                推しBOXとは？
              </Link>
            </div>
          </div>
          <div className="mt-4 mb-6">
            <h3 className="text-[#3f3f46] text-sm font-semibold mb-2">
              規約・ポリシー
            </h3>
            <div className="flex gap-4">
              <Link href="/terms/privacy" className="text-[#71717a] text-sm">
                プライバシーポリシー
              </Link>
              <Link href="/terms/service" className="text-[#71717a] text-sm">
                利用規約
              </Link>
            </div>
          </div>
          <div className="mt-4 mb-6">
            <h3 className="text-[#3f3f46] text-sm font-semibold mb-2">
              運営元情報
            </h3>
            <div className="flex flex-col gap-2">
              <p className="text-[#71717a] text-sm">
                推しBOX 運営者：
                <Link href="https://x.com/jun_mysk?s=21" target="_blank">
                  @jun_mysk
                </Link>
              </p>
              <p className="text-[#71717a] text-sm">
                お問い合わせ先：oshibox.official@gmail.com
              </p>
            </div>
          </div>
          <p className="text-base !text-[#d4d4d8]">©Oshi Box</p>
        </div>
      </div>
    </footer>
  );
};
