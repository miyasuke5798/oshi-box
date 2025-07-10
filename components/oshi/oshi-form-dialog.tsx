"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, X } from "lucide-react";
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
  onSubmit: (
    name: string,
    oshiStartedAt: string,
    imageFile?: File
  ) => Promise<void>;
  initialName?: string;
  initialOshiStartedAt?: string;
  initialImageUrl?: string;
  oshiId?: string; // 編集時に必要
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
  initialImageUrl = "",
  title,
  submitText,
  isLoading = false,
}: OshiFormDialogProps) {
  const [name, setName] = useState(initialName);
  const [oshiStartedAt, setOshiStartedAt] = useState(initialOshiStartedAt);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null
  );

  // Dialogが開かれたときに初期値を設定
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setOshiStartedAt(initialOshiStartedAt);
      setImageFile(null);
      setPreviewUrl(initialImageUrl || null);
    }
  }, [isOpen, initialName, initialOshiStartedAt, initialImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

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
      await onSubmit(
        validatedData.name,
        validatedData.oshiStartedAt,
        imageFile || undefined
      );
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
          <div>
            <label className="text-sm font-medium">推しの画像</label>
            <div className="flex flex-col space-y-4 mt-1">
              <div className="relative w-24 h-24">
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="推し画像プレビュー"
                      fill
                      className="border border-gray-300 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-800 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-24 h-24 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-xs">画像なし</span>
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full sm:w-fit cursor-pointer"
                disabled={isLoading}
              />
            </div>
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
