import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </>
  );
}
