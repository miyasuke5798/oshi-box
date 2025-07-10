"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { z } from "zod";

// 推しのバリデーションスキーマ
const oshiSchema = z.object({
  name: z
    .string()
    .min(1, "推しの名前を入力してください")
    .max(50, "推しの名前は50文字以内で入力してください")
    .trim(),
  oshiStartedAt: z.string().min(1, "推しを始めた日を選択してください"),
});

interface OshiFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, oshiStartedAt: string) => Promise<void>;
  initialName?: string;
  initialOshiStartedAt?: string;
  title: string;
  submitText: string;
  isLoading?: boolean;
}

export function OshiFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  initialOshiStartedAt = "",
  title,
  submitText,
  isLoading = false,
}: OshiFormDialogProps) {
  const [name, setName] = useState(initialName);
  const [oshiStartedAt, setOshiStartedAt] = useState(initialOshiStartedAt);

  // Dialogが開かれたときに初期値を設定
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setOshiStartedAt(initialOshiStartedAt);
    }
  }, [isOpen, initialName, initialOshiStartedAt]);

  const handleSubmit = async () => {
    if (!name.trim() || !oshiStartedAt) return;

    let validatedData: { name: string; oshiStartedAt: string };
    try {
      // バリデーション実行
      validatedData = oshiSchema.parse({ name, oshiStartedAt });
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

    try {
      await onSubmit(validatedData.name, validatedData.oshiStartedAt);
      onClose();
    } catch {
      // エラーはonSubmit側で処理されるため、ここでは何もしない
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">推しの名前</label>
            <Input
              type="text"
              placeholder="推しの名前を入力"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={50}
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">推しを始めた日</label>
            <Input
              type="date"
              value={oshiStartedAt}
              onChange={(e) => setOshiStartedAt(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="gray" onClick={onClose} disabled={isLoading}>
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !name.trim() || !oshiStartedAt}
            >
              {isLoading ? `${submitText}中...` : submitText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
