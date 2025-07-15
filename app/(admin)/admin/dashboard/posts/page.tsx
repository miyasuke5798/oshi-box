import Link from "next/link";
import { getPostsForAdmin } from "@/lib/firebase/admin";
import { getCategories } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Post } from "@/types/post";
import { Badge } from "@/components/ui/badge";
import { DeletePostDialog } from "./_components/delete-post-dialog";

type PostWithUser = Post & {
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    bio: string | null;
    oshiName: string | null;
    snsLink: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export default async function PostsDashboard() {
  const [posts, categories] = await Promise.all([
    getPostsForAdmin(),
    getCategories(),
  ]);

  // カテゴリーIDから名前を取得する関数
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">投稿一覧</h1>
      </div>

      {/* デスクトップ用テーブル */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">タイトル</th>
                  <th className="text-left p-4 font-medium">投稿者</th>
                  <th className="text-left p-4 font-medium">カテゴリー</th>
                  <th className="text-left p-4 font-medium">推し</th>
                  <th className="text-left p-4 font-medium">公開範囲</th>
                  <th className="text-left p-4 font-medium">作成日</th>
                  <th className="text-left p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.length > 0 ? (
                  (posts as PostWithUser[]).map((post) => (
                    <tr key={post.id} className="border-b">
                      <td className="p-4 text-sm font-mono">{post.id}</td>
                      <td className="p-4 text-sm">
                        <Link
                          href={`/users/posts/${post.id}`}
                          className="rose_link"
                        >
                          <div className="font-medium">{post.title}</div>
                        </Link>
                      </td>
                      <td className="p-4 text-sm">
                        <div>
                          <div className="font-medium">
                            <Link
                              href={`/${post.user.uid}`}
                              className="rose_link"
                            >
                              {post.user.displayName || "名前未設定"}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {post.categories.map((categoryId) => (
                            <Badge
                              key={categoryId}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getCategoryName(categoryId)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {post.oshi ? (
                          <Badge variant="outline" className="text-xs">
                            {post.oshi.name}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-xs">未選択</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              post.visibility === "public"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {post.visibility === "public"
                              ? "全体公開"
                              : "非公開"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {post.createdAt
                          ? format(
                              new Date(
                                post.createdAt.seconds * 1000 +
                                  post.createdAt.nanoseconds / 1000000
                              ),
                              "yyyy年MM月dd日",
                              { locale: ja }
                            )
                          : "不明"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <DeletePostDialog
                            postId={post.id}
                            postTitle={post.title}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-4 text-sm text-center text-gray-500"
                    >
                      投稿がありません
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
        {posts.length > 0 ? (
          (posts as PostWithUser[]).map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* タイトル */}
                  <div>
                    <Link
                      href={`/users/posts/${post.id}`}
                      className="rose_link"
                    >
                      <h3 className="font-medium text-lg">{post.title}</h3>
                    </Link>
                  </div>

                  {/* 投稿者 */}
                  <div>
                    <span className="text-sm text-gray-500">投稿者: </span>
                    <Link
                      href={`/${post.user.uid}`}
                      className="rose_link text-sm font-medium"
                    >
                      {post.user.displayName || "名前未設定"}
                    </Link>
                  </div>

                  {/* カテゴリー */}
                  <div>
                    <span className="text-sm text-gray-500">カテゴリー: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.categories.map((categoryId) => (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="text-xs"
                        >
                          {getCategoryName(categoryId)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 推し */}
                  <div>
                    <span className="text-sm text-gray-500">推し: </span>
                    {post.oshi ? (
                      <Badge variant="outline" className="text-xs ml-1">
                        {post.oshi.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-500 text-xs ml-1">未選択</span>
                    )}
                  </div>

                  {/* 公開範囲 */}
                  <div>
                    <span className="text-sm text-gray-500">公開範囲: </span>
                    <Badge
                      variant={
                        post.visibility === "public" ? "default" : "secondary"
                      }
                      className="text-xs ml-1"
                    >
                      {post.visibility === "public" ? "全体公開" : "非公開"}
                    </Badge>
                  </div>

                  {/* 作成日 */}
                  <div>
                    <span className="text-sm text-gray-500">作成日: </span>
                    <span className="text-sm">
                      {post.createdAt
                        ? format(
                            new Date(
                              post.createdAt.seconds * 1000 +
                                post.createdAt.nanoseconds / 1000000
                            ),
                            "yyyy年MM月dd日",
                            { locale: ja }
                          )
                        : "不明"}
                    </span>
                  </div>

                  {/* 操作ボタン */}
                  <div className="pt-2 border-t">
                    <DeletePostDialog postId={post.id} postTitle={post.title} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              投稿がありません
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
