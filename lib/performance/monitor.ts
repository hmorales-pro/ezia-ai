/**
 * Performance monitoring utilities
 */

// Web Vitals monitoring
export function reportWebVitals(metric: any) {
  if (metric.label === 'web-vital') {
    console.log(metric);
    
    // You can send metrics to analytics service here
    // Example: sendToAnalytics(metric)
  }
}

// Component render performance tracking
export function measureComponentPerformance(componentName: string) {
  if (typeof window === 'undefined') return;
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 100) {
      console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  };
}

// Memory usage monitoring
export function checkMemoryUsage() {
  if (typeof window === 'undefined') return;
  
  // @ts-ignore - performance.memory is not standard but available in Chrome
  if (performance.memory) {
    // @ts-ignore
    const memoryInfo = performance.memory;
    const usedMemoryMB = (memoryInfo.usedJSHeapSize / 1048576).toFixed(2);
    const totalMemoryMB = (memoryInfo.totalJSHeapSize / 1048576).toFixed(2);
    
    console.log(`Memory Usage: ${usedMemoryMB}MB / ${totalMemoryMB}MB`);
    
    // Warn if memory usage is high
    // @ts-ignore
    if (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit > 0.9) {
      console.warn('[Performance] High memory usage detected');
    }
  }
}

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource');
    const jsFiles = resources.filter(r => r.name.endsWith('.js'));
    const cssFiles = resources.filter(r => r.name.endsWith('.css'));
    
    const totalJsSize = jsFiles.reduce((acc, file) => acc + file.transferSize, 0);
    const totalCssSize = cssFiles.reduce((acc, file) => acc + file.transferSize, 0);
    
    console.log(`[Performance] JS Bundle: ${(totalJsSize / 1024).toFixed(2)}KB`);
    console.log(`[Performance] CSS Bundle: ${(totalCssSize / 1024).toFixed(2)}KB`);
  });
}

// API response time tracking
export function trackApiResponseTime(endpoint: string, startTime: number) {
  const duration = performance.now() - startTime;
  
  if (duration > 1000) {
    console.warn(`[Performance] Slow API call to ${endpoint}: ${duration.toFixed(2)}ms`);
  }
  
  return duration;
}