import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-server";
import { getPostById, getCategories } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ShareMenu } from "@/components/layout/share_menu";

interface PageProps {
  params: Promise<{
    uid: string;
  }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const session = await requireAuth();
  const { uid } = await params;
  const [post, categories] = await Promise.all([
    getPostById(uid),
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  const isCurrentUser = session.uid === post.userId;

  // カテゴリーIDから名前を取得する関数
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <div className="flex items-center gap-2 mb-4">
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
            {isCurrentUser && (
              <Link
                href={`/users/posts/${post.id}/edit`}
                className="ml-auto rounded-full border border-gray-300 hover:bg-gray-50 px-4 py-1"
              >
                編集
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((categoryId) => (
                <Badge key={categoryId} variant="secondary" className="text-xs">
                  {getCategoryName(categoryId)}
                </Badge>
              ))}
            </div>
          )}
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          {post.images && post.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`投稿画像 ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-auto rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
