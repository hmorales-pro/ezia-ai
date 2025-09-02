import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import LandingNavbar from "@/components/landing-navbar";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Ezia",
  description: "Découvrez comment Ezia protège vos données personnelles et respecte votre vie privée.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <LandingNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <Link href="/home" className="inline-flex items-center gap-2 text-[#6D3FC8] hover:text-[#5A35A5] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose max-w-none">
            <p className="text-[#666666] mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-6">
              Chez Ezia, nous prenons la protection de vos données personnelles très au sérieux. 
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Données collectées</h2>
            <p className="mb-4">Nous collectons les types de données suivants :</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Informations d'identification (nom, email, nom d'utilisateur)</li>
              <li>Données de projets et de business créés sur la plateforme</li>
              <li>Données d'utilisation et de navigation</li>
              <li>Informations de paiement (traitées de manière sécurisée)</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">3. Utilisation des données</h2>
            <p className="mb-4">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Communiquer avec vous concernant votre compte</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">4. Protection des données</h2>
            <p className="mb-6">
              Nous utilisons des mesures de sécurité de pointe pour protéger vos données, 
              incluant le chiffrement SSL, des serveurs sécurisés et des protocoles d'accès stricts.
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Partage des données</h2>
            <p className="mb-6">
              Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées 
              uniquement avec des partenaires de confiance nécessaires au fonctionnement du service 
              (hébergement, paiement) et toujours de manière sécurisée.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Vos droits</h2>
            <p className="mb-4">Conformément au RGPD, vous avez le droit de :</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier vos informations</li>
              <li>Demander la suppression de vos données</li>
              <li>Vous opposer au traitement de vos données</li>
              <li>Demander la portabilité de vos données</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
            <p className="mb-6">
              Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies 
              analytiques pour améliorer notre service. Vous pouvez gérer vos préférences de cookies 
              dans les paramètres de votre navigateur.
            </p>

            <h2 className="text-xl font-semibold mb-4">8. Contact</h2>
            <p className="mb-6">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
              contactez-nous à : <a href="mailto:hello@ezia.ai" className="text-[#6D3FC8] hover:underline">hello@ezia.ai</a>
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-[#666666]">
                En utilisant Ezia, vous acceptez cette politique de confidentialité. 
                Nous nous réservons le droit de modifier cette politique à tout moment. 
                Les modifications seront effectives dès leur publication sur cette page.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}