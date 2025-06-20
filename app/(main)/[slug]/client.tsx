"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon } from "@/components/svg/UserIcon";
import { UsersRound, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserData } from "@/types/user";
import { Post } from "@/types/post";
import { Oshi } from "@/types/oshi";
import PostList from "./components/PostList";

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
  const [oshis, setOshis] = useState<Oshi[]>([]);
  const [loading, setLoading] = useState(true);

  // 推し一覧を取得
  useEffect(() => {
    const fetchOshis = async () => {
      try {
        const response = await fetch("/api/oshi");
        if (response.ok) {
          const data = await response.json();
          setOshis(data.oshiList || []);
        }
      } catch (error) {
        console.error("Error fetching oshis:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isCurrentUser) {
      fetchOshis();
    } else {
      setLoading(false);
    }
  }, [isCurrentUser]);

  // 推しごとの投稿をフィルタリングする関数
  const getPostsByOshi = (oshiId: string) => {
    return posts.filter((post) => post.oshiId === oshiId);
  };

  // タブの動的生成
  const generateTabs = () => {
    const tabs = [{ value: "all", label: "すべて" }];

    if (isCurrentUser && !loading) {
      oshis.forEach((oshi) => {
        tabs.push({
          value: oshi.id,
          label: oshi.name,
        });
      });
    }

    return tabs;
  };

  const tabs = generateTabs();

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
            <TabsList
              className="flex justify-start w-full overflow-x-auto gap-1 p-1 scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="whitespace-nowrap flex-shrink-0 min-w-fit"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <PostList posts={posts} isCurrentUser={isCurrentUser} />
            </TabsContent>

            {isCurrentUser &&
              !loading &&
              oshis.map((oshi) => (
                <TabsContent key={oshi.id} value={oshi.id} className="mt-6">
                  <PostList
                    posts={getPostsByOshi(oshi.id)}
                    isCurrentUser={isCurrentUser}
                  />
                </TabsContent>
              ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
