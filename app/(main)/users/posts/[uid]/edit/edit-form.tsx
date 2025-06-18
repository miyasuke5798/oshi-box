"use client";

import { PostForm } from "@/components/posts/post-form";
import { Post } from "@/types/post";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";

interface EditPostFormProps {
  post: Post;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    visibility: "public" | "private";
    categories: string[];
    oshiId: string | null;
    images: string[];
  }) => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      router.push(`/users/posts/${post.id}`);
      toast.success("更新しました", { icon: <SuccessCircle /> });
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  };

  return (
    <PostForm
      initialData={post}
      submitLabel="更新する"
      onSubmit={handleSubmit}
    />
  );
}
