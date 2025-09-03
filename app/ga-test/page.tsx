export default function GATestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Google Analytics Test Page</h1>
        <p className="mb-4">This page is for testing Google Analytics installation.</p>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">GA Tag ID:</h2>
          <code className="bg-gray-200 px-2 py-1 rounded">G-S99GRQZRJ1</code>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Debug Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open browser Developer Console (F12)</li>
            <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">window.checkGA()</code></li>
            <li>Check the output for GA status</li>
          </ol>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Verification Steps:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Install Google Tag Assistant Chrome extension</li>
            <li>Visit this page with the extension enabled</li>
            <li>Check if the tag G-S99GRQZRJ1 is detected</li>
            <li>Or use Google Analytics Debugger extension</li>
          </ol>
        </div>
      </div>
    </div>
  );
}