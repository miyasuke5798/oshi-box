"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function Home() {
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

  return (
    <div className="mt-6 mb-16">
      <Card className="w-full">
        <CardContent className="flex flex-col gap-6 py-16">
          <h1 className="text-2xl sm:text-3xl font-medium mb-4">
            「忘れたくない、あの瞬間がある。」
          </h1>
          <div className="text-lg leading-relaxed mb-8">
            <p className="text-[#71717a]">
              日常の中に、ふと訪れる尊い一瞬。
              <br />
              推しがくれた笑顔、言葉、感動のライブ──
              <br />
              どれもが、かけがえのない宝物。
              <br />
              <br />
              「すぐに書き残せて、いつでも見返せる。」
              <br />
              推しBOXは、そんな“ときめき”をそっと残す、あなただけの日記帳です。
              <br />
            </p>
          </div>
          <Link href="/users/new" className="w-full">
            <Button size="lg" className="w-full">
              新規登録
            </Button>
          </Link>
          <Link href="/session/new" className="w-full">
            <Button size="lg" className="w-full">
              ログイン
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
