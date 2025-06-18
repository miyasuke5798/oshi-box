import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth-server";
import { getPosts } from "@/lib/firebase/admin";
import Link from "next/link";
import Image from "next/image";
import { UserIcon } from "@/components/svg/UserIcon";
import { Image as ImageIcon } from "lucide-react";

export default async function PostsPage() {
  await requireAuth();
  const posts = await getPosts();

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-xl font-bold mb-6">みんなの投稿</h1>
          {posts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/users/posts/${post.id}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {post.images && post.images.length > 0 ? (
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h2 className="text-sm font-medium group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="relative w-6 h-6 overflow-hidden">
                        {post.user.photoURL ? (
                          <Image
                            src={post.user.photoURL}
                            alt={post.user.displayName || "ユーザー"}
                            fill
                            className="object-cover border-[0.5px] border-gray-300 rounded-full"
                          />
                        ) : (
                          <UserIcon className="w-full h-full text-gray-400" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        {post.user.displayName || "不明"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>投稿がありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
