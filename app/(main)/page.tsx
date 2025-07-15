import { Card, CardContent } from "@/components/ui/card";
import { PostsGrid } from "@/components/posts/PostsGrid";
import { getPosts, getCategories } from "@/lib/firebase/admin";
import { HomeContent } from "@/components/home/home-content";

export default async function Home() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <div className="mt-6 mb-16">
      <HomeContent />

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
