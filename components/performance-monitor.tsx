"use client";

import { useEffect, useState } from "react";
import { performanceMonitor, realTimeTracker, getMemoryUsage } from "@/lib/performance";

interface PerformanceData {
  score: number;
  metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    tbt?: number;
  };
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  insights: string[];
}

export function PerformanceMonitor({ showDetails = false }: { showDetails?: boolean }) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start monitoring
    performanceMonitor.startMonitoring();

    // Update performance data every 5 seconds
    const interval = setInterval(() => {
      const metrics = performanceMonitor.getMetrics();
      const score = performanceMonitor.getPerformanceScore();
      const insights = performanceMonitor.getPerformanceInsights();
      const memory = getMemoryUsage();

      setPerformanceData({
        score,
        metrics: {
          lcp: metrics.largestContentfulPaint,
          fid: metrics.firstInputDelay,
          cls: metrics.cumulativeLayoutShift,
          tbt: metrics.totalBlockingTime,
        },
        memory,
        insights,
      });
    }, 5000);

    // Initial data load
    const initialMetrics = performanceMonitor.getMetrics();
    const initialScore = performanceMonitor.getPerformanceScore();
    const initialInsights = performanceMonitor.getPerformanceInsights();
    const initialMemory = getMemoryUsage();

    setPerformanceData({
      score: initialScore,
      metrics: {
        lcp: initialMetrics.largestContentfulPaint,
        fid: initialMetrics.firstInputDelay,
        cls: initialMetrics.cumulativeLayoutShift,
        tbt: initialMetrics.totalBlockingTime,
      },
      memory: initialMemory,
      insights: initialInsights,
    });

    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, []);

  if (!performanceData) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900";
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900";
    return "bg-red-100 dark:bg-red-900";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`mb-2 p-2 rounded-full shadow-lg transition-all duration-200 ${
          getScoreBg(performanceData.score)
        } ${getScoreColor(performanceData.score)} hover:scale-105`}
        title="Performance Monitor"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Performance Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-300">Performance Score</span>
              <span className={`text-sm font-bold ${getScoreColor(performanceData.score)}`}>
                {performanceData.score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  performanceData.score >= 90
                    ? "bg-green-500"
                    : performanceData.score >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${performanceData.score}%` }}
              />
            </div>
          </div>

          {/* Core Web Vitals */}
          {showDetails && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Core Web Vitals
              </h4>
              <div className="space-y-1 text-xs">
                {performanceData.metrics.lcp && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">LCP:</span>
                    <span className={performanceData.metrics.lcp <= 2500 ? "text-green-600" : "text-red-600"}>
                      {performanceData.metrics.lcp.toFixed(0)}ms
                    </span>
                  </div>
                )}
                {performanceData.metrics.fid && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">FID:</span>
                    <span className={performanceData.metrics.fid <= 100 ? "text-green-600" : "text-red-600"}>
                      {performanceData.metrics.fid.toFixed(0)}ms
                    </span>
                  </div>
                )}
                {performanceData.metrics.cls && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CLS:</span>
                    <span className={performanceData.metrics.cls <= 0.1 ? "text-green-600" : "text-red-600"}>
                      {performanceData.metrics.cls.toFixed(3)}
                    </span>
                  </div>
                )}
                {performanceData.metrics.tbt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">TBT:</span>
                    <span className={performanceData.metrics.tbt <= 200 ? "text-green-600" : "text-red-600"}>
                      {performanceData.metrics.tbt.toFixed(0)}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Memory Usage */}
          {performanceData.memory && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Memory Usage
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span>{performanceData.memory.used}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span>{performanceData.memory.total}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Limit:</span>
                  <span>{performanceData.memory.limit}MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Insights */}
          {performanceData.insights.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Optimization Tips
              </h4>
              <div className="space-y-1">
                {performanceData.insights.slice(0, 3).map((insight, index) => (
                  <p key={index} className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    • {insight}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [score, setScore] = useState(performanceMonitor.getPerformanceScore());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setScore(performanceMonitor.getPerformanceScore());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { metrics, score, insights: performanceMonitor.getPerformanceInsights() };
}
