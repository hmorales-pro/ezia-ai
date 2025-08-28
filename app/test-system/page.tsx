export default function TestSystemPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Test Système Multipage</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Liens de test :</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <a href="/multipage/create" style={{ color: 'blue', textDecoration: 'underline' }}>
              → Créer un site multipage
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/auth" style={{ color: 'blue', textDecoration: 'underline' }}>
              → Se connecter
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/workspace" style={{ color: 'blue', textDecoration: 'underline' }}>
              → Espace de travail
            </a>
          </li>
        </ul>
      </div>
      
      <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p style={{ margin: 0 }}>
          Si cette page s'affiche correctement, le système Next.js fonctionne.
          <br />Les erreurs CSS n'empêchent pas le fonctionnement de base.
        </p>
      </div>
    </div>
  );
}