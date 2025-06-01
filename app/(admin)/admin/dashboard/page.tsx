import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <div className="mt-3 mb-16">AdminDashboard</div>
      <div className="text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ホームに戻る
        </Link>
      </div>
    </>
  );
}
