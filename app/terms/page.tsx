import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import LandingNavbar from "@/components/landing-navbar";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation - Ezia",
  description: "Conditions générales d'utilisation de la plateforme Ezia",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      <LandingNavbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <Link href="/home" className="inline-flex items-center gap-2 text-[#6D3FC8] hover:text-[#5A35A5] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">Conditions d'Utilisation</h1>
          <div className="prose max-w-none">
            <p className="text-[#666666] mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            
            <h2 className="text-xl font-semibold mb-4">1. Acceptation des conditions</h2>
            <p className="mb-6">
              En accédant et en utilisant la plateforme Ezia ("le Service"), vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre Service.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Description du Service</h2>
            <p className="mb-6">
              Ezia est une plateforme propulsée par l'intelligence artificielle qui permet aux utilisateurs de créer des sites web, 
              développer des stratégies marketing et gérer leur présence en ligne. Le Service comprend l'accès à une équipe d'agents 
              IA spécialisés coordonnés par Ezia.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Inscription et compte utilisateur</h2>
            <p className="mb-4">Pour utiliser certaines fonctionnalités du Service, vous devez :</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Créer un compte avec des informations exactes et complètes</li>
              <li>Maintenir la sécurité de votre compte et mot de passe</li>
              <li>Être responsable de toute activité sous votre compte</li>
              <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">4. Utilisation acceptable</h2>
            <p className="mb-4">Vous vous engagez à ne pas :</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Utiliser le Service à des fins illégales ou non autorisées</li>
              <li>Violer les droits de propriété intellectuelle d'autrui</li>
              <li>Transmettre du contenu malveillant ou nuisible</li>
              <li>Tenter de contourner les mesures de sécurité du Service</li>
              <li>Utiliser le Service pour du spam ou des activités frauduleuses</li>
              <li>Revendre ou redistribuer le Service sans autorisation</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">5. Propriété intellectuelle</h2>
            <p className="mb-6">
              Vous conservez tous les droits sur le contenu que vous créez avec Ezia. En utilisant le Service, vous nous accordez 
              une licence limitée pour afficher et traiter votre contenu uniquement dans le cadre de la fourniture du Service. 
              Ezia et ses agents IA restent la propriété exclusive d'Ezia SAS.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Tarification et paiement</h2>
            <p className="mb-6">
              Certaines fonctionnalités du Service peuvent être payantes. Les prix sont affichés en euros et peuvent être modifiés 
              avec un préavis de 30 jours. Les paiements sont non remboursables sauf disposition contraire dans notre politique 
              de remboursement.
            </p>

            <h2 className="text-xl font-semibold mb-4">7. Limitation de responsabilité</h2>
            <p className="mb-6">
              Dans les limites permises par la loi, Ezia ne sera pas responsable des dommages indirects, consécutifs, spéciaux 
              ou punitifs résultant de votre utilisation ou incapacité à utiliser le Service. Notre responsabilité totale ne 
              dépassera pas le montant que vous avez payé pour le Service au cours des 12 derniers mois.
            </p>

            <h2 className="text-xl font-semibold mb-4">8. Garanties et disclaimers</h2>
            <p className="mb-6">
              Le Service est fourni "tel quel" et "selon disponibilité". Nous ne garantissons pas que le Service sera 
              ininterrompu, sécurisé ou exempt d'erreurs. Vous utilisez le Service à vos propres risques.
            </p>

            <h2 className="text-xl font-semibold mb-4">9. Résiliation</h2>
            <p className="mb-6">
              Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre compte. Nous nous réservons 
              le droit de suspendre ou résilier votre accès au Service en cas de violation de ces conditions.
            </p>

            <h2 className="text-xl font-semibold mb-4">10. Modifications des conditions</h2>
            <p className="mb-6">
              Nous pouvons modifier ces conditions à tout moment. Les modifications importantes seront notifiées par email 
              ou via le Service. Votre utilisation continue du Service après les modifications constitue votre acceptation 
              des nouvelles conditions.
            </p>

            <h2 className="text-xl font-semibold mb-4">11. Droit applicable</h2>
            <p className="mb-6">
              Ces conditions sont régies par le droit français. Tout litige sera soumis à la compétence exclusive des 
              tribunaux de Paris, France.
            </p>

            <h2 className="text-xl font-semibold mb-4">12. Contact</h2>
            <p className="mb-6">
              Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
              <a href="mailto:hello@ezia.ai" className="text-[#6D3FC8] hover:underline ml-1">hello@ezia.ai</a>
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-[#666666]">
                En créant un compte et en utilisant Ezia, vous confirmez avoir lu, compris et accepté ces conditions d'utilisation.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}