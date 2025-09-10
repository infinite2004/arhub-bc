"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  MousePointer
} from 'lucide-react'
import { 
  performanceMonitor, 
  realTimeTracker, 
  checkPerformanceBudget, 
  getOptimizationSuggestions,
  getMemoryUsage,
  DEFAULT_BUDGET,
  type PerformanceMetrics
} from '@/lib/performance'

interface PerformanceDashboardProps {
  className?: string
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [realTimeMetrics, setRealTimeMetrics] = useState<Record<string, { average: number; trend: string; samples: number }>>({})
  const [memoryUsage, setMemoryUsage] = useState<{ used: number; total: number; limit: number } | null>(null)
  const [budgetCheck, setBudgetCheck] = useState<{ passed: boolean; violations: string[] }>({ passed: true, violations: [] })
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = performanceMonitor.getMetrics()
      setMetrics(currentMetrics)
      
      const budget = checkPerformanceBudget(currentMetrics)
      setBudgetCheck(budget)
      
      const optimizationSuggestions = getOptimizationSuggestions(currentMetrics)
      setSuggestions(optimizationSuggestions)
      
      const realTime = realTimeTracker.getAllMetrics()
      setRealTimeMetrics(realTime)
      
      const memory = getMemoryUsage()
      setMemoryUsage(memory)
    }

    // Initial update
    updateMetrics()

    // Set up interval for real-time updates
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  const startMonitoring = () => {
    performanceMonitor.startMonitoring()
    setIsMonitoring(true)
  }

  const stopMonitoring = () => {
    performanceMonitor.stopMonitoring()
    setIsMonitoring(false)
  }

  const exportMetrics = () => {
    const data = performanceMonitor.exportMetrics()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'degrading': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const formatMetric = (value: number | undefined, unit: string = 'ms') => {
    if (value === undefined) return 'N/A'
    return `${value.toFixed(2)}${unit}`
  }

  const getMetricStatus = (value: number | undefined, threshold: number, lowerIsBetter = true) => {
    if (value === undefined) return 'unknown'
    const isGood = lowerIsBetter ? value <= threshold : value >= threshold
    return isGood ? 'good' : 'poor'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-gray-600">Monitor your application's performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportMetrics}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(performanceMonitor.getPerformanceScore())}>
                {performanceMonitor.getPerformanceScore()}
              </span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <div className="text-right">
              <Badge variant={budgetCheck.passed ? 'default' : 'destructive'}>
                {budgetCheck.passed ? 'Within Budget' : 'Budget Exceeded'}
              </Badge>
              {budgetCheck.violations.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {budgetCheck.violations.length} violation(s)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="core-web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="real-time">Real-time Metrics</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
          <TabsTrigger value="suggestions">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="core-web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LCP */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Largest Contentful Paint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics.largestContentfulPaint)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={getMetricStatus(metrics.largestContentfulPaint, DEFAULT_BUDGET.lcp) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.largestContentfulPaint, DEFAULT_BUDGET.lcp) === 'good' ? 'Good' : 'Poor'}
                  </Badge>
                  <span className="text-xs text-gray-500">Target: {DEFAULT_BUDGET.lcp}ms</span>
                </div>
              </CardContent>
            </Card>

            {/* FID */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  First Input Delay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics.firstInputDelay)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={getMetricStatus(metrics.firstInputDelay, DEFAULT_BUDGET.fid) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.firstInputDelay, DEFAULT_BUDGET.fid) === 'good' ? 'Good' : 'Poor'}
                  </Badge>
                  <span className="text-xs text-gray-500">Target: {DEFAULT_BUDGET.fid}ms</span>
                </div>
              </CardContent>
            </Card>

            {/* CLS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Cumulative Layout Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics.cumulativeLayoutShift, '')}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={getMetricStatus(metrics.cumulativeLayoutShift, DEFAULT_BUDGET.cls) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.cumulativeLayoutShift, DEFAULT_BUDGET.cls) === 'good' ? 'Good' : 'Poor'}
                  </Badge>
                  <span className="text-xs text-gray-500">Target: {DEFAULT_BUDGET.cls}</span>
                </div>
              </CardContent>
            </Card>

            {/* TBT */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Total Blocking Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(metrics.totalBlockingTime)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={getMetricStatus(metrics.totalBlockingTime, DEFAULT_BUDGET.tbt) === 'good' ? 'default' : 'destructive'}
                  >
                    {getMetricStatus(metrics.totalBlockingTime, DEFAULT_BUDGET.tbt) === 'good' ? 'Good' : 'Poor'}
                  </Badge>
                  <span className="text-xs text-gray-500">Target: {DEFAULT_BUDGET.tbt}ms</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatMetric(metrics.pageLoadTime)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">First Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatMetric(metrics.firstContentfulPaint)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time to Interactive</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatMetric(metrics.timeToInteractive)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="real-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance Tracking</CardTitle>
              <CardDescription>Track performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(realTimeMetrics).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(realTimeMetrics).map(([name, data]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <p className="text-sm text-gray-500">{data.samples} samples</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">{data.average.toFixed(2)}ms</div>
                          <div className="text-sm text-gray-500">Average</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(data.trend)}
                          <span className="text-sm capitalize">{data.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No real-time metrics available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>Memory usage and system performance</CardDescription>
            </CardHeader>
            <CardContent>
              {memoryUsage ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Memory Usage</span>
                    <span className="font-bold">{memoryUsage.used}MB / {memoryUsage.total}MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(memoryUsage.used / memoryUsage.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Limit: {memoryUsage.limit}MB
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Memory usage not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Optimization Suggestions
              </CardTitle>
              <CardDescription>Recommendations to improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{suggestion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800">Great! No optimization suggestions at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

