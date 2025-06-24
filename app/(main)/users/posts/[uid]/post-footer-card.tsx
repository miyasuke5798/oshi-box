"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function PostFooterCard() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/check-session");
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error("セッション確認エラー:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  // ログイン状態が確認されるまで何も表示しない
  if (isLoggedIn === null) {
    return null;
  }

  // ログインしている場合は何も表示しない
  if (isLoggedIn) {
    return null;
  }

  return (
    <Card className="w-full mb-5">
      <CardContent className="flex flex-col items-center gap-3 py-4 px-6">
        <h2 className="text-2xl text-center font-bold leading-relaxed my-4">
          この投稿は 推し活専用記録アプリ『推しBOX』で作成されました。
        </h2>
        <Link href="/" className="mb-4">
          <Button variant="default" size="lg">
            推しBOXを使って投稿する
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
