"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks";
import { UserMenu } from "@/components/user-menu";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resources = [
    // Pages temporairement désactivées
    // {
    //   title: "Centre d'aide",
    //   href: "/help",
    //   description: "Trouvez des réponses à vos questions",
    //   icon: HelpCircle
    // },
    // {
    //   title: "Blog",
    //   href: "/blog",
    //   description: "Conseils et actualités pour votre business",
    //   icon: FileText
    // },
    // {
    //   title: "Guides",
    //   href: "/guides",
    //   description: "Tutoriels détaillés pour réussir en ligne",
    //   icon: Lightbulb
    // }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-md" 
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Ezia Logo"
              width={40}
              height={40}
              className="group-hover:scale-110 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/equipe" className="text-[#666666] hover:text-[#6D3FC8] font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-all">
              L'équipe
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-[#666666] hover:text-[#6D3FC8] hover:bg-purple-50 font-medium">
                    Dashboard
                  </Button>
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                <Link href="/auth/ezia">
                  <Button variant="ghost" className="text-[#666666] hover:text-[#6D3FC8] hover:bg-purple-50 font-medium">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/ezia">
                  <Button className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white shadow-md hover:shadow-lg transition-all">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            <div className="space-y-2">
              <Link
                href="/equipe"
                className="block px-3 py-2 text-[#666666] hover:text-[#6D3FC8] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                L'équipe
              </Link>
            </div>

            <div className="space-y-3 pt-4 border-t">
              {user ? (
                <>
                  <Link href="/dashboard" className="block">
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="px-2">
                    <UserMenu />
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/ezia" className="block">
                    <Button variant="outline" className="w-full">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/ezia" className="block">
                    <Button className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
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