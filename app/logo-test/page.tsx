export default function LogoTest() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Test du logo Ezia pour emails</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Logo hébergé localement :</h2>
            <div className="bg-gray-100 p-4 rounded text-center">
              <img 
                src="/img/ezia-email-logo.png" 
                alt="Ezia Logo" 
                className="mx-auto"
                style={{ width: '150px', height: '150px' }}
              />
              <p className="mt-2 text-sm text-gray-600">/img/ezia-email-logo.png</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">URL complète pour les emails :</h2>
            <div className="bg-gray-100 p-4 rounded">
              <code className="text-sm break-all">https://ezia.ai/img/ezia-email-logo.png</code>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Prévisualisation dans email (style Startup) :</h2>
            <div style={{ background: 'linear-gradient(135deg, #6D3FC8 0%, #8B5FE7 100%)' }} className="p-8 rounded-t-lg text-center">
              <img 
                src="/img/ezia-email-logo.png" 
                alt="Ezia"
                className="mx-auto"
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'white', 
                  padding: '10px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              />
              <h3 className="text-white text-xl font-bold mt-4">Bienvenue chez Ezia ! 🎉</h3>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Prévisualisation dans email (style Enterprise) :</h2>
            <div style={{ background: 'linear-gradient(135deg, #1E1E1E 0%, #3A3A3A 100%)' }} className="p-8 rounded-t-lg text-center">
              <img 
                src="/img/ezia-email-logo.png" 
                alt="Ezia Analytics"
                className="mx-auto"
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  background: 'white', 
                  padding: '12px',
                  boxShadow: '0 3px 15px rgba(0,0,0,0.2)'
                }}
              />
              <h3 className="text-white text-2xl font-bold mt-4">EZIA Analytics</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}