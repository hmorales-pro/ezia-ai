"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X,
  ArrowRight,
  Lightbulb,
  Building2,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useUser } from "@/hooks";
import { UserMenu } from "@/components/user-menu";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const isStartupPage = pathname === "/home";

  const resources = [
    {
      title: "Guides",
      href: "/guides",
      description: "Tutoriels détaillés pour réussir en ligne",
      icon: Lightbulb
    }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-md" 
        : "bg-white/80 backdrop-blur-sm"
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
            <span className="text-2xl font-semibold text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
              Ezia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Ressources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {resources.map((resource) => (
                        <li key={resource.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={resource.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-purple-50 focus:bg-purple-50 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                  <resource.icon className="w-5 h-5 text-[#6D3FC8]" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium leading-none mb-1 text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">
                                    {resource.title}
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-[#666666] group-hover:text-[#1E1E1E] transition-colors">
                                    {resource.description}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link href="/equipe" className="text-[#666666] hover:text-[#6D3FC8] font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-all">
              L'équipe
            </Link>

            {/* Switch between startup and enterprise */}
            {(isStartupPage || isEnterprisePage) && (
              <Link 
                href={isEnterprisePage ? "/home" : "/home-enterprise"} 
                className="flex items-center gap-2 text-[#666666] hover:text-[#6D3FC8] font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-all"
              >
                {isEnterprisePage ? (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Pour startups</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Pour entreprises</span>
                  </>
                )}
              </Link>
            )}
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
                <Link href={isEnterprisePage ? "/auth/ezia?from=enterprise" : "/auth/ezia"}>
                  <Button variant="ghost" className="text-[#666666] hover:text-[#6D3FC8] hover:bg-purple-50 font-medium">
                    Se connecter
                  </Button>
                </Link>
                <Link href={isEnterprisePage ? "/auth/ezia?from=enterprise" : "/auth/ezia"}>
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
            <div>
              <p className="text-sm font-semibold text-[#666666] mb-2">Ressources</p>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <Link
                    key={resource.title}
                    href={resource.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <resource.icon className="w-5 h-5 text-[#6D3FC8]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#1E1E1E] group-hover:text-[#6D3FC8] transition-colors">{resource.title}</p>
                      <p className="text-xs text-[#666666] group-hover:text-[#1E1E1E] transition-colors">{resource.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Link
                href="/equipe"
                className="block px-3 py-2 text-[#666666] hover:text-[#6D3FC8] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                L'équipe
              </Link>

              {/* Switch between startup and enterprise for mobile */}
              {(isStartupPage || isEnterprisePage) && (
                <Link
                  href={isEnterprisePage ? "/home" : "/home-enterprise"}
                  className="flex items-center gap-2 px-3 py-2 text-[#666666] hover:text-[#6D3FC8] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isEnterprisePage ? (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span>Pour startups</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      <span>Pour entreprises</span>
                    </>
                  )}
                </Link>
              )}
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
                  <Link href={isEnterprisePage ? "/auth/ezia?from=enterprise" : "/auth/ezia"} className="block">
                    <Button variant="outline" className="w-full">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href={isEnterprisePage ? "/auth/ezia?from=enterprise" : "/auth/ezia"} className="block">
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