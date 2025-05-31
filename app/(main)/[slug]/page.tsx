import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserIcon } from "@/components/svg/UserIcon";

export default function SlugPage() {
  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardHeader className="text-sm font-normal">
          このエリアはxxxさんだけに見えています
        </CardHeader>
        <CardContent>コンテンツ</CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col justify-center items-center py-5 px-6">
          <UserIcon className="w-34 h-34 border border-gray-300 rounded-full" />
          <h1 className="text-xl text-[#181818] mt-4 mb-2">xxx</h1>
        </CardContent>
      </Card>
    </div>
  );
}
