//import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function About() {
  return (
    <div className="mt-3 mb-16">
      <Card className="w-full mb-4">
        <CardHeader>
          <h1 className="text-[#52525b]">推しBOXとは？</h1>
        </CardHeader>
        <CardContent className="py-5">
          <div className="text-[#000] leading-relaxed">
            <p>あなたの“推し活”、ちゃんと残していますか？</p>
            <p>
              「今日のMCが最高だった」「配信のあのセリフ、一生忘れたくない」
            </p>
            <p>そんな感動の瞬間を、自分だけの空間に残せる。</p>
            <p>それが 推しBOX です。</p>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full mb-4">
        <CardHeader>
          <h2 className="text-[#52525b]">主な機能</h2>
        </CardHeader>
        <CardContent className="py-5  leading-relaxed">
          <div className="mb-4">
            <h3 className="text-xl mb-2">推し語り投稿</h3>
            <div className="text-[#71717a]">
              <p>画像・文章・タグで、あなたの“推し”を自由に記録。</p>
              <p>時系列順に並ぶ、自分専用の「推し活日記帳」です。</p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl mb-2">ハッシュタグ整理</h3>
            <div className="text-[#71717a]">
              <p>「#現場レポ」「#今日の尊い推し」など自由にタグ付けして、</p>
              <p>あとから見返しやすく整理できます。</p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl mb-2">マイページ</h3>
            <div className="text-[#71717a]">
              <p>推し別に投稿や記録を一覧表示。</p>
              <p>自分だけの“推しのホーム画面”として機能します。</p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl mb-2">推しごとカレンダー</h3>
            <div className="text-[#71717a]">
              <p>ライブ・配信・グッズ発売日など、予定をひと目でチェック。</p>
              <ul className="list-disc list-inside">
                <li>無料：月3件まで登録可能</li>
                <li>有料：件数無制限＋リマインダー通知機能つき</li>
              </ul>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl mb-2">無料プランでできること</h3>
            <div className="text-[#71717a]">
              <ul className="list-disc list-inside">
                <li>推し登録：最大3人まで</li>
                <li>投稿＆画像アップロード：無制限</li>
                <li>投稿の公開／非公開切替が可能で安心</li>
              </ul>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl mb-2">有料プラン（実装予定）</h3>
            <div className="text-[#71717a]">
              <ul className="list-disc list-inside">
                <li>推し登録：無制限</li>
                <li>推しごとカレンダー：無制限＆リマインダー通知つき</li>
                <li>広告非表示</li>
                <li>問い合わせ優先サポート</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full mb-4">
        <CardHeader>
          <h2 className="text-[#52525b]">使い方</h2>
        </CardHeader>
        <CardContent className="py-5  leading-relaxed">
          <div className="mb-4">
            <h3 className="text-xl mb-2">1. 推しを登録しよう</h3>
            <div className="text-[#71717a]">
              <p>
                名前・ジャンル・画像などを入力して、自分だけの“推しページ”を作成！
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl mb-2">2. 投稿してみよう</h3>
            <div className="text-[#71717a]">
              <p>感想・現場レポ・嬉しかった供給など、どんどん記録！</p>
              <p>画像も一緒にアップして、推しとの思い出を形にできます。</p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl mb-2">3. ハッシュタグで整理しよう</h3>
            <div className="text-[#71717a]">
              <p>#現場レポ #供給感謝 #初見沼落ち など、自分好みにタグ管理。</p>
              <p>あとから見返すのもスムーズに</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
