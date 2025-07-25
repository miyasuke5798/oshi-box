"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export function XBackButton({ to }: { to?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="gray"
      className="flex items-center rounded-full h-10 w-10 !p-0"
      onClick={handleBack}
    >
      <X className="h-6 w-6" />
    </Button>
  );
}
