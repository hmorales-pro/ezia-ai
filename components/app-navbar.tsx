"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import { LayoutDashboard, BarChart3, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppNavbarProps {
  title?: string;
}

export function AppNavbar({ title }: AppNavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/usage", label: "Utilisation", icon: BarChart3 },
    { href: "/settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-[#E0E0E0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Ezia"
                width={40}
                height={40}
                className="object-contain"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Ezia</h1>
              {title && <p className="text-xs text-[#666666]">{title}</p>}
            </div>
          </Link>

          {/* Navigation principale */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] text-white shadow-sm"
                      : "text-[#666666] hover:text-[#6D3FC8] hover:bg-purple-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
