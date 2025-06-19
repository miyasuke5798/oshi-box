import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-server";
import { getPostById, getCategories } from "@/lib/firebase/admin";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { ShareMenu } from "@/components/layout/share_menu";
import { UserIcon } from "lucide-react";
import { DeletePostDialog } from "./delete-post-dialog";

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

  // プライベート投稿へのアクセス制御
  if (post.visibility === "private" && !isCurrentUser) {
    redirect("/");
  }

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
          <BackButton />
          <div className="flex items-center gap-2 my-6">
            {post.user && (
              <Link href={`/${post.user.uid}`}>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    {post.user.photoURL ? (
                      <Image
                        src={post.user.photoURL}
                        alt={post.user.displayName || "ユーザー"}
                        fill
                        className="object-cover border-[0.5px] border-gray-300 rounded-full"
                      />
                    ) : (
                      <UserIcon className="w-full h-full text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {post.user.displayName || "不明"}
                  </span>
                </div>
              </Link>
            )}
          </div>
          <div className="text-xs text-gray-500">
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
          </div>
          {post.images && post.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  src={image || ""}
                  alt={`投稿画像 ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-auto rounded-lg object-cover"
                />
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold my-4">{post.title}</h1>
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
          {isCurrentUser && (
            <div className="flex items-center gap-6 mt-12 w-full">
              <Link
                href={`/users/posts/${post.id}/edit`}
                className="w-1/2 text-center rounded-full border border-gray-300 hover:bg-gray-50 px-3 py-1.5"
              >
                編集
              </Link>
              <DeletePostDialog
                postId={post.id}
                postTitle={post.title}
                postUserId={post.userId}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
