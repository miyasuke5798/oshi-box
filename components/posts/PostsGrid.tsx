import Link from "next/link";
import Image from "next/image";
import { UserIcon } from "@/components/svg/UserIcon";
import { Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { Post } from "@/types/post";
import { Category } from "@/types/category";

interface PostsGridProps {
  posts: Post[];
  categories: Category[];
  showTitle?: boolean;
  maxPosts?: number;
}

export function PostsGrid({
  posts,
  categories,
  showTitle = true,
  maxPosts,
}: PostsGridProps) {
  // カテゴリーIDから名前を取得する関数
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || null;
  };

  // 最大表示数を制限
  const displayPosts = maxPosts ? posts.slice(0, maxPosts) : posts;

  return (
    <div>
      {showTitle && <h2 className="text-xl font-bold mb-6">みんなの投稿</h2>}
      {displayPosts.length > 0 ? (
        <div className="columns-2 md:columns-3 gap-4">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/users/posts/${post.id}`}
              className="group break-inside-avoid block mb-4"
            >
              <div className="relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {post.images && post.images.length > 0 ? (
                  <div className="relative">
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      width={300}
                      height={400}
                      className="w-full h-auto"
                      style={{
                        aspectRatio: "auto",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-sm font-medium group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-6 h-6 overflow-hidden rounded-full">
                      {post.user.photoURL ? (
                        <Image
                          src={post.user.photoURL}
                          alt={post.user.displayName || "ユーザー"}
                          fill
                          className="object-cover border-[0.5px] border-gray-300"
                        />
                      ) : (
                        <UserIcon className="w-full h-full text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs text-gray-600 truncate">
                      {post.user.displayName || "不明"}
                    </span>
                  </div>
                  {/* カテゴリー表示 */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
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
                  {post.oshi && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs text-gray-500">推し:</span>
                      <Badge variant="outline" className="text-xs">
                        {post.oshi.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>投稿がありません。</p>
      )}
    </div>
  );
}
