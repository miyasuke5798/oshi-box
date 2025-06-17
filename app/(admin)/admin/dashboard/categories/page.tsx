import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getCategories } from "@/lib/firebase/admin";

export default async function CategoriesDashboard() {
  const categories = await getCategories();

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">カテゴリー一覧</h1>
        <Button asChild>
          <Link href="/admin/dashboard/categories/new">
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">カテゴリー名</th>
                  <th className="text-left p-4 font-medium">作成日</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id} className="border-b">
                      <td className="p-4 text-sm">{category.id}</td>
                      <td className="p-4 text-sm">{category.name}</td>
                      <td className="p-4 text-sm">
                        {category.createdAt
                          ? format(
                              category.createdAt.toDate(),
                              "yyyy年MM月dd日",
                              {
                                locale: ja,
                              }
                            )
                          : "不明"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-4 text-sm text-center text-gray-500"
                    >
                      カテゴリーがありません
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
