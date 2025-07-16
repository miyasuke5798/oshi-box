"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export function HomeClient() {
  const searchParams = useSearchParams();
  const req = searchParams.get("req");
  const router = useRouter();

  useEffect(() => {
    if (req === "already_logged_in") {
      toast.info("既にログインしています", {
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      });
      router.replace("/");
    }
  }, [req, router]);

  return null; // このコンポーネントは何もレンダリングしない
}
