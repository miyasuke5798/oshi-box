"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileInput } from "@/components/ui/file-input";
import { Post } from "@/types/post";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/types/category";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { OshiSelector } from "./oshi-selector";
import { useAuth } from "@/lib/hooks/useAuth";

const postSchema = z.object({
  title: z
    .string()
    .min(1, "入力してください")
    .max(100, "100文字以内で入力してください"),
  content: z
    .string()
    .min(1, "入力してください")
    .max(1000, "1000文字以内で入力してください"),
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
  oshi: z.string().min(1, "推しを選択してください"),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: {
    title: string;
    content: string;
    visibility: "public" | "private";
    categories: string[];
    oshiId: string | null;
    images: string[];
    deletedImages?: string[];
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const deletedImagesRef = useRef<string[]>([]);
  const router = useRouter();
  const { user } = useAuth();
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
      oshi: initialData?.oshiId || "",
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

  // 初期データの画像URLをプレビューURLに設定
  useEffect(() => {
    if (initialData?.images) {
      // 編集時は既存の画像パスを署名付きURLに変換してプレビュー表示
      const convertToSignedUrls = async () => {
        try {
          const signedUrls = await Promise.all(
            initialData.images.map(async (imagePath) => {
              if (!imagePath || typeof imagePath !== "string") {
                console.warn("Invalid imagePath:", imagePath);
                return "";
              }

              if (imagePath.startsWith("http")) {
                // 既に署名付きURLの場合はそのまま使用
                try {
                  // URLの妥当性チェック
                  new URL(imagePath);
                  return imagePath;
                } catch (error) {
                  console.error("Invalid URL:", imagePath, error);
                  return "";
                }
              } else {
                // ファイルパスの場合は署名付きURLを生成
                try {
                  const response = await fetch(
                    `/api/images/signed-url?path=${encodeURIComponent(
                      imagePath
                    )}`
                  );
                  if (response.ok) {
                    const data = await response.json();
                    return data.url;
                  }
                  console.warn("Failed to get signed URL for:", imagePath);
                  return "";
                } catch (error) {
                  console.error(
                    "Error getting signed URL for:",
                    imagePath,
                    error
                  );
                  return "";
                }
              }
            })
          );

          // 空のURLを除外してプレビューURLを設定
          const validUrls = signedUrls.filter((url) => url !== "");
          setPreviewUrls(validUrls);
        } catch (error) {
          console.error("Error converting to signed URLs:", error);
          // エラーの場合は空の配列を設定
          setPreviewUrls([]);
        }
      };

      convertToSignedUrls();
      // フォームの値には元のパスを保持
      setValue("images", initialData.images);
      // 削除された画像の状態をリセット
      setDeletedImages([]);
      deletedImagesRef.current = [];
      console.log("Reset deletedImages state for new initial data");
    }
  }, [initialData, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      //console.log("handleImageChange - selected files:", files);

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
      const existingImages = initialData?.images || [];

      console.log("handleImageChange - current images:", currentImages);
      console.log("handleImageChange - existing images:", existingImages);

      if (currentImages.length + files.length > 4) {
        toast.error("画像は最大4枚までアップロードできます", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
        return;
      }

      // 現在のフォームの値に新しい画像ファイルを追加
      const updatedImages = [...currentImages, ...files];
      console.log("handleImageChange - updated images:", updatedImages);
      setValue("images", updatedImages);

      // プレビューURLを更新（既存の画像URL + 新しい画像のプレビュー）
      const newPreviewUrls = files
        .map((file) => {
          try {
            // ファイルの妥当性チェック
            if (!file || !(file instanceof File)) {
              console.warn("Invalid file:", file);
              return "";
            }
            return URL.createObjectURL(file);
          } catch (error) {
            console.error("Error creating object URL for file:", error, file);
            return "";
          }
        })
        .filter((url) => url !== ""); // 空のURLを除外

      console.log("handleImageChange - new preview URLs:", newPreviewUrls);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = watch("images") || [];
    const existingImages = initialData?.images || [];

    console.log("removeImage called with index:", index);
    console.log("Current images:", currentImages);
    console.log("Existing images:", existingImages);

    // プレビューURLを削除
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    if (index < existingImages.length) {
      // 既存の画像URLを削除
      // 現在のフォームの値から削除された画像を除外
      const updatedImages = currentImages.filter(
        (_: string, i: number) => i !== index
      );

      console.log("Updated images (from current form value):", updatedImages);
      setValue("images", updatedImages);

      // 削除された画像のパスを記録
      const deletedImagePath = existingImages[index];
      if (deletedImagePath) {
        setDeletedImages((prev) => {
          const newDeletedImages = [...prev, deletedImagePath];
          console.log("Updated deletedImages:", newDeletedImages);
          return newDeletedImages;
        });
        deletedImagesRef.current = [
          ...deletedImagesRef.current,
          deletedImagePath,
        ];
        console.log("Deleted image path:", deletedImagePath);
        console.log("Updated deletedImagesRef:", deletedImagesRef.current);
      }
    } else {
      // 新しい画像ファイルを削除
      const newImageIndex = index - existingImages.length;
      const currentNewImages = currentImages.slice(existingImages.length);
      const updatedNewImages = currentNewImages.filter(
        (_: File | string, i: number) => i !== newImageIndex
      );
      setValue("images", [...existingImages, ...updatedNewImages]);
    }

    // フォームの値が正しく更新されたか確認
    setTimeout(() => {
      const updatedImages = watch("images");
      console.log("Form images after removal:", updatedImages);
    }, 0);
  };

  const handleFormSubmit = async (data: PostFormData) => {
    try {
      const currentDeletedImages = deletedImagesRef.current;
      const currentFormImages = watch("images");

      console.log("Form submission - deletedImages (state):", deletedImages);
      console.log(
        "Form submission - deletedImages (ref):",
        currentDeletedImages
      );
      console.log("Form submission - data.images:", data.images);
      console.log(
        "Form submission - currentFormImages (watch):",
        currentFormImages
      );

      // watch("images")を使用してフォームの最新の値を取得
      const imageFiles = currentFormImages as (File | string)[];
      const base64Images: string[] = [];
      const existingImages: string[] = [];

      console.log("Form submission - processing imageFiles:", imageFiles);

      // 既存の画像URLと新しい画像ファイルを区別
      if (imageFiles && imageFiles.length > 0) {
        for (const item of imageFiles) {
          console.log("Form submission - processing item:", item, typeof item);
          if (typeof item === "string") {
            // 既存の画像URLの場合
            existingImages.push(item);
            console.log("Form submission - added existing image:", item);
          } else if (item instanceof File) {
            // 新しい画像ファイルの場合、Base64に変換
            console.log(
              "Form submission - converting file to base64:",
              item.name
            );
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
              reader.onload = (e) => {
                if (e.target?.result) {
                  resolve(e.target.result as string);
                }
              };
            });
            reader.readAsDataURL(item);
            const base64Result = await base64Promise;
            base64Images.push(base64Result);
            console.log("Form submission - added base64 image:", item.name);
          }
        }
      }

      // 既存の画像URLと新しいBase64画像を結合
      const allImages = [...existingImages, ...base64Images];

      console.log("Form submission - existing images:", existingImages);
      console.log(
        "Form submission - base64 images count:",
        base64Images.length
      );
      console.log("Final images to save:", allImages);
      console.log("Images to delete (ref):", currentDeletedImages);

      await onSubmit({
        title: data.title,
        content: data.content,
        visibility: data.visibility,
        categories: data.categories,
        oshiId: data.oshi,
        images: allImages,
        deletedImages: currentDeletedImages,
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
        <Label>推し選択</Label>
        <p className="text-xs text-gray-500 mt-0.5">
          ※推しは最大5人まで登録できます
        </p>
        <OshiSelector
          value={watch("oshi") || ""}
          onValueChange={(oshi) => setValue("oshi", oshi || "")}
        />
        {errors.oshi && (
          <p className="text-sm text-red-500">{errors.oshi.message}</p>
        )}
      </div>
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
          <FileInput
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="w-auto sm:w-fit cursor-pointer"
          />
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
              {previewUrls.map((url, index) => (
                <div key={url} className="relative aspect-square">
                  {url &&
                  (url.startsWith("http") || url.startsWith("blob:")) ? (
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      onError={() => {
                        console.error("Image load error:", url);
                        // エラー時にプレビューを削除
                        removeImage(index);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        画像読み込みエラー
                      </span>
                    </div>
                  )}
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
        <Label>公開範囲</Label>
        <RadioGroup
          defaultValue={initialData?.visibility || "public"}
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
      <div className="flex justify-between gap-6">
        <Button
          type="button"
          variant="gray"
          onClick={() => router.push(`/${user?.uid}`)}
          className="w-1/2"
        >
          <ChevronLeft className="h-5 w-5" />
          <p className="text-sm font-normal -ml-1">キャンセル</p>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-1/2">
          {isSubmitting ? "送信中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
