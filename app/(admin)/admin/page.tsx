import Link from "next/link";

export default function Admin() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-20">Admin</h1>
      <Link href="/">Home</Link>
    </div>
  );
}
