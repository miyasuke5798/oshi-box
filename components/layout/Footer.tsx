import Link from "next/link";
import { XIcon } from "@/components/svg/x_icon";

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 pb-4 mb-[100px]">
      <div className="container px-3 sm:px-0 pt-8">
        <div className="grid sm:grid-cols-2 gap-y-6">
          <div>
            <h3 className="text-[#3f3f46] font-semibold">サンプルリンク</h3>
            <ul className="text-sm my-3 space-y-4">
              <li>
                <Link href="/admin" className="text-[#71717a]">
                  admin
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#3f3f46] font-semibold">サンプルリンク</h3>
            <ul className="text-sm my-3 space-y-4">
              <li>
                <Link href="/#" className="text-[#71717a]">
                  サンプルリンク
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#3f3f46] font-semibold">あなたのページ</h3>
            <ul className="text-sm my-3 space-y-4">
              <li>
                <Link href="/xxx" className="text-[#71717a]">
                  マイページ
                </Link>
              </li>
              <li>
                <Link href="/users/new" className="text-[#71717a]">
                  新規登録
                </Link>
              </li>
              <li>
                <Link href="/session/new" className="text-[#71717a]">
                  ログイン
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200">
          <div className="mt-4 mb-8">
            <h3 className="text-[#3f3f46] text-sm font-semibold mb-2">
              公式アカウント
            </h3>
            <div>
              <XIcon width={23} height={23} className="text-[#9a9a9a]" />
            </div>
          </div>
          <div className="my-4">
            <h3 className="text-[#3f3f46] text-sm font-semibold mb-2">サポート</h3>
            <div>
              <Link href="/about" className="text-[#71717a] text-sm">
                推しBOXとは？
              </Link>
            </div>
          </div>
          <p className="text-base !text-[#d4d4d8]">©Oshi Box</p>
        </div>
      </div>
    </footer>
  );
};
