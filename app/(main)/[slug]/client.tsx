"use client";
import Link from "next/link";
import Image from "next/image";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon } from "@/components/svg/UserIcon";
import { UsersRound, Link2, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserData } from "@/types/user";
import { Post } from "@/types/post";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface SlugPageClientProps {
  params: {
    slug: string;
  };
  userData: UserData;
  isCurrentUser: boolean;
  posts: Post[];
}

export function SlugPageClient({
  userData,
  isCurrentUser,
  posts,
}: SlugPageClientProps) {
  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="relative py-5 px-6">
          <div className="flex items-center gap-2 mb-3">
            {userData?.photoURL ? (
              <div className="relative w-20 h-20 min-w-20 min-h-20">
                <Image
                  src={userData.photoURL}
                  alt={userData.displayName || "ユーザー"}
                  fill
                  className="border border-gray-300 rounded-full object-cover"
                />
              </div>
            ) : (
              <UserIcon className="w-20 h-20 min-w-20 min-h-20 border border-gray-300 rounded-full" />
            )}
            <h1 className="text-xl text-[#181818] mt-4 mb-2">
              {userData?.displayName || ""}
            </h1>
          </div>
          <p className="text-xs mb-2">{userData?.bio || ""}</p>
          {/* <p className="">{userData?.oshiName || ""}</p> */}
          <p className="text-xs mb-2">
            {userData?.snsLink ? (
              <Link
                href={userData.snsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rose_link flex items-center gap-1 no-underline w-fit"
              >
                <Link2 className="w-3.5 h-3.5 transform rotate-[135deg]" />
                {userData.snsLink}
              </Link>
            ) : (
              <Link2 className="w-4.5 h-4.5 transform rotate-[135deg]" />
            )}
          </p>
          {isCurrentUser && (
            <Link
              href="/settings/profile"
              className="absolute top-5 right-5 rounded-full border border-gray-300 hover:bg-gray-50 px-4 py-1"
            >
              編集
            </Link>
          )}
        </CardContent>
      </Card>
      {isCurrentUser && (
        <Card className="w-full mb-4">
          <Link
            href="/settings/oshi"
            className="bg-white hover:bg-gray-50 rounded-[.5rem]"
          >
            <CardContent className="flex flex-row items-center gap-3 py-4 px-6">
              <UsersRound strokeWidth={1.5} className="w-6 h-6" />
              <p>推し管理</p>
            </CardContent>
          </Link>
        </Card>
      )}
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-xl font-bold mb-6">投稿一覧</h1>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="oshi1">推し１</TabsTrigger>
              <TabsTrigger value="oshi2">推し２</TabsTrigger>
              <TabsTrigger value="oshi3">推し３</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border-b pb-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 min-w-24 min-h-24 rounded-lg overflow-hidden bg-gray-100">
                          {post.images && post.images.length > 0 ? (
                            <Image
                              src={post.images[0]}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          {isCurrentUser && (
                            <p className="text-sm text-gray-500">
                              {post.visibility && post.visibility === "public"
                                ? "全体公開"
                                : "非公開"}
                            </p>
                          )}
                          <Link
                            href={`/users/posts/${post.id}`}
                            className="rose_link"
                          >
                            <h2 className="text-lg font-medium">
                              {post.title}
                            </h2>
                          </Link>
                          <p className="text-sm text-gray-600 mt-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {post.createdAt
                                ? format(
                                    new Date(
                                      post.createdAt.seconds * 1000 +
                                        post.createdAt.nanoseconds / 1000000
                                    ),
                                    "yyyy年MM月dd日",
                                    { locale: ja }
                                  )
                                : "不明"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>
                  まだ投稿がありません。
                  <br />
                  あなたの「推し活」をシェアしてみましょう！
                </p>
              )}
            </TabsContent>
            <TabsContent value="oshi1" className="mt-6">
              <p>推し１の投稿</p>
            </TabsContent>
            <TabsContent value="oshi2" className="mt-6">
              <p>推し２の投稿</p>
            </TabsContent>
            <TabsContent value="oshi3" className="mt-6">
              <p>推し３の投稿</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
