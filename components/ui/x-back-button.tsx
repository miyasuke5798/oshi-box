"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

export function XBackButtonWithLink({ userId }: { userId: string }) {
  return (
    <Link href={`/${userId}`}>
      <Button
        variant="gray"
        className="flex items-center rounded-full h-10 w-10 !p-0"
      >
        <X className="h-6 w-6" />
      </Button>
    </Link>
  );
}
