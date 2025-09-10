// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    // Check if Performance API is supported
    if (!("PerformanceObserver" in window)) {
      console.warn("PerformanceObserver not supported");
      return;
    }

    this.setupObservers();
    this.captureInitialMetrics();
  }

  private setupObservers() {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn("LCP observer setup failed:", error);
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          this.metrics.firstInputDelay = firstEntry.processingStart - firstEntry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn("FID observer setup failed:", error);
    }

    // Layout Shifts
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn("CLS observer setup failed:", error);
    }

    // Long Tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        let totalBlockingTime = 0;
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50;
          }
        }
        this.metrics.totalBlockingTime = totalBlockingTime;
      });
      longTaskObserver.observe({ entryType: "longtask" });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.warn("Long task observer setup failed:", error);
    }
  }

  private captureInitialMetrics() {
    if (document.readyState === "complete") {
      this.capturePageLoadMetrics();
    } else {
      window.addEventListener("load", () => {
        this.capturePageLoadMetrics();
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.metrics.domContentLoaded = performance.now();
      });
    } else {
      this.metrics.domContentLoaded = performance.now();
    }
  }

  private capturePageLoadMetrics() {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.metrics.pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
      this.metrics.timeToInteractive = navigationEntry.domInteractive - navigationEntry.fetchStart;
    }

    // First Contentful Paint
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(entry => entry.name === "first-contentful-paint");
    if (fcpEntry) {
      this.metrics.firstContentfulPaint = fcpEntry.startTime;
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 100;

    // LCP scoring (0-25 points)
    if (metrics.largestContentfulPaint) {
      if (metrics.largestContentfulPaint <= 2500) score -= 0;
      else if (metrics.largestContentfulPaint <= 4000) score -= 10;
      else score -= 25;
    }

    // FID scoring (0-25 points)
    if (metrics.firstInputDelay) {
      if (metrics.firstInputDelay <= 100) score -= 0;
      else if (metrics.firstInputDelay <= 300) score -= 10;
      else score -= 25;
    }

    // CLS scoring (0-25 points)
    if (metrics.cumulativeLayoutShift) {
      if (metrics.cumulativeLayoutShift <= 0.1) score -= 0;
      else if (metrics.cumulativeLayoutShift <= 0.25) score -= 10;
      else score -= 25;
    }

    // TBT scoring (0-25 points)
    if (metrics.totalBlockingTime) {
      if (metrics.totalBlockingTime <= 200) score -= 0;
      else if (metrics.totalBlockingTime <= 600) score -= 10;
      else score -= 25;
    }

    return Math.max(0, score);
  }

  public getPerformanceInsights(): string[] {
    const insights: string[] = [];
    const metrics = this.getMetrics();

    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 4000) {
      insights.push("Consider optimizing images and reducing render-blocking resources to improve LCP");
    }

    if (metrics.firstInputDelay && metrics.firstInputDelay > 300) {
      insights.push("Break up long tasks and optimize JavaScript execution to improve FID");
    }

    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.25) {
      insights.push("Avoid layout shifts by setting explicit dimensions for images and other elements");
    }

    if (metrics.totalBlockingTime && metrics.totalBlockingTime > 600) {
      insights.push("Optimize JavaScript bundles and use code splitting to reduce blocking time");
    }

    return insights;
  }

  public startMonitoring() {
    this.isMonitoring = true;
    console.log("Performance monitoring started");
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log("Performance monitoring stopped");
  }

  public exportMetrics(): string {
    return JSON.stringify({
      metrics: this.getMetrics(),
      score: this.getPerformanceScore(),
      insights: this.getPerformanceInsights(),
      timestamp: new Date().toISOString(),
    }, null, 2);
  }
}

// Utility functions for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
}

// Image optimization utilities
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function lazyLoadImages() {
  if (typeof window === "undefined") return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || "";
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach(img => {
    imageObserver.observe(img);
  });
}

// Bundle analysis utilities
export function getBundleSize(): number {
  if (typeof window === "undefined") return 0;
  
  // This is a rough estimation - in production you'd want more accurate metrics
  const scripts = document.querySelectorAll("script[src]");
  let totalSize = 0;
  
  scripts.forEach(script => {
    const src = script.getAttribute("src");
    if (src && src.includes("chunk") || src.includes("bundle")) {
      // Estimate size based on common patterns
      totalSize += 100; // KB estimation
    }
  });
  
  return totalSize;
}

// Memory usage monitoring
export function getMemoryUsage(): { used: number; total: number; limit: number } | null {
  if (typeof window === "undefined" || !("memory" in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  };
}

// Real-time performance tracking
export class RealTimePerformanceTracker {
  private metrics: Map<string, number[]> = new Map();
  private maxSamples = 100;

  public trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const samples = this.metrics.get(name)!;
    samples.push(value);
    
    // Keep only the last N samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  public getAverageMetric(name: string): number {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) return 0;
    
    return samples.reduce((sum, value) => sum + value, 0) / samples.length;
  }

  public getMetricTrend(name: string): 'improving' | 'degrading' | 'stable' {
    const samples = this.metrics.get(name);
    if (!samples || samples.length < 10) return 'stable';
    
    const recent = samples.slice(-5);
    const older = samples.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, value) => sum + value, 0) / recent.length;
    const olderAvg = older.reduce((sum, value) => sum + value, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'degrading';
    if (change < -0.1) return 'improving';
    return 'stable';
  }

  public getAllMetrics() {
    const result: Record<string, { average: number; trend: string; samples: number }> = {};
    
    for (const [name, samples] of this.metrics) {
      result[name] = {
        average: this.getAverageMetric(name),
        trend: this.getMetricTrend(name),
        samples: samples.length
      };
    }
    
    return result;
  }
}

// Performance budget monitoring
export interface PerformanceBudget {
  lcp: number; // ms
  fid: number; // ms
  cls: number; // score
  tbt: number; // ms
  bundleSize: number; // KB
}

export const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  tbt: 200,
  bundleSize: 500
};

export function checkPerformanceBudget(metrics: Partial<PerformanceMetrics>, budget: PerformanceBudget = DEFAULT_BUDGET): { passed: boolean; violations: string[] } {
  const violations: string[] = [];
  
  if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > budget.lcp) {
    violations.push(`LCP: ${metrics.largestContentfulPaint.toFixed(0)}ms > ${budget.lcp}ms`);
  }
  
  if (metrics.firstInputDelay && metrics.firstInputDelay > budget.fid) {
    violations.push(`FID: ${metrics.firstInputDelay.toFixed(0)}ms > ${budget.fid}ms`);
  }
  
  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > budget.cls) {
    violations.push(`CLS: ${metrics.cumulativeLayoutShift.toFixed(3)} > ${budget.cls}`);
  }
  
  if (metrics.totalBlockingTime && metrics.totalBlockingTime > budget.tbt) {
    violations.push(`TBT: ${metrics.totalBlockingTime.toFixed(0)}ms > ${budget.tbt}ms`);
  }
  
  return {
    passed: violations.length === 0,
    violations
  };
}

// Performance reporting utilities
export function reportToAnalytics(metrics: Partial<PerformanceMetrics>, customData?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  // Example: Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'performance_metrics', {
      event_category: 'Performance',
      event_label: 'Core Web Vitals',
      custom_map: {
        lcp: metrics.largestContentfulPaint,
        fid: metrics.firstInputDelay,
        cls: metrics.cumulativeLayoutShift,
        tbt: metrics.totalBlockingTime,
        ...customData
      }
    });
  }
  
  // Example: Send to custom analytics endpoint
  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...customData
    })
  }).catch(error => {
    console.warn('Failed to report performance metrics:', error);
  });
}

// Performance optimization suggestions
export function getOptimizationSuggestions(metrics: Partial<PerformanceMetrics>): string[] {
  const suggestions: string[] = [];
  
  if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 4000) {
    suggestions.push('Optimize images: Use WebP format, implement lazy loading, and compress images');
    suggestions.push('Reduce server response time: Use CDN, enable compression, optimize database queries');
    suggestions.push('Eliminate render-blocking resources: Inline critical CSS, defer non-critical JavaScript');
  }
  
  if (metrics.firstInputDelay && metrics.firstInputDelay > 300) {
    suggestions.push('Break up long tasks: Split large JavaScript operations into smaller chunks');
    suggestions.push('Optimize JavaScript: Remove unused code, use code splitting, minimize bundle size');
    suggestions.push('Use Web Workers: Move heavy computations off the main thread');
  }
  
  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.25) {
    suggestions.push('Set explicit dimensions: Add width and height attributes to images and videos');
    suggestions.push('Reserve space: Use aspect-ratio CSS property or padding-bottom technique');
    suggestions.push('Avoid dynamic content insertion: Pre-allocate space for dynamically loaded content');
  }
  
  if (metrics.totalBlockingTime && metrics.totalBlockingTime > 600) {
    suggestions.push('Code splitting: Split large bundles into smaller, more manageable chunks');
    suggestions.push('Tree shaking: Remove unused code from your bundles');
    suggestions.push('Lazy loading: Load non-critical JavaScript only when needed');
  }
  
  return suggestions;
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const realTimeTracker = new RealTimePerformanceTracker();
