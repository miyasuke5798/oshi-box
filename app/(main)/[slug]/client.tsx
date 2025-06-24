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
import { Category } from "@/types/category";
import PostList from "./components/PostList";
import { ChevronLeftBackButton } from "@/components/ui/chevron-left-back-button";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 推し情報とカテゴリー情報を並行して取得
        const [oshisResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/user-oshis/${userData.uid}`),
          fetch("/api/categories"),
        ]);

        if (oshisResponse.ok) {
          const oshisData = await oshisResponse.json();
          setOshis(oshisData.oshiList || []);
        } else {
          console.error(
            "API error:",
            oshisResponse.status,
            oshisResponse.statusText
          );
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        } else {
          console.error(
            "API error:",
            categoriesResponse.status,
            categoriesResponse.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData.uid) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [userData.uid]);

  // 推しごとの投稿をフィルタリングする関数
  const getPostsByOshi = (oshiId: string) => {
    return posts.filter((post) => post.oshiId === oshiId);
  };

  // タブの動的生成
  const generateTabs = () => {
    const tabs = [{ value: "all", label: "すべて" }];

    if (!loading) {
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
          {!isCurrentUser && (
            <div className="absolute top-5 left-5">
              <ChevronLeftBackButton />
            </div>
          )}
          <div className="max-w-[70%] mx-auto">
            <div className="flex flex-col items-center gap-2 mt-5 mb-3">
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
              <h1 className="text-xl text-[#181818] my-2">
                {userData?.displayName || ""}
              </h1>
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
            </div>
          </div>
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
              <PostList
                posts={posts}
                isCurrentUser={isCurrentUser}
                categories={categories}
              />
            </TabsContent>

            {!loading &&
              (() => {
                return oshis.map((oshi) => {
                  return (
                    <TabsContent key={oshi.id} value={oshi.id} className="mt-6">
                      <PostList
                        posts={getPostsByOshi(oshi.id)}
                        isCurrentUser={isCurrentUser}
                        categories={categories}
                      />
                    </TabsContent>
                  );
                });
              })()}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
