import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PostsGrid } from "@/components/posts/PostsGrid";
import { getPosts, getCategories } from "@/lib/firebase/admin";
import { HomeContent } from "@/components/home/home-content";
import { HomeClient } from "@/components/home/home-client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export default async function Home() {
  // セッションを取得（エラーが発生しないように）
  let session = null;
  try {
    session = await getSession();
  } catch {
    // セッションが取得できない場合は無視（未ログイン状態）
  }

  // ログイン中の場合はマイページにリダイレクト
  if (session?.uid) {
    redirect(`/${session.uid}`);
  }

  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <div className="mt-6 mb-16">
      {/* クライアントサイドのロジック（useEffect, useSearchParams） */}
      <Suspense fallback={null}>
        <HomeClient />
      </Suspense>

      {/* サーバーサイドでレンダリングされるコンテンツ */}
      <HomeContent />

      {/* 投稿一覧 */}
      <Card className="w-full">
        <CardContent className="py-5 px-6">
          <PostsGrid
            posts={posts}
            categories={categories}
            showTitle={true}
            //maxPosts={6}
          />
        </CardContent>
      </Card>
    </div>
  );
}
