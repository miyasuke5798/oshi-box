"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserIcon } from "@/components/svg/UserIcon";
import { X, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SuccessCircle } from "@/components/svg/success_circle";
import { Textarea } from "@/components/ui/textarea";
import { UserData } from "@/types/user";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "入力してください")
    .max(50, "50文字以内で入力してください"),
  image: z.any().optional(),
  bio: z.string().max(500, "500文字以内で入力してください").optional(),
  oshiName: z.string().max(50, "50文字以内で入力してください").optional(),
  snsLink: z
    .string()
    .max(100, "100文字以内で入力してください")
    .refine((val) => val === "" || /^https?:\/\/.+/.test(val), {
      message: "有効なURLを入力してください",
    })
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SettingsProfileClientProps {
  userData: UserData;
}

export function SettingsProfileClient({
  userData,
}: SettingsProfileClientProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    userData.photoURL || null
  );
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData.displayName || "",
      bio: userData.bio || "",
      oshiName: userData.oshiName || "",
      snsLink: userData.snsLink || "",
      image: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setValue("image", null);
    setPreviewUrl(null);
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // プロフィール画像のアップロード
      if (data.image) {
        const formData = new FormData();
        formData.append("file", data.image);

        const imageResponse = await fetch(`/api/users/${userData.uid}/avatar`, {
          method: "POST",
          body: formData,
        });

        if (!imageResponse.ok) {
          throw new Error("プロフィール画像のアップロードに失敗しました");
        }
      }

      // プロフィール情報の更新
      const response = await fetch(`/api/users/${userData.uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          bio: data.bio,
          oshiName: data.oshiName,
          snsLink: data.snsLink,
        }),
      });

      if (!response.ok) {
        throw new Error("プロフィールの更新に失敗しました");
      }

      toast.success("プロフィールを保存しました", { icon: <SuccessCircle /> });
    } catch (error) {
      toast.error("エラーが発生しました。もう一度お試しください。", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
      console.error("Error:", error);
    }
  };

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <h1 className="text-base font-bold mb-4">プロフィール</h1>
          <p className="text-sm text-[#71717a] mb-6">
            <Link href={`/${userData.uid}`} className="rose_link">
              マイページ
            </Link>
            などで公開される情報です。
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-2">
              <p className="text-sm mb-1">プロフィール画像</p>
              <div className="flex flex-col space-y-4">
                <div className="relative w-24 h-24">
                  {previewUrl ? (
                    <>
                      <Image
                        src={previewUrl}
                        alt="Profile preview"
                        fill
                        className="object-cover rounded-full"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-black text-white rounded-full p-1 hover:bg-gray-800 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <UserIcon className="w-24 h-24 border border-gray-300 rounded-full" />
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full sm:w-fit cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                名前
              </label>
              <Input id="name" type="text" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                自己紹介
              </label>
              <Textarea
                id="bio"
                {...register("bio")}
                className="min-h-[100px]"
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="oshiName" className="text-sm font-medium">
                推し
              </label>
              <Input id="oshiName" type="text" {...register("oshiName")} />
              {errors.oshiName && (
                <p className="text-sm text-red-500">
                  {errors.oshiName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="snsLink" className="text-sm font-medium">
                SNSリンク
              </label>
              <Input id="snsLink" type="url" {...register("snsLink")} />
              {errors.snsLink && (
                <p className="text-sm text-red-500">{errors.snsLink.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
