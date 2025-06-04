import Link from "next/link";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsProfilePage() {
  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-base font-bold mb-4">プロフィール</h1>
          <p className="text-sm text-[#71717a] mb-6">
            <Link href="/xxx" className="rose_link">
              マイページ
            </Link>
            などで公開される情報です。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
