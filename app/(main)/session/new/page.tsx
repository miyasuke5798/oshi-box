import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { XButton } from "@/components/ui/x_button";

export default function SessionNew() {
  return (
    <div className="mt-3 mb-16">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-[#52525b]">ログイン</h1>
        </CardHeader>
        <CardContent className="py-5">
          <div className="leading-relaxed mb-6">
            <p>
              <span className="font-bold text-lg">「忘れたくない、あの瞬間がある。」</span>
              <br />
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
          <div className="flex flex-col gap-6 max-w-64 sm:max-w-72 mx-auto mb-6">
            <XButton />
          </div>
          <ul className="text-sm">
            <li>
              <p>
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
