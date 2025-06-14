import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            ページが見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <Link
            href="/"
            className="rose_link"
          >
            ホームに戻る
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
