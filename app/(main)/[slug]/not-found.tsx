import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="mt-16 mb-16">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            ユーザーが見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            お探しのユーザーは存在しないか、アカウントが削除された可能性があります。
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="rose_link"
            >
              ホームに戻る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
