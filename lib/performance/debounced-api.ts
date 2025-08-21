import { useState } from 'react';
import { api } from '@/lib/api';
import { debounce, useDebounce } from './debounce';

// Cache for API responses to prevent duplicate requests
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a cache key from request parameters
 */
function createCacheKey(url: string, params?: any): string {
  return `${url}:${JSON.stringify(params || {})}`;
}

/**
 * Checks if cached response is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Debounced API get request with caching
 */
export const debouncedGet = debounce(async (url: string, config?: any) => {
  const cacheKey = createCacheKey(url, config?.params);
  const cached = responseCache.get(cacheKey);
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }
  
  const response = await api.get(url, config);
  responseCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
  
  return response.data;
}, 300); // 300ms debounce

/**
 * Debounced API post request
 */
export const debouncedPost = debounce(async (url: string, data?: any, config?: any) => {
  const response = await api.post(url, data, config);
  return response.data;
}, 500); // 500ms debounce for POST requests

/**
 * Hook for debounced search functionality
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<T | null>(null);
  
  const debouncedSearchFn = useDebounce(async (query: string) => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchFn(query);
      setResults(data);
    } catch (err) {
      setError(err as Error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, delay);
  
  return { search: debouncedSearchFn, loading, error, results };
}