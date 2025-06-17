import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-server";
import { getPosts } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

export default async function PostsPage() {
  await requireAuth();
  const posts = await getPosts();

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-xl font-bold mb-6">みんなの投稿</h1>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={`/${post.user.uid}`}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {post.user.displayName || "不明"}
                    </Link>
                    <span className="text-xs text-gray-500">
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
                  <Link
                    href={`/users/posts/${post.id}`}
                    className="rose_link"
                  >
                    <h2 className="text-lg font-medium">{post.title}</h2>
                  </Link>
                  <p className="text-sm text-gray-600 mt-2">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>投稿がありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
