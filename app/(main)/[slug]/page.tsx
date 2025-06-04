import Link from "next/link";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserIcon } from "@/components/svg/UserIcon";
import { CircleUser } from "lucide-react";

export default function SlugPage() {
  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardHeader className="text-sm font-normal">
          このエリアはxxxさんだけに見えています
        </CardHeader>
        <Link href="/settings/profile" className="bg-white hover:bg-gray-50 rounded-[.5rem]">
          <CardContent className="flex flex-row items-center gap-3 py-4 px-6">
            <CircleUser strokeWidth={1.5} className="w-6 h-6" />
            <p>プロフィール編集</p>
          </CardContent>
        </Link>
      </Card>
      <Card className="w-full mb-4">
        <CardContent className="flex flex-col justify-center items-center py-5 px-6">
          <UserIcon className="w-34 h-34 border border-gray-300 rounded-full" />
          <h1 className="text-xl text-[#181818] mt-4 mb-2">xxx</h1>
        </CardContent>
      </Card>
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-xl font-bold mb-6">投稿一覧</h1>
        </CardContent>
      </Card>
    </div>
  );
}
