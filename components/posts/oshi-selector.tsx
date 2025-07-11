"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SuccessCircle } from "@/components/svg/success_circle";
import { CirclePlus } from "lucide-react";
import { toast } from "sonner";
import { Oshi } from "@/types/oshi";
import { OshiFormDialog } from "@/components/oshi/oshi-form-dialog";

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

  const handleCreateOshi = async (
    name: string,
    oshiStartedAt: string,
    imageFile?: File
  ) => {
    try {
      setIsCreating(true);

      // 推し登録APIを呼び出し
      const response = await fetch("/api/oshi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, oshiStartedAt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "推しの登録に失敗しました");
      }

      // 画像がある場合はアップロード
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const imageResponse = await fetch(`/api/oshi/${data.oshiId}/image`, {
          method: "POST",
          body: formData,
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          toast.warning(
            errorData.error ||
              "推しは登録されましたが、画像のアップロードに失敗しました"
          );
        }
      }

      // 推し一覧を再取得
      await fetchOshiList();

      // 新しく作成された推しを選択
      onValueChange(data.oshiId);

      toast.success("推しを登録しました", { icon: <SuccessCircle /> });
    } catch (error) {
      console.error("Error creating oshi:", error);
      toast.error("推しの登録に失敗しました");
      throw error;
    } finally {
      setIsCreating(false);
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
      <Button
        type="button"
        variant="outline"
        className="shrink-0 font-normal py-0"
        onClick={() => setIsDialogOpen(true)}
      >
        <CirclePlus className="h-5 w-5" />
        <span className="">新規登録</span>
      </Button>

      {/* 推し作成Dialog */}
      <OshiFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateOshi}
        initialOshiStartedAt={new Date().toISOString().split("T")[0]} // 今日の日付をデフォルト
        title="推しを新規登録"
        submitText="登録"
        isLoading={isCreating}
      />
    </div>
  );
}
