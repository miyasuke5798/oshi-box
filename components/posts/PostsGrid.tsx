"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UserIcon } from "@/components/svg/UserIcon";
import { Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ui/category-badge";
import { Post } from "@/types/post";
import { Category } from "@/types/category";
import { addCacheBuster } from "@/lib/utils";

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
  // エラー状態を管理
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  // ハイドレーション完了状態を管理
  const [isHydrated, setIsHydrated] = useState(false);
  // キャッシュバスティング済みの画像URLを管理
  const [cachedImageUrls, setCachedImageUrls] = useState<Map<string, string>>(
    new Map()
  );

  // デバッグ情報
  useEffect(() => {
    console.log("PostsGrid - posts received:", {
      count: posts.length,
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        hasImages: p.images?.length > 0,
      })),
    });
  }, [posts]);

  // ハイドレーション完了後にキャッシュバスティングを有効化
  useEffect(() => {
    console.log("PostsGrid - useEffect triggered, isHydrated:", isHydrated);
    setIsHydrated(true);

    // 全ての画像URLにキャッシュバスティングを適用
    const newCachedUrls = new Map<string, string>();

    // 投稿画像
    posts.forEach((post) => {
      if (post.images && post.images.length > 0) {
        post.images.forEach((imageUrl) => {
          if (imageUrl && !newCachedUrls.has(imageUrl)) {
            newCachedUrls.set(imageUrl, addCacheBuster(imageUrl));
          }
        });
      }
    });

    // ユーザーアバター画像
    posts.forEach((post) => {
      if (post.user.photoURL && !newCachedUrls.has(post.user.photoURL)) {
        newCachedUrls.set(
          post.user.photoURL,
          addCacheBuster(post.user.photoURL)
        );
      }
    });

    console.log("PostsGrid - cached URLs created:", newCachedUrls.size);
    setCachedImageUrls(newCachedUrls);
  }, [posts]);

  // カテゴリーIDから名前を取得する関数
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || null;
  };

  // 画像エラーハンドラー
  const handleImageError = (imageUrl: string) => {
    console.log("PostsGrid - image error:", imageUrl);
    setImageErrors((prev) => new Set(prev).add(imageUrl));
  };

  // 画像URLを取得（ハイドレーション完了後はキャッシュバスティング済みURLを使用）
  const getImageUrl = (url: string) => {
    if (!isHydrated || !url) return url;
    return cachedImageUrls.get(url) || url;
  };

  // 最大表示数を制限
  const displayPosts = maxPosts ? posts.slice(0, maxPosts) : posts;

  console.log("PostsGrid - render state:", {
    isHydrated,
    displayPostsCount: displayPosts.length,
    imageErrorsCount: imageErrors.size,
    cachedUrlsCount: cachedImageUrls.size,
  });

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
                    {!imageErrors.has(post.images[0]) ? (
                      <Image
                        src={getImageUrl(post.images[0])}
                        alt={post.title}
                        width={300}
                        height={400}
                        className="w-full h-auto"
                        style={{
                          aspectRatio: "auto",
                          display: "block",
                        }}
                        onError={() => handleImageError(post.images[0])}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
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
                      {post.user.photoURL &&
                      !imageErrors.has(post.user.photoURL) ? (
                        <Image
                          src={getImageUrl(post.user.photoURL)}
                          alt={post.user.displayName || "ユーザー"}
                          fill
                          className="object-cover border-[0.5px] border-gray-300"
                          onError={() => handleImageError(post.user.photoURL!)}
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
