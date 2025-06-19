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
  postUserId: string;
}

export function DeletePostDialog({
  postId,
  postTitle,
  postUserId,
}: DeletePostDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    console.log("delete post", postId);
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
      router.push(`/${postUserId}`); // ユーザーページにリダイレクト
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("投稿の削除に失敗しました", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-1/2 text-center rounded-full border border-red-300 text-red-400 hover:bg-red-50 px-3 py-1.5 cursor-pointer">
          削除
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>投稿の削除</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">「{postTitle}」を削除してもよろしいですか？</p>
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
