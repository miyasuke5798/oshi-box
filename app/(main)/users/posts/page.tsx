"use client";
import { useState } from "react";
import Image from "next/image";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SuccessCircle } from "@/components/svg/success_circle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const usersPostSchema = z.object({
  title: z
    .string()
    .min(1, "入力してください")
    .max(100, "100文字以内で入力してください"),
  content: z.string().max(1000, "1000文字以内で入力してください"),
  images: z.any().optional(),
  visibility: z.enum(["public", "followers", "private"]),
});

type usersPostFormData = z.infer<typeof usersPostSchema>;

export default function UsersPostsPage() {
  const [error, setError] = useState<string>("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<usersPostFormData>({
    resolver: zodResolver(usersPostSchema),
    defaultValues: {
      visibility: "public",
      images: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setValue("images", files);

      // プレビューURLの生成
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    const currentImages = (watch("images") as File[]) || [];
    setValue(
      "images",
      currentImages.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: usersPostFormData) => {
    try {
      setError("");
      toast.success("投稿しました", { icon: <SuccessCircle /> });
      console.log("Post data:", data);
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-xl font-bold mb-6">投稿する</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                タイトル
              </label>
              <Input id="title" type="text" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                本文
              </label>
              <Textarea
                id="content"
                {...register("content")}
                className="min-h-[200px]"
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">画像</label>
              <div className="flex flex-col space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-800 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">公開範囲</label>
              <RadioGroup
                defaultValue="public"
                onValueChange={(value) =>
                  setValue(
                    "visibility",
                    value as "public" | "followers" | "private"
                  )
                }
                className="flex flex-row space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">全体公開</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followers" id="followers" />
                  <Label htmlFor="followers">フォロワー限定</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">非公開</Label>
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : "作成"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
