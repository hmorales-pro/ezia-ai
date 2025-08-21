'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@ezia.ai',
          password: 'test123',
        }),
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: {
          'set-cookie': response.headers.get('set-cookie'),
        }
      });
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const testMe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/me-simple');
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const checkCookies = () => {
    setResult({
      cookies: document.cookie,
      cookiesArray: document.cookie.split('; '),
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test d'Authentification</h1>
      
      <div className="space-y-4">
        <Button onClick={testLogin} disabled={loading}>
          1. Tester Login
        </Button>
        
        <Button onClick={checkCookies} disabled={loading}>
          2. Vérifier Cookies
        </Button>
        
        <Button onClick={testMe} disabled={loading}>
          3. Tester /api/me-simple
        </Button>
      </div>

      {result && (
        <pre className="mt-6 p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}