"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselIndicators,
} from "@/components/ui/carousel";
import { addCacheBuster } from "@/lib/utils";

interface PostImagesProps {
  images: string[];
  title: string;
}

export function PostImages({ images, title }: PostImagesProps) {
  // エラー状態を管理
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  // ハイドレーション完了状態を管理
  const [isHydrated, setIsHydrated] = useState(false);
  // キャッシュバスティング済みの画像URLを管理
  const [cachedImageUrls, setCachedImageUrls] = useState<Map<string, string>>(
    new Map()
  );

  // ハイドレーション完了後にキャッシュバスティングを有効化
  useEffect(() => {
    setIsHydrated(true);

    // 全ての画像URLにキャッシュバスティングを適用
    const newCachedUrls = new Map<string, string>();

    images.forEach((imageUrl) => {
      if (imageUrl && !newCachedUrls.has(imageUrl)) {
        newCachedUrls.set(imageUrl, addCacheBuster(imageUrl));
      }
    });

    setCachedImageUrls(newCachedUrls);
  }, [images]);

  // 画像エラーハンドラー
  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => new Set(prev).add(imageUrl));
  };

  // 画像URLを取得（ハイドレーション完了後はキャッシュバスティング済みURLを使用）
  const getImageUrl = (url: string) => {
    if (!isHydrated || !url) return url;
    return cachedImageUrls.get(url) || url;
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="w-full">
                {!imageErrors.has(image) ? (
                  <Image
                    src={getImageUrl(image)}
                    alt={`${title} - 画像 ${index + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg object-cover"
                    onError={() => handleImageError(image)}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && <CarouselIndicators count={images.length} />}
      </Carousel>
    </div>
  );
}
