import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getAllOshis } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default async function OshisDashboard() {
  const oshis = await getAllOshis();

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">推し一覧</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">名前</th>
                  <th className="text-left p-4 font-medium">ユーザー</th>
                  <th className="text-left p-4 font-medium">投稿数</th>
                  <th className="text-left p-4 font-medium">登録日</th>
                  <th className="text-left p-4 font-medium">更新日</th>
                </tr>
              </thead>
              <tbody>
                {oshis.length > 0 ? (
                  oshis.map((oshi) => (
                    <tr key={oshi.id} className="border-b">
                      <td className="p-4 text-sm font-mono">{oshi.id}</td>
                      <td className="p-4 text-sm">
                        <div className="font-medium">{oshi.name}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <Link href={`/${oshi.userId}`} className="rose_link">
                          {oshi.userName}
                        </Link>
                      </td>
                      <td className="p-4 text-sm">
                        <Badge
                          variant={oshi.postCount > 0 ? "default" : "secondary"}
                        >
                          {oshi.postCount}件
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {format(new Date(oshi.createdAt), "yyyy年MM月dd日", {
                          locale: ja,
                        })}
                      </td>
                      <td className="p-4 text-sm">
                        {format(new Date(oshi.updatedAt), "yyyy年MM月dd日", {
                          locale: ja,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-4 text-sm text-center text-gray-500"
                    >
                      推しが登録されていません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
