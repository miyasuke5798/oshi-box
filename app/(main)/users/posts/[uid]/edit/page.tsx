import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-server";
import { getPostById } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { EditPostForm } from "./edit-form";

interface PageProps {
  params: Promise<{
    uid: string;
  }>;
}

export default async function EditPostPage({ params }: PageProps) {
  await requireAuth();
  const { uid } = await params;
  const post = await getPostById(uid);

  if (!post) {
    notFound();
  }

  return (
    <div className="mt-3 mb-16">
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-xl font-bold mb-6">投稿を編集</h1>
          <EditPostForm post={post} />
        </CardContent>
      </Card>
    </div>
  );
}
