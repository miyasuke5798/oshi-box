"use client";
import Link from "next/link";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon } from "@/components/svg/UserIcon";
import { CircleUser, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SlugPage() {
  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <Link
          href="/settings/profile"
          className="bg-white hover:bg-gray-50 border-b rounded-t-[.5rem]"
        >
          <CardContent className="flex flex-row items-center gap-3 py-4 px-6">
            <CircleUser strokeWidth={1.5} className="w-6 h-6" />
            <p>プロフィール編集</p>
          </CardContent>
        </Link>
        <Link
          href="/settings/oshi"
          className="bg-white hover:bg-gray-50 rounded-b-[.5rem]"
        >
          <CardContent className="flex flex-row items-center gap-3 py-4 px-6">
            <UsersRound strokeWidth={1.5} className="w-6 h-6" />
            <p>推し管理</p>
          </CardContent>
        </Link>
      </Card>
      <Card className="w-full mb-4">
        <CardContent className="flex flex-row justify-items-start items-center gap-4 py-5 px-6">
          <UserIcon className="w-26 h-26 border border-gray-300 rounded-full" />
          <h1 className="text-xl text-[#181818] mt-4 mb-2">xxx</h1>
        </CardContent>
      </Card>
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
              <p>
                まだ投稿がありません。
                <br />
                あなたの「推し活」をシェアしてみましょう！
              </p>
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
