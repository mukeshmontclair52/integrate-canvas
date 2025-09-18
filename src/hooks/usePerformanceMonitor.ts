import { useState, useCallback } from 'react';
import { PerformanceMetrics, ResourceMetric, NetworkCall } from '@/types/performance';

export const usePerformanceMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const startMonitoring = useCallback(async (url: string): Promise<PerformanceMetrics> => {
    setIsMonitoring(true);
    
    try {
      // Create a hidden iframe to monitor the page
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox.add('allow-same-origin', 'allow-scripts');
      document.body.appendChild(iframe);

      const startTime = performance.now();
      
      const metricsPromise = new Promise<PerformanceMetrics>((resolve) => {
        iframe.onload = () => {
          setTimeout(() => {
            try {
              const endTime = performance.now();
              const loadTime = endTime - startTime;

              // Get basic metrics
              const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              const paintEntries = performance.getEntriesByType('paint');
              const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

              // Process resources
              const resourceMetrics: ResourceMetric[] = resources.map(resource => ({
                name: resource.name,
                type: getResourceType(resource.name, resource.initiatorType),
                size: resource.transferSize || resource.encodedBodySize || 0,
                loadTime: resource.responseEnd - resource.startTime,
                status: (resource as any).responseStatus
              }));

              // Calculate totals
              const jsResources = resourceMetrics.filter(r => r.type === 'script');
              const cssResources = resourceMetrics.filter(r => r.type === 'stylesheet');
              const imageResources = resourceMetrics.filter(r => r.type === 'image');

              const performanceMetrics: PerformanceMetrics = {
                loadTime,
                domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
                firstPaint: paintEntries.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                largestContentfulPaint: 0, // Would need LCP observer
                resources: resourceMetrics,
                networkCalls: [], // Would need to intercept network calls
                totalJSSize: jsResources.reduce((sum, r) => sum + r.size, 0),
                totalCSSSize: cssResources.reduce((sum, r) => sum + r.size, 0),
                totalImageSize: imageResources.reduce((sum, r) => sum + r.size, 0),
                jsFileCount: jsResources.length,
                cssFileCount: cssResources.length,
                imageFileCount: imageResources.length,
                cookies: getCookies(),
                headers: getHeaders(),
                userAgent: navigator.userAgent,
                viewport: {
                  width: window.innerWidth,
                  height: window.innerHeight
                }
              };

              resolve(performanceMetrics);
            } catch (error) {
              console.error('Error collecting metrics:', error);
              resolve(getBasicMetrics(performance.now() - startTime));
            } finally {
              document.body.removeChild(iframe);
            }
          }, 2000); // Wait for page to fully load
        };
      });

      iframe.src = url;
      const result = await metricsPromise;
      setMetrics(result);
      return result;
    } catch (error) {
      console.error('Monitoring error:', error);
      return getBasicMetrics(0);
    } finally {
      setIsMonitoring(false);
    }
  }, []);

  return {
    isMonitoring,
    metrics,
    startMonitoring
  };
};

function getResourceType(url: string, initiatorType: string): ResourceMetric['type'] {
  if (initiatorType === 'script' || url.includes('.js')) return 'script';
  if (initiatorType === 'link' || url.includes('.css')) return 'stylesheet';
  if (initiatorType === 'img' || /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url)) return 'image';
  if (initiatorType === 'fetch' || initiatorType === 'xmlhttprequest') return 'fetch';
  if (initiatorType === 'navigation') return 'document';
  return 'other';
}

function getCookies() {
  return document.cookie.split(';').map(cookie => {
    const [name, value] = cookie.trim().split('=');
    return { name: name || '', value: value || '', domain: window.location.hostname };
  }).filter(c => c.name);
}

function getHeaders(): Record<string, string> {
  // In a real implementation, you'd need to intercept network requests
  // For now, return basic headers
  return {
    'User-Agent': navigator.userAgent,
    'Accept-Language': navigator.language,
    'Viewport': `${window.innerWidth}x${window.innerHeight}`
  };
}

function getBasicMetrics(loadTime: number): PerformanceMetrics {
  return {
    loadTime,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    resources: [],
    networkCalls: [],
    totalJSSize: 0,
    totalCSSSize: 0,
    totalImageSize: 0,
    jsFileCount: 0,
    cssFileCount: 0,
    imageFileCount: 0,
    cookies: getCookies(),
    headers: getHeaders(),
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
}