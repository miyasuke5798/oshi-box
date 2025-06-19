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
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
              {posts.map((post) => (
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
                      <h2 className="text-sm font-medium group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h2>
                      <div className="flex items-center gap-2">
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
