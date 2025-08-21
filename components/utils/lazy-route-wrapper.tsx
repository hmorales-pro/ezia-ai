'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyRouteWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyRouteWrapper({ 
  children, 
  fallback 
}: LazyRouteWrapperProps) {
  const defaultFallback = (
    <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#6D3FC8] mx-auto mb-4" />
        <p className="text-[#666666]">Chargement...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// Page-specific loading components
export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] animate-pulse">
      <div className="bg-white shadow-sm border-b border-[#E0E0E0] h-16" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-white rounded-lg" />
            <div className="h-32 bg-white rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorLoading() {
  return (
    <div className="h-screen bg-[#1E1E1E] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Préparation de l'éditeur...</p>
      </div>
    </div>
  );
}

export function BusinessPageLoading() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] animate-pulse">
      <div className="bg-white shadow-sm border-b border-[#E0E0E0] h-16" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-12 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-96 bg-white rounded-lg" />
          </div>
          <div>
            <div className="h-64 bg-white rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}