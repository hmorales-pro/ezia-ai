"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  FileText,
  ShoppingCart,
  Sparkles,
  Settings,
  ArrowLeft,
  LayoutDashboard,
  Palette,
  Search,
  MessageSquare
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface WebLayoutProps {
  children: React.ReactNode;
}

interface Business {
  _id: string;
  business_id: string;
  name: string;
  description: string;
  industry: string;
}

const navigationItems = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    href: '/web/overview',
    badge: null
  },
  {
    id: 'site',
    label: 'Site Web',
    icon: Globe,
    href: '/web/site/pages',
    badge: null,
    subItems: [
      { label: 'Pages', href: '/web/site/pages' },
      { label: 'Design', href: '/web/site/design' },
      { label: 'Branding', href: '/web/site/branding' },
      { label: 'SEO', href: '/web/site/seo' }
    ]
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: FileText,
    href: '/web/blog/posts',
    badge: null,
    subItems: [
      { label: 'Articles', href: '/web/blog/posts' },
      { label: 'Catégories', href: '/web/blog/categories' },
      { label: 'Calendrier', href: '/web/blog/calendar' }
    ]
  },
  {
    id: 'shop',
    label: 'Boutique',
    icon: ShoppingCart,
    href: '/web/shop/products',
    badge: 'Bientôt',
    subItems: [
      { label: 'Produits', href: '/web/shop/products' },
      { label: 'Commandes', href: '/web/shop/orders' },
      { label: 'Paiements', href: '/web/shop/stripe' }
    ]
  },
  {
    id: 'copywriting',
    label: 'Copywriting',
    icon: Sparkles,
    href: '/web/copywriting',
    badge: 'Bientôt'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    href: '/web/settings',
    badge: null
  }
];

export default function WebLayout({ children }: WebLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const response = await api.get(`/api/me/business-unified`);
      if (response.data.ok) {
        const foundBusiness = response.data.businesses.find(
          (b: Business) => b.business_id === businessId
        );
        setBusiness(foundBusiness || null);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (href: string) => {
    return pathname?.includes(href);
  };

  const getActiveSection = () => {
    if (pathname?.includes('/web/site')) return 'site';
    if (pathname?.includes('/web/blog')) return 'blog';
    if (pathname?.includes('/web/shop')) return 'shop';
    if (pathname?.includes('/web/copywriting')) return 'copywriting';
    if (pathname?.includes('/web/settings')) return 'settings';
    return 'overview';
  };

  const activeSection = getActiveSection();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-2">Business non trouvé</h2>
          <p className="text-[#666666] mb-6">Ce business n'existe pas ou vous n'y avez pas accès.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button + Title */}
            <div className="flex items-center gap-4">
              <Link href={`/business/${businessId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="h-8 w-px bg-[#E0E0E0]" />
              <div>
                <h1 className="text-xl font-bold text-[#1E1E1E] flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#6D3FC8]" />
                  {business.name}
                </h1>
                <p className="text-xs text-[#666666]">Présence Web</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] hover:from-[#5A35A5] hover:to-[#6D3FC8]"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Parler à Ezia
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 border-b border-[#E0E0E0] -mb-[1px]">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <Link
                  key={item.id}
                  href={`/business/${businessId}${item.href}`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                    active
                      ? "border-[#6D3FC8] text-[#6D3FC8] font-medium"
                      : "border-transparent text-[#666666] hover:text-[#1E1E1E] hover:border-[#E0E0E0]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar Navigation (for sub-items) */}
        {navigationItems.find(item => item.id === activeSection)?.subItems && (
          <aside className="w-64 bg-white border-r border-[#E0E0E0] min-h-[calc(100vh-140px)]">
            <nav className="p-4 space-y-1">
              {navigationItems
                .find(item => item.id === activeSection)
                ?.subItems?.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={`/business/${businessId}${subItem.href}`}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive(subItem.href)
                        ? "bg-[#6D3FC8]/10 text-[#6D3FC8] font-medium"
                        : "text-[#666666] hover:bg-gray-50 hover:text-[#1E1E1E]"
                    )}
                  >
                    {subItem.label}
                  </Link>
                ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
