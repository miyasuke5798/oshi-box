"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { AlertCircle } from "lucide-react";

interface DeleteOshiDialogProps {
  oshiId: string;
  oshiName: string;
  onDelete: () => void;
}

export function DeleteOshiDialog({
  oshiId,
  oshiName,
  onDelete,
}: DeleteOshiDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/oshi/${oshiId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "推しの削除に失敗しました");
      }

      toast.success("推しを削除しました", { icon: <SuccessCircle /> });
      setIsOpen(false);
      onDelete(); // 親コンポーネントの一覧更新を呼び出し
    } catch (error) {
      console.error("Error deleting oshi:", error);
      toast.error("推しの削除に失敗しました", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-center text-sm rounded-full border border-red-300 text-red-400 hover:bg-red-50 px-2 py-0.5 cursor-pointer">
          削除
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>推しの削除</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">「{oshiName}」を削除してもよろしいですか？</p>
          <p className="text-sm text-gray-500">
            この推しに関連する投稿がある場合は削除できません。
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "削除中..." : "削除"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
