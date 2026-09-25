"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint } from "lucide-react";
import AuthMenu from "./AuthMenu";

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "About", href: "/about" },
    { name: "Stories", href: "/stories" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="pt-6 pb-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-50">
      <header className="bg-white rounded-full px-6 py-3 flex items-center justify-between shadow-sm border border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="w-9 h-9 text-[#007BFF] fill-[#007BFF] stroke-[#007BFF]" />
          <span className="text-3xl font-extrabold tracking-tight text-[#007BFF]">
            PetHope
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-semibold">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`relative transition ${isActive(link.href) ? "text-[#007BFF]" : "text-slate-600 hover:text-[#007BFF]"}`}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#007BFF] rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        <AuthMenu />
      </header>
    </div>
  );
}
