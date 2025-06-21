"use client";

import { XIcon } from "@/components/svg/x_icon";

interface XShareButtonProps {
  title: string;
  content: string;
  url?: string;
  className?: string;
}

export function XShareButton({
  title,
  content,
  url,
  className = "",
}: XShareButtonProps) {
  const handleShare = () => {
    // シェア用のテキストを作成
    let shareText = `${title}\n\n${content}`;

    // テキストが長すぎる場合は切り詰める（Xの制限は280文字）
    if (shareText.length > 200) {
      shareText = shareText.substring(0, 200) + "...";
    }

    // URLを完全なURLに変換
    let fullUrl = url;
    if (url && !url.startsWith("http")) {
      fullUrl = `${window.location.origin}${url}`;
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
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center justify-center p-2 rounded-full hover:bg-gray-50 cursor-pointer transition-colors ${className}`}
      title="Xでシェア"
    >
      <XIcon width={26} height={26} />
    </button>
  );
}
