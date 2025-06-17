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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">ユーザーID</th>
                  <th className="text-left p-4 font-medium">名前</th>
                  <th className="text-left p-4 font-medium">メールアドレス</th>
                  <th className="text-left p-4 font-medium">登録日</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b">
                    <td className="p-4 text-sm">
                      <Link href={`/${user.uid}`}>{user.uid}</Link>
                    </td>
                    <td className="p-4 text-sm">
                      {user.displayName || "未設定"}
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
    </div>
  );
}
