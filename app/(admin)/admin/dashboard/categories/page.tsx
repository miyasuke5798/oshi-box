import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Category } from "@/types/category";

export default async function CategoriesDashboard() {
  const categories: Category[] = [];

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">カテゴリー一覧</h1>
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
                      <td className="p-4 text-sm">
                        <Link href={`/categories/${category.id}`}>
                          {category.id}
                        </Link>
                      </td>
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
