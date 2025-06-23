"use client";

import { XIcon } from "@/components/svg/x_icon";
import { useState } from "react";

interface XShareButtonProps {
  title: string;
  content: string;
  url?: string;
  imageUrl?: string;
  className?: string;
}

// Canvas経由で画像を取得する関数
async function loadImageViaCanvas(
  imageUrl: string,
  shareData: ShareData
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const files = [
                new File([blob], "image.jpg", { type: "image/jpeg" }),
              ];
              shareData.files = files;
              console.log("Successfully loaded image via canvas");
              resolve();
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          },
          "image/jpeg",
          0.8
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

export function XShareButton({
  title,
  content,
  url,
  imageUrl,
  className = "",
}: XShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  //console.log("imageUrl", imageUrl);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // URLを完全なURLに変換
      let fullUrl = url;
      if (url && !url.startsWith("http")) {
        fullUrl = `${window.location.origin}${url}`;
      }

      // Web Share APIが利用可能で、モバイルの場合
      if (
        navigator.share &&
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        const shareData: ShareData = {
          title: title,
          text: content,
          url: fullUrl,
        };

        // 画像がある場合は画像付きシェアを試行
        if (imageUrl) {
          try {
            console.log("Attempting to load image for sharing:", imageUrl);

            // まず通常のfetchを試行
            const response = await fetch(imageUrl, {
              mode: "cors",
              credentials: "omit",
            });

            if (response.ok) {
              const blob = await response.blob();
              const files = [
                new File([blob], "image.jpg", { type: blob.type }),
              ];
              shareData.files = files;
              console.log("Successfully loaded image via fetch");
            } else {
              console.warn("Fetch failed, trying canvas method");
              // fetchが失敗した場合、Canvas経由で画像を取得
              await loadImageViaCanvas(imageUrl, shareData);
            }
          } catch (error) {
            console.error("Failed to load image for sharing:", error);
            // Canvas経由での取得も試行
            try {
              await loadImageViaCanvas(imageUrl, shareData);
            } catch (canvasError) {
              console.error("Canvas method also failed:", canvasError);
            }
          }
        }

        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          console.error("Web Share API failed:", error);
          // Web Share APIが失敗した場合は通常のXシェアにフォールバック
        }
      }

      // 通常のXシェア（Web Intent API）
      let shareText = `${title}\n\n${content} #推しBOX`;

      // テキストが長すぎる場合は切り詰める（Xの制限は280文字）
      if (shareText.length > 200) {
        shareText = shareText.substring(0, 200) + "...";
      }

      // URLを追加
      if (fullUrl) {
        shareText += `\n\n${fullUrl}`;
      }

      // XのシェアURLを作成
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}`;

      // 新しいウィンドウで開く
      window.open(shareUrl, "_blank", "width=600,height=400");
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`flex items-center justify-center py-1.5 px-3 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Xでシェア"
    >
      <XIcon width={24} height={24} />
      <span className="text-sm">でシェア</span>
    </button>
  );
}
