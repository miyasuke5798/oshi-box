"use client";

import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserIcon } from "@/components/svg/UserIcon";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export const Header = () => {
  const { user, userData, signOut } = useAuth();
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
    <header className="bg-white border-b border-gray-200 shadow z-50">
      <div className="container px-3 sm:px-0">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold">
              <Image
                src="/oshi_box_logo.png"
                alt="oshi-box logo"
                width={62}
                height={62}
                loading="eager"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
                  {userData?.photoURL ? (
                    <div className="relative w-8 h-8">
                      <Image
                        src={userData.photoURL}
                        alt="Profile"
                        fill
                        className="object-cover border-[0.5px] border-gray-300 rounded-full"
                      />
                    </div>
                  ) : (
                    <UserIcon className="w-8 h-8" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings/profile"
                        className="w-full cursor-pointer"
                      >
                        設定
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/about" className="w-full cursor-pointer">
                      推しBOXとは？
                    </Link>
                  </DropdownMenuItem>
                  {user ? (
                    <DropdownMenuItem asChild>
                      <div
                        onClick={handleSignOut}
                        className="w-full cursor-pointer"
                      >
                        ログアウト
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        asChild
                        className="focus:bg-transparent"
                      >
                        <Link href="/users/new" className="w-full">
                          <Button className="w-full" variant="default">
                            新規登録
                          </Button>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="focus:bg-transparent"
                      >
                        <Link href="/session/new" className="w-full">
                          <Button className="w-full" variant="default">
                            ログイン
                          </Button>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
