"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-2xl">🚀</div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AILearn
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-blue-600 transition font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/modules"
            className="text-gray-700 hover:text-blue-600 transition font-medium"
          >
            Roadmap
          </Link>
          <Link
            href="/datasets"
            className="text-gray-700 hover:text-blue-600 transition font-medium"
          >
            Datasets
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 py-4 px-6 space-y-3">
          <Link
            href="/dashboard"
            className="block text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/modules"
            className="block text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Roadmap
          </Link>
          <Link
            href="/datasets"
            className="block text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Datasets
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
