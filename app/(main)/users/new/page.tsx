//import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UsersNew() {
  return (
    <div className="mt-3 mb-16">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-[#52525b]">持っている外部アカウントで登録</h1>
        </CardHeader>
        <CardContent className="py-5">
          <p>テキスト</p>
        </CardContent>
      </Card>
    </div>
  );
}
