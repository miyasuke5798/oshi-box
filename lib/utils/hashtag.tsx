import Link from "next/link";

// ハッシュタグを検出する正規表現（半角#と全角#の両方に対応）
const HASHTAG_REGEX = /[#＃]([^\s#＃]+)/g;

// URLを検出する正規表現（http://またはhttps://で始まるURL、半角英数字と一部記号のみ）
const URL_REGEX = /(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)/g;

// テキスト内のハッシュタグとURLをリンクに変換する関数
export function convertHashtagsAndUrlsToLinks(text: string) {
  // まずハッシュタグで分割
  const hashtagParts = text.split(HASHTAG_REGEX);
  const result = [];

  for (let i = 0; i < hashtagParts.length; i++) {
    if (i % 2 === 0) {
      // 通常のテキスト部分（URLも含まれる可能性がある）
      if (hashtagParts[i]) {
        // URLでさらに分割
        const urlParts = hashtagParts[i].split(URL_REGEX);
        for (let j = 0; j < urlParts.length; j++) {
          if (j % 2 === 0) {
            // 通常のテキスト部分
            if (urlParts[j]) {
              result.push(<span key={`text-${i}-${j}`}>{urlParts[j]}</span>);
            }
          } else {
            // URL部分
            const url = urlParts[j];
            result.push(
              <a
                key={`url-${i}-${j}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rose_link underline"
              >
                {url}
              </a>
            );
          }
        }
      }
    } else {
      // ハッシュタグ部分
      const hashtag = hashtagParts[i];
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

// 後方互換性のため、古い関数名も残す
export function convertHashtagsToLinks(text: string) {
  return convertHashtagsAndUrlsToLinks(text);
}

// ハッシュタグ付きテキストを表示するコンポーネント
interface HashtagTextProps {
  text: string;
  className?: string;
}

export function HashtagText({ text, className }: HashtagTextProps) {
  return <span className={className}>{convertHashtagsToLinks(text)}</span>;
}
