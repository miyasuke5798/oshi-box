"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChevronLeftBackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="gray"
      onClick={() => router.back()}
      className="flex items-center rounded-full h-10 w-10 !p-0"
    >
      <ChevronLeft className="h-6 w-6" />
    </Button>
  );
}
