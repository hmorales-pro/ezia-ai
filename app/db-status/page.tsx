'use client';

import { useEffect, useState } from 'react';

interface DBStatus {
  connected: boolean;
  type: 'mongodb' | 'memory' | null;
  message: string;
  details?: any;
}

export default function DBStatusPage() {
  const [status, setStatus] = useState<DBStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDBStatus();
  }, []);

  const checkDBStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        connected: false,
        type: null,
        message: 'Failed to check database status',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Connection Status</h1>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Checking database connection...</p>
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              status.connected ? 'border-green-500' : 'border-red-500'
            }`}>
              <h2 className="text-xl font-semibold mb-2">
                Status: {status.connected ? '✅ Connected' : '❌ Not Connected'}
              </h2>
              <p className="text-gray-600 mb-2">Type: {status.type || 'Unknown'}</p>
              <p className="text-gray-700">{status.message}</p>
            </div>

            {status.details && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(status.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Troubleshooting</h3>
              {!status.connected && status.type === 'memory' && (
                <div className="space-y-2 text-sm">
                  <p>⚠️ Using in-memory database (data will be lost on restart)</p>
                  <p>Possible issues:</p>
                  <ul className="list-disc list-inside ml-4">
                    <li>MongoDB URI not configured in .env.local</li>
                    <li>MongoDB connection failed (check credentials)</li>
                    <li>IP address not whitelisted in MongoDB Atlas</li>
                    <li>Network connectivity issues</li>
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={checkDBStatus}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-600">Failed to load status</p>
          </div>
        )}
      </div>
    </div>
  );
}