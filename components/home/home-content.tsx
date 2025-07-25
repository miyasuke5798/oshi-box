import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HomeContent() {
  return (
    <Card className="w-full mb-8">
      <CardContent className="flex flex-col gap-6 py-16">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4">
          「散らばった&quot;推しの記録&quot;、ここにひとつに。」
        </h1>
        <div className="text-lg leading-relaxed mb-8">
          <p className="text-[#71717a]">
            埋もれてしまった推しの記録。
            <br />
            あとから見つけられないことはありませんか？
            <br />
            推しBOXは、散らばった&quot;推しの記録&quot;をひとつにまとめて、いつでも整理・保存・振り返れる、あなただけの推しアルバムです。
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
  );
}
