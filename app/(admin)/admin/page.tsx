"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { XButton } from "@/components/ui/x_button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function Admin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const req = searchParams.get("req");

  useEffect(() => {
    if (req === "auth") {
      setTimeout(() => {
        toast.error("管理者権限が必要です", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        router.replace("/admin");
      }, 500);
    }
  }, [req, router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-md p-6 space-y-8">
        <h1 className="text-2xl font-bold">管理者ログイン</h1>
        <div className="flex justify-center">
          <XButton redirectPath="/admin/dashboard/users" />
        </div>
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ホームに戻る
          </Link>
        </div>
      </Card>
    </div>
  );
}
