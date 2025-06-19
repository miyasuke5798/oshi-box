"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="gray"
      onClick={() => router.back()}
      className="flex items-center gap-2"
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="text-sm font-normal">戻る</span>
    </Button>
  );
}

// 代替案: 特定のページに戻る場合
export function BackButtonWithLink() {
  return (
    <Link href="/users/posts">
      <Button variant="gray" className="flex items-center gap-2">
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm font-normal">投稿一覧に戻る</span>
      </Button>
    </Link>
  );
}
