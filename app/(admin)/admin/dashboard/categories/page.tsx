import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getCategories } from "@/lib/firebase/admin";
import { DeleteCategoryDialog } from "./_components/delete-category-dialog";

export default async function CategoriesDashboard() {
  const categories = await getCategories();

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">カテゴリー一覧</h1>
        <Button variant="default" asChild>
          <Link
            href="/admin/dashboard/categories/new"
            className="inline-flex items-center gap-2 px-4 py-2"
          >
            新規作成
          </Link>
        </Button>
      </div>

      {/* デスクトップ用テーブル */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">カテゴリー名</th>
                  <th className="text-left p-4 font-medium">作成日</th>
                  <th className="text-left p-4 font-medium">操作</th>
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
                              new Date(
                                category.createdAt.seconds * 1000 +
                                  category.createdAt.nanoseconds / 1000000
                              ),
                              "yyyy年MM月dd日",
                              {
                                locale: ja,
                              }
                            )
                          : "不明"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Link
                            href={`/admin/dashboard/categories/${category.id}/edit`}
                            className="rose_link"
                          >
                            編集
                          </Link>
                          <DeleteCategoryDialog
                            categoryId={category.id}
                            categoryName={category.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
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

      {/* モバイル用カード表示 */}
      <div className="md:hidden space-y-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* カテゴリー名 */}
                  <div>
                    <h3 className="font-medium text-lg">{category.name}</h3>
                  </div>

                  {/* カテゴリーID */}
                  <div>
                    <span className="text-sm text-gray-500">ID: </span>
                    <span className="text-sm font-mono">{category.id}</span>
                  </div>

                  {/* 作成日 */}
                  <div>
                    <span className="text-sm text-gray-500">作成日: </span>
                    <span className="text-sm">
                      {category.createdAt
                        ? format(
                            new Date(
                              category.createdAt.seconds * 1000 +
                                category.createdAt.nanoseconds / 1000000
                            ),
                            "yyyy年MM月dd日",
                            {
                              locale: ja,
                            }
                          )
                        : "不明"}
                    </span>
                  </div>

                  {/* 操作ボタン */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/dashboard/categories/${category.id}/edit`}
                        className="rose_link text-sm"
                      >
                        編集
                      </Link>
                      <DeleteCategoryDialog
                        categoryId={category.id}
                        categoryName={category.name}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              カテゴリーがありません
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
