export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-[#1E1E1E] mb-4">
          Les tarifs sont temporairement désactivés
        </h1>
        <p className="text-[#666666] mb-6">
          Nous travaillons sur une nouvelle grille tarifaire. Revenez bientôt !
        </p>
        <a 
          href="/home" 
          className="text-[#6D3FC8] hover:underline"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}