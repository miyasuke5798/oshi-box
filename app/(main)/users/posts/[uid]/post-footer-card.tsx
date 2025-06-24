"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PostFooterCardProps {
  isCurrentUser: boolean;
}

export function PostFooterCard({ isCurrentUser }: PostFooterCardProps) {
  if (isCurrentUser) {
    return null;
  }
  console.log(isCurrentUser);

  return (
    <>
      {isCurrentUser === false && (
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
      )}
    </>
  );
}
