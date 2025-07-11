"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon } from "@/components/svg/UserIcon";
import { UsersRound, Link2, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserData } from "@/types/user";
import { Post } from "@/types/post";
import { Oshi } from "@/types/oshi";
import { Category } from "@/types/category";
import PostList from "./components/PostList";
import { ChevronLeftBackButton } from "@/components/ui/chevron-left-back-button";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { OshiDaysBadge } from "@/components/ui/oshi-days-badge";

interface TabItem {
  value: string;
  label: string;
  oshi: Oshi | null;
}

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
  const [activeTab, setActiveTab] = useState<string>("");

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
          const oshiList = oshisData.oshiList || [];
          setOshis(oshiList);
          // 最初の推しをアクティブタブに設定
          if (oshiList.length > 0) {
            setActiveTab(oshiList[0].id);
          }
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
  const generateTabs = (): TabItem[] => {
    const tabs: TabItem[] = [];

    if (!loading) {
      oshis.forEach((oshi) => {
        tabs.push({
          value: oshi.id,
          label: oshi.name,
          oshi: oshi,
        });
      });
    }
    return tabs;
  };

  const tabs = generateTabs();

  // URLコピー機能
  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success("URLをコピーしました", { icon: <SuccessCircle /> });
    } catch (error) {
      console.error("URLコピーエラー:", error);
      toast.error("URLのコピーに失敗しました");
    }
  };

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
              {/* URLコピーボタン */}
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 px-2 py-0.5 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                リンクをコピー
              </button>
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className="flex items-end justify-start w-full h-auto overflow-x-auto gap-1 p-1 scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {tabs.map((tab) => {
                //console.log("Rendering tab:", tab);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="whitespace-nowrap flex-shrink-0 min-w-fit"
                  >
                    {tab.oshi ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 relative">
                          {tab.oshi.imageUrl ? (
                            <Image
                              src={tab.oshi.imageUrl}
                              alt={`${tab.oshi.name}の画像`}
                              fill
                              className="object-cover rounded-full border border-gray-300"
                            />
                          ) : (
                            <UserIcon className="w-9 h-9 border border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="text-sm">{tab.oshi.name}</div>
                        <OshiDaysBadge
                          oshiStartedAt={tab.oshi.oshiStartedAt || null}
                          showLabel={true}
                        />
                      </div>
                    ) : (
                      tab.label
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {!loading &&
              oshis.map((oshi) => {
                return (
                  <TabsContent key={oshi.id} value={oshi.id} className="mt-6">
                    <PostList
                      posts={getPostsByOshi(oshi.id)}
                      isCurrentUser={isCurrentUser}
                      categories={categories}
                    />
                  </TabsContent>
                );
              })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
