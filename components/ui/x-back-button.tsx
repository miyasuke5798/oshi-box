"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

// 代替案: 特定のページに戻る場合
export function XBackButtonWithLink() {
  return (
    <Link href="/posts">
      <Button variant="gray" className="flex items-center rounded-full h-10 w-10 !p-0">
        <X className="h-6 w-6" />
      </Button>
    </Link>
  );
}
