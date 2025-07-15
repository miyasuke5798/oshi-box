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

interface DeletePostDialogProps {
  postId: string;
  postTitle: string;
}

export function DeletePostDialog({ postId, postTitle }: DeletePostDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "投稿の削除に失敗しました");
      }

      toast.success("投稿を削除しました", { icon: <SuccessCircle /> });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "投稿の削除に失敗しました";
      toast.error(errorMessage, {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-red-400 hover:text-red-500 underline cursor-pointer font-normal md:ml-4 ml-0">
          削除
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>投稿の削除</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm leading-relaxed">
            「{postTitle}」を削除してもよろしいですか？
            <br />
            この操作は取り消せません。
            <br />
            関連する画像も削除されます。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "削除中..." : "削除"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
