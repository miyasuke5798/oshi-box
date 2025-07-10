"use client";
import { useState, useEffect } from "react";
import { ShareMenu } from "@/components/layout/share_menu";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SuccessCircle } from "@/components/svg/success_circle";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";
import { Oshi } from "@/types/oshi";
import { DeleteOshiDialog } from "./delete-oshi-dialog";
import { OshiFormDialog } from "@/components/oshi/oshi-form-dialog";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function SettingsOshiPage() {
  const [oshis, setOshis] = useState<Oshi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Dialogの状態管理
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOshi, setEditingOshi] = useState<Oshi | null>(null);

  // 推し一覧を取得
  useEffect(() => {
    fetchOshis();
  }, []);

  const fetchOshis = async () => {
    try {
      const response = await fetch("/api/oshi");
      if (response.ok) {
        const data = await response.json();
        setOshis(data.oshiList || []);
      }
    } catch (error) {
      console.error("Error fetching oshis:", error);
    } finally {
      setLoading(false);
    }
  };

  // 推しを追加
  const handleAddOshi = async (
    name: string,
    oshiStartedAt: string,
    imageFile?: File
  ) => {
    setIsAdding(true);
    try {
      const response = await fetch("/api/oshi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, oshiStartedAt }),
      });

      if (response.ok) {
        const data = await response.json();

        // 画像がある場合はアップロード
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);

          const imageResponse = await fetch(`/api/oshi/${data.oshiId}/image`, {
            method: "POST",
            body: formData,
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            toast.warning(
              errorData.error ||
                "推しは作成されましたが、画像のアップロードに失敗しました"
            );
          }
        }

        await fetchOshis(); // 一覧を再取得
        toast.success("作成しました", { icon: <SuccessCircle /> });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "推しの追加に失敗しました", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        });
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("Error adding oshi:", error);
      toast.error("推しの追加に失敗しました");
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  // 編集を開始
  const startEditing = (oshi: Oshi) => {
    setEditingOshi(oshi);
    setIsEditDialogOpen(true);
  };

  // 推しを更新
  const handleUpdateOshi = async (
    name: string,
    oshiStartedAt: string,
    imageFile?: File,
    shouldDeleteImage?: boolean
  ) => {
    if (!editingOshi) return;

    setIsEditing(true);
    try {
      const response = await fetch(`/api/oshi/${editingOshi.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, oshiStartedAt }),
      });

      if (response.ok) {
        // 画像の削除が必要な場合
        if (shouldDeleteImage) {
          const deleteResponse = await fetch(
            `/api/oshi/${editingOshi.id}/image`,
            {
              method: "DELETE",
            }
          );

          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            toast.warning(
              errorData.error ||
                "推しは更新されましたが、画像の削除に失敗しました"
            );
          }
        }
        // 新しい画像がある場合はアップロード
        else if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);

          const imageResponse = await fetch(
            `/api/oshi/${editingOshi.id}/image`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            toast.warning(
              errorData.error ||
                "推しは更新されましたが、画像のアップロードに失敗しました"
            );
          }
        }

        await fetchOshis(); // 一覧を再取得
        setEditingOshi(null);
        toast.success("更新しました", { icon: <SuccessCircle /> });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "推しの更新に失敗しました", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        });
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("Error updating oshi:", error);
      toast.error("推しの更新に失敗しました");
      throw error;
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="mt-3 mb-16">
      <ShareMenu />
      <Card className="w-full mb-4">
        <CardContent className="py-5 px-6">
          <BackButton />
          {/* 推し追加フォーム */}
          <div className="flex justify-end mt-6 mb-10">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isAdding}
              size="sm"
              className="py-4.5"
            >
              <Plus className="w-4 h-4 mr-1" />
              推しの作成
            </Button>
          </div>

          {/* 推し一覧 */}
          <div>
            <h2 className="text-base font-bold mb-3">登録済みの推し</h2>
            {loading ? (
              <p className="text-sm text-gray-500">読み込み中...</p>
            ) : oshis.length > 0 ? (
              <div className="space-y-2">
                {oshis.map((oshi) => (
                  <div
                    key={oshi.id}
                    className="flex items-center justify-between py-3 border-b"
                  >
                    <p>{oshi.name}</p>
                    {oshi.oshiStartedAt && (
                      <p className="text-sm">
                        {(() => {
                          try {
                            // oshiStartedAtが文字列の場合
                            if (typeof oshi.oshiStartedAt === "string") {
                              return format(
                                new Date(oshi.oshiStartedAt),
                                "yyyy年MM月dd日",
                                { locale: ja }
                              );
                            }
                            // oshiStartedAtがTimestampオブジェクトの場合
                            if (
                              typeof oshi.oshiStartedAt === "object" &&
                              oshi.oshiStartedAt !== null &&
                              "_seconds" in oshi.oshiStartedAt &&
                              "_nanoseconds" in oshi.oshiStartedAt
                            ) {
                              const timestamp = oshi.oshiStartedAt as {
                                _seconds: number;
                                _nanoseconds: number;
                              };
                              return format(
                                new Date(
                                  timestamp._seconds * 1000 +
                                    timestamp._nanoseconds / 1000000
                                ),
                                "yyyy年MM月dd日",
                                { locale: ja }
                              );
                            }
                            return null;
                          } catch (error) {
                            console.error(
                              "Error formatting oshiStartedAt:",
                              error,
                              oshi.oshiStartedAt
                            );
                            return null;
                          }
                        })()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(oshi)}
                        className="text-center text-sm font-normal rounded-full border border-gray-300 bg-white hover:bg-gray-50 px-2 py-0.5 cursor-pointer shadow-none"
                      >
                        編集
                      </button>
                      <DeleteOshiDialog
                        oshiId={oshi.id}
                        oshiName={oshi.name}
                        onDelete={fetchOshis}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center my-10">推しが登録されていません。</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 作成Dialog */}
      <OshiFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleAddOshi}
        initialOshiStartedAt={new Date().toISOString().split("T")[0]} // 今日の日付をデフォルト
        title="推しの作成"
        submitText="作成"
        isLoading={isAdding}
      />

      {/* 編集Dialog */}
      <OshiFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingOshi(null);
        }}
        onSubmit={handleUpdateOshi}
        initialName={editingOshi?.name || ""}
        initialOshiStartedAt={(() => {
          if (!editingOshi?.oshiStartedAt) return "";
          try {
            if (typeof editingOshi.oshiStartedAt === "string") {
              const date = new Date(editingOshi.oshiStartedAt);
              return `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            }
            if (
              typeof editingOshi.oshiStartedAt === "object" &&
              editingOshi.oshiStartedAt !== null
            ) {
              const timestamp = editingOshi.oshiStartedAt as {
                _seconds: number;
                _nanoseconds: number;
              };
              const date = new Date(timestamp._seconds * 1000);
              return `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            }
            return "";
          } catch {
            return "";
          }
        })()}
        initialImageUrl={editingOshi?.imageUrl || ""}
        oshiId={editingOshi?.id}
        title="推しの編集"
        submitText="更新"
        isLoading={isEditing}
      />
    </div>
  );
}
