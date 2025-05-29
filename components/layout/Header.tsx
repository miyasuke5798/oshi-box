import Link from "next/link";

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold">
              oshi box
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              icon
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
