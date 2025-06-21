import Link from "next/link";

// ハッシュタグを検出する正規表現（半角#と全角#の両方に対応）
const HASHTAG_REGEX = /[#＃]([^\s#＃]+)/g;

// テキスト内のハッシュタグをリンクに変換する関数
export function convertHashtagsToLinks(text: string) {
  const parts = text.split(HASHTAG_REGEX);
  const result = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // 通常のテキスト部分
      if (parts[i]) {
        result.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
    } else {
      // ハッシュタグ部分
      const hashtag = parts[i];
      result.push(
        <Link
          key={`hashtag-${i}`}
          href={`/search?hashtag=${encodeURIComponent(hashtag)}`}
          className="rose_link no-underline"
        >
          #{hashtag}
        </Link>
      );
    }
  }

  return result;
}

// ハッシュタグ付きテキストを表示するコンポーネント
interface HashtagTextProps {
  text: string;
  className?: string;
}

export function HashtagText({ text, className }: HashtagTextProps) {
  return <span className={className}>{convertHashtagsToLinks(text)}</span>;
}
