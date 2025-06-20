"use client";
import { useState, useEffect } from "react";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuccessCircle } from "@/components/svg/success_circle";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";
import { Oshi } from "@/types/oshi";
import { DeleteOshiDialog } from "./delete-oshi-dialog";
import { z } from "zod";

// 推し名のバリデーションスキーマ
const oshiNameSchema = z.object({
  name: z
    .string()
    .min(1, "推しの名前を入力してください")
    .max(50, "推しの名前は50文字以内で入力してください")
    .trim(),
});

export default function SettingsOshiPage() {
  const [oshis, setOshis] = useState<Oshi[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOshiName, setNewOshiName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // 推し一覧を取得
  useEffect(() => {
    fetchOshis();
  }, []);

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

  // 推しを追加
  const handleAddOshi = async () => {
    if (!newOshiName.trim()) return;

    let validatedName: string;
    try {
      // バリデーション実行
      const validatedData = oshiNameSchema.parse({ name: newOshiName });
      validatedName = validatedData.name;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          error.errors[0]?.message || "入力内容を確認してください";
        toast.error(errorMessage, {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        });
        return;
      }
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/oshi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: validatedName }),
      });

      if (response.ok) {
        setNewOshiName("");
        await fetchOshis(); // 一覧を再取得
        toast.success("作成しました", { icon: <SuccessCircle /> });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "推しの追加に失敗しました", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        });
      }
    } catch (error) {
      console.error("Error adding oshi:", error);
      toast.error("推しの追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <BackButton />
          {/* 推し追加フォーム */}
          <div className="mt-6 mb-10">
            <h2 className="text-base font-bold mb-3">推しの作成</h2>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="推しの名前を入力"
                value={newOshiName}
                onChange={(e) => setNewOshiName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddOshi()}
                className="flex-1"
                maxLength={50}
              />
              <Button
                onClick={handleAddOshi}
                disabled={isAdding || !newOshiName.trim()}
                size="sm"
                className="py-4.5"
              >
                <Plus className="w-4 h-4 mr-1" />
                作成
              </Button>
            </div>
          </div>

          {/* 推し一覧 */}
          <div>
            <h2 className="text-base font-bold mb-3">登録済みの推し</h2>
            {loading ? (
              <p className="text-sm text-gray-500">読み込み中...</p>
            ) : oshis.length > 0 ? (
              <div className="space-y-2">
                {oshis.map((oshi) => (
                  <div
                    key={oshi.id}
                    className="flex items-center justify-between p-3 border-b"
                  >
                    <p>{oshi.name}</p>
                    <div>
                      <DeleteOshiDialog
                        oshiId={oshi.id}
                        oshiName={oshi.name}
                        onDelete={fetchOshis}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center my-10">推しが登録されていません。</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
