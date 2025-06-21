import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Post } from "@/types/post";
import { HashtagText } from "@/lib/utils/hashtag";

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  // 投稿を新規作成順（新しい順）でソート
  const sortedPosts = [...posts].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return (
      new Date(
        b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000
      ).getTime() -
      new Date(
        a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000
      ).getTime()
    );
  });

  if (sortedPosts.length === 0) {
    return (
      <div className="text-center">
        <p className="mb-4">該当する投稿が見つかりませんでした。</p>
        <p className="mb-4">他のハッシュタグで検索してみてください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <div key={post.id} className="border-b pb-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 min-w-24 min-h-24 rounded-lg overflow-hidden bg-gray-100">
              {post.images && post.images.length > 0 ? (
                <Image
                  src={post.images[0]}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              {/*<div className="flex items-center gap-2 mb-1">
                <Link href={`/${post.user.uid}`} className="rose_link">
                  <span className="text-sm font-medium">
                    {post.user.displayName || "不明"}
                  </span>
                </Link>
              </div>*/}
              <Link href={`/users/posts/${post.id}`} className="rose_link">
                <h2 className="text-lg font-medium">{post.title}</h2>
              </Link>
              <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                <HashtagText text={post.content} />
              </p>
              <div className="flex items-center gap-2 mt-2">
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
