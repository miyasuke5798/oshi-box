"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { XButton } from "@/components/ui/x_button";

function SessionNewContent() {
  const searchParams = useSearchParams();
  const req = searchParams.get("req");
  const router = useRouter();

  if (req === "auth") {
    toast.error("ログインが必要です", {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    });
    router.replace("/session/new");
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
          <div className="flex flex-col gap-6 max-w-64 sm:max-w-72 mx-auto mb-6">
            <XButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SessionNew() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionNewContent />
    </Suspense>
  );
}
