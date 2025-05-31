import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";

export default function PostsPage() {
  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="flex flex-col justify-center items-center py-5 px-6">
          <p>投稿する</p>
        </CardContent>
      </Card>
    </div>
  );
}
