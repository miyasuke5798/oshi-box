"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SuccessCircle } from "@/components/svg/success_circle";
import { CirclePlus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Oshi } from "@/types/oshi";

// 推し名のバリデーションスキーマ
const oshiNameSchema = z.object({
  name: z
    .string()
    .min(1, "推しの名前を入力してください")
    .max(50, "推しの名前は50文字以内で入力してください")
    .trim(),
});

interface OshiSelectorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
}

export function OshiSelector({
  value,
  onValueChange,
  placeholder = "推しを選択してください",
}: OshiSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOshiName, setNewOshiName] = useState("");
  const [error, setError] = useState<string>("");
  const [oshiList, setOshiList] = useState<Oshi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 推し一覧を取得
  const fetchOshiList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/oshi");

      if (!response.ok) {
        throw new Error("推し一覧の取得に失敗しました");
      }

      const data = await response.json();
      setOshiList(data.oshiList || []);
    } catch (error) {
      console.error("Error fetching oshi list:", error);
      toast.error("推し一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時に推し一覧を取得
  useEffect(() => {
    fetchOshiList();
  }, []);

  const handleRegister = async () => {
    try {
      setIsCreating(true);

      // バリデーション実行
      const validatedData = oshiNameSchema.parse({ name: newOshiName });

      // 推し登録APIを呼び出し
      const response = await fetch("/api/oshi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "推しの登録に失敗しました");
      }

      // 成功時の処理
      setNewOshiName("");
      setError("");
      setIsDialogOpen(false);

      // 推し一覧を再取得
      await fetchOshiList();

      // 新しく作成された推しを選択
      onValueChange(data.oshiId);

      toast.success("推しを登録しました", {
        icon: <SuccessCircle />,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          error.errors[0]?.message || "入力内容を確認してください";
        setError(errorMessage);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("推しの登録に失敗しました");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // ダイアログが閉じられた時に状態をリセット
      setNewOshiName("");
      setError("");
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select
          onValueChange={(value) =>
            onValueChange(value === "none" ? null : value)
          }
          value={value || "none"}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={isLoading ? "読み込み中..." : placeholder}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">未選択</SelectItem>
            {oshiList.map((oshi) => (
              <SelectItem key={oshi.id} value={oshi.id}>
                {oshi.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="shrink-0 font-normal py-0">
            <CirclePlus className="h-5 w-5" />
            <span className="">新規登録</span>
          </Button>
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>推しを新規登録</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="oshiName">名前</Label>
              <Input
                id="oshiName"
                placeholder="推しの名前を入力"
                value={newOshiName}
                onChange={(e) => {
                  setNewOshiName(e.target.value);
                  // 入力時にエラーをクリア
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRegister();
                  }
                }}
                maxLength={50}
                disabled={isCreating}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex gap-6">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => handleDialogOpenChange(false)}
                disabled={isCreating}
              >
                キャンセル
              </Button>
              <Button
                className="w-1/2"
                onClick={handleRegister}
                disabled={isCreating}
              >
                {isCreating ? "登録中..." : "登録"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
