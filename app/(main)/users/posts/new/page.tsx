"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SuccessCircle } from "@/components/svg/success_circle";
import { X, AlertCircle, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Category } from "@/types/category";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { OshiSelector } from "@/components/posts/oshi-selector";

const usersPostSchema = z.object({
  title: z
    .string()
    .min(1, "入力してください")
    .max(100, "100文字以内で入力してください"),
  content: z.string().max(1000, "1000文字以内で入力してください"),
  visibility: z.enum(["public", "private"]),
  images: z
    .any()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return files.length <= 4;
      },
      { message: "画像は最大4枚までアップロードできます" }
    )
    .optional(),
  categories: z.array(z.string()),
  oshi: z.string().nullable(),
});

type usersPostFormData = z.infer<typeof usersPostSchema>;

export default function UsersPostsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string>("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      categories: [],
      oshi: null,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("カテゴリーの取得に失敗しました");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("カテゴリーの取得に失敗しました", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // TODO: プロフィール画像とファイル形式のチェックを共通化する
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      const invalidFiles = files.filter(
        (file) => !allowedTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        toast.error("JPEG / JPG / PNG / WebP形式のみアップロード可能です", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        return;
      }

      // 既存の画像データを取得
      const currentImages = watch("images") || [];

      // 合計枚数のチェック
      if (currentImages.length + files.length > 4) {
        toast.error("画像は最大4枚までアップロードできます", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        return;
      }

      // 新しい画像を追加
      setValue("images", [...currentImages, ...files]);

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
      if (!user) {
        toast.error("ログインが必要です", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        return;
      }

      setError("");
      const formData = {
        ...data,
        oshiId: data.oshi,
      };

      // 画像をBase64に変換
      const imageFiles = formData.images as File[];
      const base64Images: string[] = [];

      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = (e) => {
              if (e.target?.result) {
                resolve(e.target.result as string);
              }
            };
          });
          reader.readAsDataURL(file);
          base64Images.push(await base64Promise);
        }
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: base64Images,
        }),
      });

      if (!response.ok) {
        throw new Error("投稿の作成に失敗しました");
      }

      toast.success("投稿しました", { icon: <SuccessCircle /> });
      router.push(`/${user.uid}`);
    } catch (error) {
      console.error("Error creating post:", error);
      setError("エラーが発生しました。もう一度お試しください。");
      toast.error("投稿の作成に失敗しました", {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-xl font-bold mb-6">投稿する</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                タイトル
              </label>
              <Input
                id="title"
                type="text"
                {...register("title")}
                placeholder="例：初めての現地ライブで涙が止まらなかった話"
              />
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
                className="min-h-[110px]"
                placeholder="例：推しの○○のライブに行ってきました！生で見た瞬間に涙腺崩壊…。衣装や表情、ファンサも最高すぎて、一生の思い出です！"
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
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="w-auto sm:w-fit cursor-pointer"
                />
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
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
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリー</label>
              {isLoading ? (
                <p className="text-sm text-gray-500">
                  カテゴリーを読み込み中...
                </p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={category.id}
                        checked={watch("categories")?.includes(category.id)}
                        onCheckedChange={(checked) => {
                          const currentCategories = watch("categories") || [];
                          if (checked) {
                            setValue("categories", [
                              ...currentCategories,
                              category.id,
                            ]);
                          } else {
                            setValue(
                              "categories",
                              currentCategories.filter(
                                (id) => id !== category.id
                              )
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={category.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">推し選択</label>
              <OshiSelector
                value={watch("oshi") || null}
                onValueChange={(oshi) => setValue("oshi", oshi)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">公開範囲</label>
              <RadioGroup
                defaultValue="public"
                onValueChange={(value) =>
                  setValue("visibility", value as "public" | "private")
                }
                className="flex flex-row flex-wrap space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">全体公開</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">非公開</Label>
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-between gap-6">
              <Button
                type="button"
                variant="gray"
                onClick={() => router.back()}
                className="w-1/2"
              >
                <ChevronLeft className="h-5 w-5" />
                <p className="text-sm font-normal -ml-1">戻る</p>
              </Button>
              <Button type="submit" className="w-1/2" disabled={isSubmitting}>
                {isSubmitting ? "作成中..." : "作成"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
