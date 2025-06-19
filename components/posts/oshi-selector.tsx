"use client";

import { useState } from "react";
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

  const handleRegister = () => {
    try {
      // バリデーション実行
      const validatedData = oshiNameSchema.parse({ name: newOshiName });

      // TODO: 実際の推し登録APIを呼び出す
      console.log("Registering new oshi:", validatedData.name);

      // 成功時の処理
      setNewOshiName("");
      setError("");
      setIsDialogOpen(false);
      toast.success("推しを登録しました", {
        icon: <SuccessCircle />,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          error.errors[0]?.message || "入力内容を確認してください";
        setError(errorMessage);
      }
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
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">未選択</SelectItem>
            <SelectItem value="oshi1">推し１</SelectItem>
            <SelectItem value="oshi2">推し２</SelectItem>
            <SelectItem value="oshi3">推し３</SelectItem>
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
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex gap-6">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => handleDialogOpenChange(false)}
              >
                キャンセル
              </Button>
              <Button className="w-1/2" onClick={handleRegister}>
                登録
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
