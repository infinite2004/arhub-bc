// Analytics and tracking utilities for AR Hub

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface UserBehavior {
  pageViews: number;
  timeOnPage: number;
  interactions: number;
  downloads: number;
  uploads: number;
  searches: number;
}

export interface ProjectAnalytics {
  views: number;
  downloads: number;
  shares: number;
  likes: number;
  comments: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

class AnalyticsManager {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private startTime: number;
  private pageStartTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.pageStartTime = Date.now();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track page views
    this.track('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden', {
          timeOnPage: Date.now() - this.pageStartTime,
        });
      } else {
        this.track('page_visible', {
          timeOnPage: Date.now() - this.pageStartTime,
        });
        this.pageStartTime = Date.now();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.track('page_unload', {
        timeOnPage: Date.now() - this.pageStartTime,
        totalSessionTime: Date.now() - this.startTime,
      });
      this.flushEvents();
    });

    // Track clicks on external links
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith(window.location.origin)) {
        this.track('external_link_click', {
          url: link.href,
          text: link.textContent?.trim(),
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.track('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
      });
    });

    // Track file downloads
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const downloadLink = target.closest('a[download]');
      if (downloadLink) {
        this.track('file_download', {
          fileName: downloadLink.getAttribute('download'),
          url: downloadLink.href,
        });
      }
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    };

    this.events.push(event);
    this.sendEvent(event);

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // Send to internal analytics endpoint
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  public trackPageView(page: string, properties?: Record<string, any>) {
    this.pageStartTime = Date.now();
    this.track('page_view', {
      page,
      ...properties,
    });
  }

  public trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  public trackProjectInteraction(projectId: string, action: string, properties?: Record<string, any>) {
    this.track('project_interaction', {
      projectId,
      action,
      ...properties,
    });
  }

  public trackSearch(query: string, results: number, filters?: Record<string, any>) {
    this.track('search', {
      query,
      resultsCount: results,
      filters,
    });
  }

  public trackUpload(fileName: string, fileSize: number, fileType: string, success: boolean) {
    this.track('file_upload', {
      fileName,
      fileSize,
      fileType,
      success,
    });
  }

  public trackError(error: string, context?: string, properties?: Record<string, any>) {
    this.track('error', {
      error,
      context,
      ...properties,
    });
  }

  public trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.track('performance', {
      metric,
      value,
      ...properties,
    });
  }

  public getSessionData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.startTime,
      eventsCount: this.events.length,
      timeOnPage: Date.now() - this.pageStartTime,
      totalSessionTime: Date.now() - this.startTime,
    };
  }

  public flushEvents() {
    // Send all pending events
    this.events.forEach(event => this.sendEvent(event));
    this.events = [];
  }

  public getEvents() {
    return [...this.events];
  }
}

// Performance tracking utilities
export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializePerformanceTracking();
  }

  private initializePerformanceTracking() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric('lcp', lastEntry.startTime);
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observer setup failed:', error);
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          const fid = firstEntry.processingStart - firstEntry.startTime;
          this.recordMetric('fid', fid);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observer setup failed:', error);
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.recordMetric('cls', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observer setup failed:', error);
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.recordMetric('fcp', fcpEntry.startTime);
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observer setup failed:', error);
    }
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  public getMetrics() {
    const result: Record<string, { average: number; latest: number; count: number }> = {};
    for (const [name, values] of this.metrics) {
      result[name] = {
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        latest: values[values.length - 1],
        count: values.length,
      };
    }
    return result;
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// User behavior tracking
export class UserBehaviorTracker {
  private behavior: UserBehavior = {
    pageViews: 0,
    timeOnPage: 0,
    interactions: 0,
    downloads: 0,
    uploads: 0,
    searches: 0,
  };

  private startTime: number;
  private lastInteraction: number;

  constructor() {
    this.startTime = Date.now();
    this.lastInteraction = Date.now();
    this.initializeTracking();
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track interactions
    ['click', 'scroll', 'keydown', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.behavior.interactions++;
        this.lastInteraction = Date.now();
      }, { passive: true });
    });

    // Track time on page
    setInterval(() => {
      this.behavior.timeOnPage = Date.now() - this.startTime;
    }, 1000);
  }

  public trackPageView() {
    this.behavior.pageViews++;
  }

  public trackDownload() {
    this.behavior.downloads++;
  }

  public trackUpload() {
    this.behavior.uploads++;
  }

  public trackSearch() {
    this.behavior.searches++;
  }

  public getBehavior(): UserBehavior {
    return { ...this.behavior };
  }

  public getEngagementScore(): number {
    const timeScore = Math.min(this.behavior.timeOnPage / 60000, 10); // Max 10 points for 10+ minutes
    const interactionScore = Math.min(this.behavior.interactions / 10, 5); // Max 5 points for 50+ interactions
    const actionScore = (this.behavior.downloads + this.behavior.uploads + this.behavior.searches) * 2; // 2 points per action
    
    return Math.min(timeScore + interactionScore + actionScore, 20); // Max 20 points
  }
}

// Export singleton instances
export const analytics = new AnalyticsManager();
export const performanceTracker = new PerformanceTracker();
export const userBehaviorTracker = new UserBehaviorTracker();

// Utility functions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  analytics.track(eventName, properties);
}

export function trackPageView(page: string, properties?: Record<string, any>) {
  analytics.trackPageView(page, properties);
  userBehaviorTracker.trackPageView();
}

export function trackUserAction(action: string, properties?: Record<string, any>) {
  analytics.trackUserAction(action, properties);
}

export function trackProjectInteraction(projectId: string, action: string, properties?: Record<string, any>) {
  analytics.trackProjectInteraction(projectId, action, properties);
}

export function trackSearch(query: string, results: number, filters?: Record<string, any>) {
  analytics.trackSearch(query, results, filters);
  userBehaviorTracker.trackSearch();
}

export function trackUpload(fileName: string, fileSize: number, fileType: string, success: boolean) {
  analytics.trackUpload(fileName, fileSize, fileType, success);
  if (success) {
    userBehaviorTracker.trackUpload();
  }
}

export function trackDownload(fileName: string, fileSize: number) {
  analytics.track('file_download', { fileName, fileSize });
  userBehaviorTracker.trackDownload();
}

export function trackError(error: string, context?: string, properties?: Record<string, any>) {
  analytics.trackError(error, context, properties);
}

export function trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
  analytics.trackPerformance(metric, value, properties);
}

// React hook for analytics
export function useAnalytics() {
  return {
    track: trackEvent,
    trackPageView,
    trackUserAction,
    trackProjectInteraction,
    trackSearch,
    trackUpload,
    trackDownload,
    trackError,
    trackPerformance,
    getSessionData: () => analytics.getSessionData(),
    getBehavior: () => userBehaviorTracker.getBehavior(),
    getEngagementScore: () => userBehaviorTracker.getEngagementScore(),
  };
}
