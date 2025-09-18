export interface ResourceMetric {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'document' | 'fetch' | 'other';
  size: number;
  loadTime: number;
  status?: number;
}

export interface NetworkCall {
  url: string;
  method: string;
  status: number;
  responseTime: number;
  size: number;
  type: string;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  resources: ResourceMetric[];
  networkCalls: NetworkCall[];
  totalJSSize: number;
  totalCSSSize: number;
  totalImageSize: number;
  jsFileCount: number;
  cssFileCount: number;
  imageFileCount: number;
  cookies: { name: string; value: string; domain: string }[];
  headers: Record<string, string>;
  userAgent: string;
  viewport: { width: number; height: number };
}

export interface EnhancedTestResult {
  id: string;
  url: string;
  timestamp: Date;
  device: "desktop" | "mobile" | "tablet";
  screenshot: string;
  name: string;
  metrics?: PerformanceMetrics;
}