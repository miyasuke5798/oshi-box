import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { getPosts, getCategories } from "@/lib/firebase/admin";
import { PostsGrid } from "@/components/posts/PostsGrid";

export default async function PostsPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <PostsGrid posts={posts} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
