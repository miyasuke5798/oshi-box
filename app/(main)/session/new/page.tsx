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
