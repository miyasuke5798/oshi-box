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
import { SuccessCircle } from "@/components/svg/success_circle";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { z } from "zod";

// 推し名のバリデーションスキーマ
const oshiNameSchema = z.object({
  name: z
    .string()
    .min(1, "推しの名前を入力してください")
    .max(50, "推しの名前は50文字以内で入力してください")
    .trim(),
});

interface OshiFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
  title: string;
  submitText: string;
  isLoading?: boolean;
}

export function OshiFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  title,
  submitText,
  isLoading = false,
}: OshiFormDialogProps) {
  const [name, setName] = useState(initialName);

  // Dialogが開かれたときに初期値を設定
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    let validatedName: string;
    try {
      // バリデーション実行
      const validatedData = oshiNameSchema.parse({ name });
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

    try {
      await onSubmit(validatedName);
      onClose();
    } catch (error) {
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
            <Input
              type="text"
              placeholder="推しの名前を入力"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={50}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="gray" onClick={onClose} disabled={isLoading}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
              {submitText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
