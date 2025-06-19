import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
// TODO: ログイン不要でアクセスできるページの確認と制御
// TODO: SEO整備
export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-grow container px-3 sm:px-0">{children}</main>
      <Footer />
    </>
  );
}
