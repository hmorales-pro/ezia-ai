export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Guides pratiques</h1>
        <p className="text-xl text-gray-600 mb-8">
          Nos guides arrivent bientôt \!
        </p>
        <a href="/waitlist" className="inline-block bg-[#6D3FC8] text-white px-6 py-3 rounded-lg hover:bg-[#5A35A5] transition-colors">
          Rejoindre la liste d attente
        </a>
      </div>
    </div>
  );
}
