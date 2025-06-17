"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
}: DeleteCategoryDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("カテゴリーの削除に失敗しました");
      }

      toast.success("カテゴリーを削除しました", { icon: <SuccessCircle /> });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("カテゴリーの削除に失敗しました", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-red-400 hover:text-red-500 underline cursor-pointer font-normal ml-4">
          削除
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カテゴリーの削除</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="">
            「{categoryName}」を削除してもよろしいですか？
            <br />
            この操作は取り消せません。
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
