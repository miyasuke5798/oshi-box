import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default async function AdminDashboard() {
  const users = await getUsers();

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">ユーザー一覧</h1>
      </div>

      {/* デスクトップ用テーブル */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">名前</th>
                  <th className="text-left p-4 font-medium">メールアドレス</th>
                  <th className="text-left p-4 font-medium">登録日</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b">
                    <td className="p-4 text-sm">{user.uid}</td>
                    <td className="p-4 text-sm">
                      <Link href={`/${user.uid}`} className="rose_link">
                        {user.displayName || "未設定"}
                      </Link>
                    </td>
                    <td className="p-4 text-sm">{user.email}</td>
                    <td className="p-4 text-sm">
                      {user.createdAt
                        ? format(user.createdAt.toDate(), "yyyy年MM月dd日", {
                            locale: ja,
                          })
                        : "不明"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* モバイル用カード表示 */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.uid}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* 名前 */}
                <div>
                  <Link href={`/${user.uid}`} className="rose_link">
                    <h3 className="font-medium text-lg">
                      {user.displayName || "未設定"}
                    </h3>
                  </Link>
                </div>

                {/* ユーザーID */}
                <div>
                  <span className="text-sm text-gray-500">ID: </span>
                  <span className="text-sm font-mono">{user.uid}</span>
                </div>

                {/* メールアドレス */}
                <div>
                  <span className="text-sm text-gray-500">
                    メールアドレス:{" "}
                  </span>
                  <span className="text-sm break-all">{user.email}</span>
                </div>

                {/* 登録日 */}
                <div>
                  <span className="text-sm text-gray-500">登録日: </span>
                  <span className="text-sm">
                    {user.createdAt
                      ? format(user.createdAt.toDate(), "yyyy年MM月dd日", {
                          locale: ja,
                        })
                      : "不明"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
