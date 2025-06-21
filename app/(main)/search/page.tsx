import PostList from "./components/PostList";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { notFound } from "next/navigation";
import { getPostsByHashtag } from "@/lib/firebase/admin";
import { Post } from "@/types/post";

interface SearchPageProps {
  searchParams: Promise<{
    hashtag?: string;
    category?: string;
    q?: string; // フリーワード検索用
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { hashtag, category, q } = await searchParams;

  // 検索パラメータがない場合は404
  if (!hashtag && !category && !q) {
    notFound();
  }

  let posts: Post[] = [];
  let searchTitle = "";

  // 検索タイプに応じてデータを取得
  if (hashtag) {
    posts = await getPostsByHashtag(hashtag);
    searchTitle = `#${hashtag} の検索結果`;
  } else if (category) {
    // TODO: カテゴリー検索の実装
    // posts = await getPostsByCategory(category);
    // searchTitle = `${category} カテゴリーの検索結果`;
    notFound(); // 未実装の場合は404
  } else if (q) {
    // TODO: フリーワード検索の実装
    // posts = await getPostsByKeyword(q);
    // searchTitle = `"${q}" の検索結果`;
    notFound(); // 未実装の場合は404
  }

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <BackButton />
          <h1 className="text-xl font-bold my-6">{searchTitle}</h1>
          <PostList posts={posts} />
        </CardContent>
      </Card>
    </div>
  );
}
