import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserIcon } from "@/components/svg/UserIcon";
import { HiHome } from "react-icons/hi2";
import { BsFillSendFill } from "react-icons/bs";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function SlugPage({ params }: PageProps) {
  return (
    <div className="mt-3 mb-16">
      <ul className="px-3 sm:px-0 py-4 grid grid-cols-4 gap-3">
        <li className="flex flex-col gap-0.5 items-center">
          <HiHome size={26} color="#f3969a" />
          <div
            className="bg-[#f3969a] flex items-center justify-center text-white text-[10px] h-[23px] w-full rounded-sm"
          >
            マイページ
          </div>
        </li>
        <li className="flex flex-col gap-0.5 items-center">
          <BsFillSendFill size={26} color="#f3969a" />
          <div
            className="flex items-center justify-center text-[#f3969a] text-[10px] h-[23px] w-full rounded-sm"
          >
            投稿する
          </div>
        </li>
      </ul>
      <Card className="w-full mb-4">
        <CardHeader className="text-sm font-normal">
          このエリアは{params.slug}さんだけに見えています
        </CardHeader>
        <CardContent>コンテンツ</CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col justify-center items-center py-5 px-6">
          <UserIcon className="w-34 h-34 border border-gray-300 rounded-full" />
          <h1 className="text-xl text-[#181818] mt-4 mb-2">{params.slug}</h1>
        </CardContent>
      </Card>
    </div>
  );
}
