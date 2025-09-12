"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Button component removed - using native buttons
import { 
  Menu, 
  X,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks";

export default function LandingNavbarSimple() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isEnterprisePage = pathname === "/home-enterprise";

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
      isScrolled 
        ? "bg-white shadow-md" 
        : "bg-white shadow-sm"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Ezia Logo"
              width={40}
              height={40}
            />
            <span className="text-2xl font-semibold text-gray-900">
              Ezia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className="flex items-center gap-1 text-gray-600 hover:text-purple-600 font-medium px-3 py-2"
              >
                Ressources
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isResourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-2">
                  <Link 
                    href="/guides" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 rounded"
                    onClick={() => setIsResourcesOpen(false)}
                  >
                    Guides
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 rounded"
                    onClick={() => setIsResourcesOpen(false)}
                  >
                    Tarifs
                  </Link>
                  <Link 
                    href="/waitlist" 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 rounded"
                    onClick={() => setIsResourcesOpen(false)}
                  >
                    Liste d'attente
                  </Link>
                </div>
              )}
            </div>

            <Link href="/equipe" className="text-gray-600 hover:text-purple-600 font-medium px-3 py-2">
              L'équipe
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <button className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all">
                    Dashboard
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/ezia">
                  <button className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all">
                    Se connecter
                  </button>
                </Link>
                <Link href="/auth/ezia">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                    Commencer gratuitement
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-6 space-y-4">
            <Link 
              href="/guides" 
              className="block text-gray-700 hover:text-purple-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Guides
            </Link>
            <Link 
              href="/equipe" 
              className="block text-gray-700 hover:text-purple-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              L'équipe
            </Link>
            <Link 
              href="/pricing" 
              className="block text-gray-700 hover:text-purple-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tarifs
            </Link>
            
            <div className="pt-4 space-y-2">
              {user ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block">
                  <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/ezia" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:text-purple-600 hover:border-purple-600 font-medium rounded-lg">
                      Se connecter
                    </button>
                  </Link>
                  <Link href="/auth/ezia" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                      Commencer gratuitement
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}