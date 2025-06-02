//import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsService() {
  return (
    <div className="mt-3 mb-16">
      <Card className="w-full mb-4">
        <CardContent className="py-5  leading-relaxed">
          <h1 className="text-[#18181b] text-2xl font-bold mb-4">利用規約</h1>
          <div className="text-[#71717a] mb-8">
            <p>
              本利用規約（以下「本規約」）は、推しBOX（以下「本サービス」）が提供するサービスの利用に関する条件を定めるものです。ご利用の前に本規約をよくお読みいただき、同意のうえでご利用ください。
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第1条（適用範囲）</h3>
            <div className="text-[#71717a]">
              <p>
                本規約は、本サービスの提供および利用に関する一切の関係に適用されます。
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第2条（禁止事項）</h3>
            <div className="text-[#71717a]">
              <p>ユーザーは、以下の行為を行ってはなりません。</p>
              <ul className="list-disc list-inside">
                <li>法令または公序良俗に反する行為</li>
                <li>他のユーザーや第三者に不利益・損害を与える行為</li>
                <li>サービスの運営を妨げる行為</li>
                <li>その他運営者が不適切と判断する行為</li>
              </ul>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第3条（利用停止・削除）</h3>
            <div className="text-[#71717a]">
              <p>
                運営者は、ユーザーが本規約に違反した場合、事前の通知なくアカウント停止や投稿の削除を行うことがあります。
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">
              第4条（サービス内容の変更）
            </h3>
            <div className="text-[#71717a]">
              <p>
                運営者は、ユーザーへの事前通知なく、サービスの内容を変更または終了することがあります。
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第5条（免責事項）</h3>
            <div className="text-[#71717a]">
              <p>
                本サービスの利用によって生じたいかなる損害に対しても、運営者は一切の責任を負いません。
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第6条（著作権）</h3>
            <div className="text-[#71717a]">
              <p>
                ユーザーが投稿した内容の著作権はユーザーに帰属しますが、運営者はサービス内および広報目的で使用できるものとします。
              </p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">第7条（準拠法）</h3>
            <div className="text-[#71717a]">
              <p>
                本規約は日本法に準拠し、日本の裁判所を専属的合意管轄裁判所とします。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
