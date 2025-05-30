import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SessionNew() {
  return (
    <div className="mt-3 mb-16">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-[#52525b]">ログイン</h1>
        </CardHeader>
        <CardContent className="py-5">
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
