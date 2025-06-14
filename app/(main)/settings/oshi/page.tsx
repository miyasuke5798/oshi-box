"use client";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";

// TODO: 現在のユーザーが表示対象のユーザーと一致するかどうかを判定
export default function SettingsOshiPage() {
  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-base font-bold mb-4">推し管理</h1>
        </CardContent>
      </Card>
    </div>
  );
}
