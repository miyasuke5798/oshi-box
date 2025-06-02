//import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsService() {
  return (
    <div className="mt-3 mb-16">
      <Card className="w-full mb-4">
        <CardContent className="py-5  leading-relaxed">
          <h1 className="text-[#18181b] text-2xl font-bold mb-4">
            プライバシーポリシー
          </h1>
          <div className="text-[#71717a] mb-8">
            <p>
              推しBOX（以下「本サービス」）では、個人情報の保護を重視し、以下のとおりプライバシーポリシーを定めます。
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第1条（取得する情報）</h3>
            <div className="text-[#71717a]">
              <p>本サービスでは以下の情報を取得することがあります。</p>
              <ul className="list-disc list-inside">
                <li>ニックネーム、推し情報、投稿内容</li>
                <li>お問い合わせ内容</li>
                <li>Cookie等のアクセス情報（Google Analytics利用時など）</li>
              </ul>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第2条（利用目的）</h3>
            <div className="text-[#71717a]">
              <p>取得した情報は以下の目的に利用します。</p>
              <ul className="list-disc list-inside">
                <li>サービスの運営・改善</li>
                <li>利用者への重要なお知らせの送付</li>
                <li>不正利用の防止・対応</li>
              </ul>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第3条（第三者提供）</h3>
            <div className="text-[#71717a]">
              <p>
                法令に基づく場合を除き、ユーザーの同意なしに第三者へ情報を提供することはありません。
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">
              第4条（外部サービスの利用）
            </h3>
            <div className="text-[#71717a]">
              <p>
                アクセス解析や問い合わせフォーム等で、外部サービス（Googleフォーム、X等）を利用する場合があります。
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第5条（情報の管理）</h3>
            <div className="text-[#71717a]">
              <p>取得した情報は、適切な方法で安全に管理します。</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
