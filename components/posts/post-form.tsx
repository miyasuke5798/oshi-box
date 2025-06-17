"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { CirclePlus, X, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const postSchema = z.object({
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
  categories: z.array(z.string()),
  oshi: z.string().nullable(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: {
    title: string;
    content: string;
    visibility: "public" | "followers" | "private";
    categories: string[];
    oshiId: string | null;
    images: string[];
  }) => Promise<void>;
  submitLabel: string;
}

export function PostForm({
  initialData,
  onSubmit,
  submitLabel,
}: PostFormProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    initialData?.images || []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      visibility: initialData?.visibility || "public",
      images: [],
      categories: initialData?.categories || [],
      oshi: initialData?.oshiId || null,
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

      const currentImages = watch("images") || [];

      if (currentImages.length + files.length > 4) {
        toast.error("画像は最大4枚までアップロードできます", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        return;
      }

      setValue("images", [...currentImages, ...files]);

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

  const handleFormSubmit = async (data: PostFormData) => {
    try {
      const imageFiles = data.images as File[];
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

      await onSubmit({
        title: data.title,
        content: data.content,
        visibility: data.visibility,
        categories: data.categories,
        oshiId: data.oshi,
        images: base64Images,
      });
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("投稿の保存に失敗しました", {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="投稿のタイトルを入力"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">本文</Label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="投稿の内容を入力"
          rows={10}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>画像</Label>
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
        <Label>カテゴリー</Label>
        {isLoading ? (
          <p className="text-sm text-gray-500">カテゴリーを読み込み中...</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
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
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>推し選択</Label>
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
              <Button variant="outline" className="shrink-0 font-normal py-0">
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
        <Label>公開範囲</Label>
        <RadioGroup
          defaultValue={initialData?.visibility || "public"}
          onValueChange={(value) =>
            setValue("visibility", value as "public" | "followers" | "private")
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
      <Button type="submit" disabled={isSubmitting} className="w-1/2">
        {isSubmitting ? "送信中..." : submitLabel}
      </Button>
      </div>
    </form>
  );
}
