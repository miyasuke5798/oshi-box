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
import { Checkbox } from "@/components/ui/checkbox";
import { SuccessCircle } from "@/components/svg/success_circle";
import { X, AlertCircle, CirclePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = [
  { id: "live", label: "ライブ" },
  { id: "goods", label: "グッズ" },
  { id: "oshi", label: "推し語り" },
  { id: "vtuber", label: "Vtuber" },
  { id: "game", label: "ゲーム" },
  { id: "idol", label: "アイドル" },
  { id: "illust", label: "イラスト" },
  { id: "cosplay", label: "コスプレ" },
] as const;

const usersPostSchema = z.object({
  title: z
    .string()
    .min(1, "入力してください")
    .max(100, "100文字以内で入力してください"),
  content: z.string().max(1000, "1000文字以内で入力してください"),
  visibility: z.enum(["public", "followers", "private"]),
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
  categories: z.array(
    z.enum([
      "live",
      "goods",
      "oshi",
      "vtuber",
      "game",
      "idol",
      "illust",
      "cosplay",
    ])
  ),
  oshi: z.string().nullable(),
});

type usersPostFormData = z.infer<typeof usersPostSchema>;

export default function UsersPostsPage() {
  const [error, setError] = useState<string>("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // ファイル形式のチェック
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
                            currentCategories.filter((id) => id !== category.id)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">推し選択</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    onValueChange={(value) =>
                      setValue("oshi", value === "none" ? null : value)
                    }
                    value={watch("oshi") || "none"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="推しを選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未選択</SelectItem>
                      <SelectItem value="oshi1">推し１</SelectItem>
                      <SelectItem value="oshi2">推し２</SelectItem>
                      <SelectItem value="oshi3">推し３</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="shrink-0 font-normal py-0"
                    >
                      <CirclePlus className="h-5 w-5" />
                      <span className="">新規登録</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>推しを新規登録</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="oshiName">名前</Label>
                        <Input id="oshiName" placeholder="推しの名前を入力" />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        登録
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                className="flex flex-row flex-wrap space-x-2"
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
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "作成中..." : "作成"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
