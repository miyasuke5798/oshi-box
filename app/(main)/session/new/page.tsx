"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { XButton } from "@/components/ui/x_button";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function SessionNew() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const req = searchParams.get("req");

  useEffect(() => {
    if (req === "auth") {
      setTimeout(() => {
        toast.error("ログインが必要です", {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          duration: 5000,
        });
        router.replace("/session/new");
      }, 100);
    }
  }, [req, router]);

  return (
    <div className="mt-3 mb-16">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-[#52525b]">ログイン</h1>
        </CardHeader>
        <CardContent className="py-5">
          <div className="flex flex-col gap-6 max-w-64 sm:max-w-72 mx-auto mt-2 mb-6">
            <XButton />
          </div>
          <ul className="text-sm">
            <li>
              <p className="text-[#71717a]">
                ユーザ登録をされていない方は
                <Link href="/users/new" className="rose_link">
                  こちら
                </Link>
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
