"use client";

import { useEffect, useState } from "react";

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Test direct fetch
    fetch("/api/me/business")
      .then(res => res.json())
      .then(data => {
        console.log("Direct fetch result:", data);
        setResult(data);
      })
      .catch(err => {
        console.error("Direct fetch error:", err);
        setError(err.toString());
      });

    // Also log the current URL
    console.log("Current URL:", window.location.href);
    console.log("Current origin:", window.location.origin);
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl mb-4">API Test</h1>
      <div className="mb-4">
        <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
      </div>
      <div className="mb-4">
        <strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
      </div>
      {result && (
        <div>
          <strong>Result:</strong>
          <pre className="bg-zinc-800 p-4 rounded mt-2">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div>
          <strong>Error:</strong>
          <pre className="bg-red-900 p-4 rounded mt-2">{error}</pre>
        </div>
      )}
    </div>
  );
}