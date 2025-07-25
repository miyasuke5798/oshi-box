import Link from "next/link";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { XBackButton } from "@/components/ui/x-back-button";
import { Badge } from "@/components/ui/badge";
import { ShareMenu } from "@/components/layout/share_menu";
import { XShareButton } from "@/components/ui/x-share-button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { DeletePostDialog } from "./delete-post-dialog";
import { HashtagText } from "@/lib/utils/hashtag";
import { getSession } from "@/lib/auth-server";
import { getPostById, getCategories, getOshiById } from "@/lib/firebase/admin";
import { CategoryBadge } from "@/components/ui/category-badge";
import { PostFooterCard } from "./post-footer-card";
import { PostImages } from "./components/post-images";
import { UserAvatar } from "./components/user-avatar";

interface PageProps {
  params: Promise<{
    uid: string;
  }>;
}

// 動的なメタデータを生成する関数
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { uid } = await params;
  const post = await getPostById(uid, false); // 署名付きURLを生成するためfalseを指定

  if (!post) {
    return {
      title: "投稿が見つかりません | 推しBox",
      description: "指定された投稿が見つかりませんでした。",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const postUrl = `${baseUrl}/users/posts/${post.id}`;
  const imageUrl =
    post.images && post.images.length > 0 ? post.images[0] : undefined;

  // 投稿内容からハッシュタグを除去したテキストを作成
  const contentWithoutHashtags = post.content
    .replace(/[#＃][^\s#＃]+/g, "")
    .trim();
  const description =
    contentWithoutHashtags.length > 0
      ? contentWithoutHashtags.substring(0, 160) +
        (contentWithoutHashtags.length > 160 ? "..." : "")
      : "推しBoxで投稿された推し活の記録です。";

  return {
    title: `${post.title} | 推しBox`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: "article",
      url: postUrl,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [
            {
              url: "/oshi_box_logo.png",
              width: 1200,
              height: 630,
              alt: "推しBox",
            },
          ],
      siteName: "推しBox",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: imageUrl ? [imageUrl] : ["/oshi_box_logo_x_share.png"],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { uid } = await params;
  const [post, categories] = await Promise.all([
    getPostById(uid, false), // 署名付きURLを生成するためfalseを指定
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  // セッションを取得（ログインしていない場合はnull）
  const session = await getSession();
  const isCurrentUser = session?.uid === post.userId;

  // プライベート投稿へのアクセス制御
  if (post.visibility === "private" && !isCurrentUser) {
    redirect("/");
  }

  // 推しの情報を取得
  let oshi = null;
  if (post.oshiId) {
    oshi = await getOshiById(post.userId, post.oshiId);
  }

  // カテゴリーIDから名前を取得する関数
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || null;
  };

  // 画像URLを取得
  const imageUrl =
    post.images && post.images.length > 0 ? post.images[0] : undefined;

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-5">
        <CardContent className="py-5 px-6">
          <XBackButton to={`/${post.userId}`} />
          <div className="flex items-center gap-2 my-6">
            {post.user && (
              <Link href={`/${post.user.uid}`}>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <UserAvatar
                      photoURL={post.user.photoURL}
                      displayName={post.user.displayName}
                      uid={post.user.uid}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {post.user.displayName || "不明"}
                  </span>
                </div>
              </Link>
            )}
          </div>
          <PostImages images={post.images || []} title={post.title} />
          {oshi && (
            <div className="flex items-center gap-2 my-4">
              <span className="text-sm text-gray-500">推し:</span>
              <Badge variant="outline" className="text-xs">
                {oshi.name}
              </Badge>
            </div>
          )}
          <h1 className="text-2xl font-bold my-4">{post.title}</h1>
          <div className="prose max-w-none mb-4">
            <p className="whitespace-pre-wrap">
              <HashtagText text={post.content} />
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories
                  .map((categoryId) => {
                    const categoryName = getCategoryName(categoryId);
                    return categoryName
                      ? { id: categoryId, name: categoryName }
                      : null;
                  })
                  .filter((category) => category !== null)
                  .map((category, index) => (
                    <CategoryBadge
                      key={index}
                      categoryId={category!.id}
                      categoryName={category!.name}
                    />
                  ))}
              </div>
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
          <div className="flex items-center justify-start mt-10">
            <XShareButton
              title={post.title}
              content={post.content}
              url={`/users/posts/${post.id}`}
              imageUrl={imageUrl}
            />
            <p className="text-sm text-gray-500 ml-4">
              Xでシェアすると、推し登録は無制限に
            </p>
          </div>
          {isCurrentUser && (
            <div className="flex items-center gap-6 mt-10 w-full">
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
      <PostFooterCard />
    </div>
  );
}
