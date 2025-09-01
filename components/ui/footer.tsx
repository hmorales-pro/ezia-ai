"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  Mail, 
  Linkedin,
  Instagram
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#E0E0E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Ezia Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Ezia
                <Sparkles className="w-4 h-4 text-[#6D3FC8]" />
              </h3>
            </div>
            <p className="text-sm text-[#666666] mb-4">
              Votre partenaire business IA pour créer, développer et faire grandir votre présence en ligne. 
              Une équipe d'experts virtuels à votre service 24/7.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://www.linkedin.com/company/entreprise-eziom" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#F5F3EE] rounded-lg flex items-center justify-center hover:bg-[#6D3FC8] hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/eziom.fr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#F5F3EE] rounded-lg flex items-center justify-center hover:bg-[#6D3FC8] hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-[#1E1E1E] mb-4">Produit</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/auth/ezia" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors flex items-center gap-1"
                >
                  Commencer gratuitement
                </Link>
              </li>
              <li>
                <Link 
                  href="/equipe" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors"
                >
                  Notre équipe IA
                </Link>
              </li>
              {/* Temporairement désactivé
              <li>
                <Link 
                  href="/gallery" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors"
                >
                  Galerie de sites
                </Link>
              </li>
              */}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-[#1E1E1E] mb-4">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/guides" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors"
                >
                  Guides pratiques
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-semibold text-[#1E1E1E] mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:support@ezia.ai" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  support@ezia.ai
                </a>
              </li>
              <li className="text-sm text-[#666666]">
                Lun-Ven 9h-18h CET
              </li>
            </ul>
            
            <h4 className="font-semibold text-[#1E1E1E] mb-4 mt-8">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              {/* Temporairement désactivé - page à créer
              <li>
                <Link 
                  href="/legal" 
                  className="text-sm text-[#666666] hover:text-[#6D3FC8] transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              */}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E0E0E0] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#666666] text-center md:text-left">
              © {currentYear} Ezia.ai - Tous droits réservés | Une solution propulsée par{" "}
              <a 
                href="https://eziom.fr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#6D3FC8] hover:text-[#5A35A5] underline transition-colors"
              >
                Eziom
              </a>
            </p>
            
            <div className="flex items-center gap-4 text-sm text-[#666666]">
              <Link 
                href="/privacy" 
                className="hover:text-[#6D3FC8] transition-colors"
              >
                Confidentialité
              </Link>
              <span>•</span>
              <Link 
                href="/terms" 
                className="hover:text-[#6D3FC8] transition-colors"
              >
                CGU
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}