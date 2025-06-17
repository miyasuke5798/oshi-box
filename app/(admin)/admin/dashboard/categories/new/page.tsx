"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { SuccessCircle } from "@/components/svg/success_circle";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "カテゴリー名を入力してください")
    .max(50, "50文字以内で入力してください"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setError("");
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("カテゴリーの作成に失敗しました");
      }

      toast.success("カテゴリーを作成しました", { icon: <SuccessCircle /> });
      router.push("/admin/dashboard/categories");
      router.refresh();
    } catch (error) {
      console.error("Error creating category:", error);
      setError("カテゴリーの作成に失敗しました");
    }
  };

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">カテゴリー作成</h1>
      </div>

      <Card>
        <CardContent className="py-5 px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">カテゴリー名</Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                placeholder="カテゴリー名を入力"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}

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
