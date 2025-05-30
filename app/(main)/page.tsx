import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mt-6 mb-16">
      <Card className="w-full">
        <CardContent className="flex flex-col gap-6 py-16">
          <h1 className="text-2xl sm:text-4xl font-medium mb-8">ホームたいとる</h1>
          <div className="mb-8">
            <p>ホームテキスト</p>
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
