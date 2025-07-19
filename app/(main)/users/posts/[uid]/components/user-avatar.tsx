"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { UserIcon } from "lucide-react";
import { addCacheBuster } from "@/lib/utils";

interface UserAvatarProps {
  photoURL: string | null;
  displayName: string | null;
  uid: string;
}

export function UserAvatar({ photoURL, displayName }: UserAvatarProps) {
  // エラー状態を管理
  const [imageError, setImageError] = useState(false);
  // ハイドレーション完了状態を管理
  const [isHydrated, setIsHydrated] = useState(false);
  // キャッシュバスティング済みの画像URLを管理
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);

  // ハイドレーション完了後にキャッシュバスティングを有効化
  useEffect(() => {
    setIsHydrated(true);

    if (photoURL) {
      setCachedImageUrl(addCacheBuster(photoURL));
    }
  }, [photoURL]);

  // 画像エラーハンドラー
  const handleImageError = () => {
    setImageError(true);
  };

  // 画像URLを取得（ハイドレーション完了後はキャッシュバスティング済みURLを使用）
  const getImageUrl = () => {
    if (!isHydrated || !photoURL) return photoURL;
    return cachedImageUrl || photoURL;
  };

  if (!photoURL || imageError) {
    return <UserIcon className="w-full h-full text-gray-400" />;
  }

  return (
    <Image
      src={getImageUrl() || ""}
      alt={displayName || "ユーザー"}
      fill
      className="object-cover border-[0.5px] border-gray-300 rounded-full"
      onError={handleImageError}
    />
  );
}
