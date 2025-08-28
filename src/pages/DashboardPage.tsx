"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  Target,
  Zap,
  Calendar,
  RefreshCw,
  TestTube,
  Settings,
  Server,
  ChevronDown,
  Users,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import { apiService } from "../services/api"
import { getDashboardPreferences } from "../utils/preferences"
import JenkinsDashboard from "../components/JenkinsDashboard"
import ErrorBoundary from "../components/ErrorBoundary"
import Loader from "../components/ui/Loader"
// import CodeChatbot from "../components/CodeChatbot"

interface DashboardStats {
  totalTests: number
  successfulTests: number
  failedTests: number
  avgGenerationTime: number
  testCoverage: number
  activeProjects: number
  testsToday: number
  testsThisWeek: number
}

interface JenkinsTestResults {
  passCount: number
  failCount: number
  totalCount: number
  successRate: number
}

interface TestTrend {
  date: string
  successful: number
  failed: number
  total: number
}

interface CoverageData {
  className: string
  coverage: number
  methods: number
  testedMethods: number
  lastUpdated: string
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    avgGenerationTime: 0,
    testCoverage: 0,
    activeProjects: 0,
    testsToday: 0,
    testsThisWeek: 0,
  })
  const [trends, setTrends] = useState<TestTrend[]>([])
  const [coverageData, setCoverageData] = useState<CoverageData[]>([])
  const [jenkinsTestResults, setJenkinsTestResults] = useState<JenkinsTestResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(() => getDashboardPreferences().defaultTimeRange)
  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null)
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatbotMinimized, setChatbotMinimized] = useState(false)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const [statsData, trendsData, coverageDataRes] = await Promise.all([
        apiService.getDashboardStats(timeRange),
        apiService.getTestTrends(timeRange),
        apiService.getCoverageData(),
      ])

      try {
        const jenkinsResults = await apiService.getJenkinsTestResults()
        if (jenkinsResults && jenkinsResults.length > 0) {
          const latestResult = jenkinsResults[0]
          setJenkinsTestResults({
            passCount: latestResult.passCount,
            failCount: latestResult.failCount,
            totalCount: latestResult.totalCount,
            successRate:
              latestResult.totalCount > 0 ? Math.round((latestResult.passCount / latestResult.totalCount) * 100) : 0,
          })
        }
      } catch (jenkinsError) {
        console.warn("Failed to load Jenkins test results:", jenkinsError)
        setJenkinsTestResults(null)
      }

      const previousTimeRange = timeRange === "24h" ? "48h" : timeRange === "7d" ? "14d" : "60d"
      const previousStatsData = await apiService.getDashboardStats(previousTimeRange)

      setStats(statsData)
      setTrends(trendsData)
      setCoverageData(coverageDataRes)
      setPreviousStats(previousStatsData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    const preferences = getDashboardPreferences()
    if (preferences.refreshInterval > 0) {
      const interval = setInterval(loadDashboardData, preferences.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [loadDashboardData])

  const getSuccessRate = () => {
    if (jenkinsTestResults && jenkinsTestResults.totalCount > 0) {
      return jenkinsTestResults.successRate
    }
    if (stats.totalTests === 0) return 0
    return Math.round((stats.successfulTests / stats.totalTests) * 100)
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0 || isNaN(previous) || isNaN(current)) return undefined
    const change = ((current - previous) / previous) * 100
    return Math.round(change)
  }

  const getChangeType = (current: number, previous: number, isInverse = false) => {
    if (previous === 0 || isNaN(previous) || isNaN(current)) return "neutral"
    const isPositive = current > previous
    if (isInverse) {
      return isPositive ? "negative" : "positive"
    }
    return isPositive ? "positive" : "negative"
  }

  const getPreviousSuccessRate = () => {
    if (!previousStats || previousStats.totalTests === 0) return 0
    return Math.round((previousStats.successfulTests / previousStats.totalTests) * 100)
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    change?: number
    changeType?: "positive" | "negative" | "neutral"
    icon: React.ReactNode
    iconBg: string
    iconColor: string
  }> = ({ title, value, change, changeType, icon, iconBg, iconColor }) => {
    const preferences = getDashboardPreferences()

    const getChangeIcon = () => {
      if (changeType === "positive") return <ArrowUpRight size={12} />
      if (changeType === "negative") return <ArrowDownRight size={12} />
      return <Minus size={12} />
    }

    const getChangeColor = () => {
      if (changeType === "positive") return "text-emerald-600 bg-emerald-50"
      if (changeType === "negative") return "text-red-600 bg-red-50"
      return "text-zinc-600 bg-zinc-50"
    }
    
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:bg-zinc-900/70 transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}
          >
            <div className={iconColor}>{icon}</div>
          </div>
          {change !== undefined && preferences.showChangeIndicators && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</div>
          <div className="text-sm text-zinc-400 font-medium">{title}</div>
        </div>
      </div>
    )
  }

  const TrendChart: React.FC = () => (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Test Generation Trends</h3>
          <p className="text-sm text-zinc-400 mt-1">Track your testing progress over time</p>
        </div>
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "24h" | "7d" | "30d")}
            className="appearance-none bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2 pr-10 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all duration-200"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      <div className="h-64 relative overflow-hidden rounded-xl bg-zinc-950/50 p-4">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="successGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="failureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = 180 - (value / 100) * 160
            return (
              <g key={value}>
                <line x1="40" y1={y} x2="760" y2={y} stroke="#27272a" strokeWidth="1" opacity="0.5" />
                <text x="35" y={y + 4} textAnchor="end" className="text-xs fill-zinc-500">
                  {value}
                </text>
              </g>
            )
          })}

          {/* Chart lines and areas */}
          {trends.length > 0 &&
            (() => {
              const maxTotal = Math.max(...trends.map((t) => t.total), 1)
              const xStep = 720 / Math.max(trends.length - 1, 1)

              const successPoints = trends
                .map((trend, index) => {
                  const x = 50 + index * xStep
                  const y = 180 - (trend.successful / maxTotal) * 160
                  return `${x},${y}`
                })
                .join(" ")

              const failurePoints = trends
                .map((trend, index) => {
                  const x = 50 + index * xStep
                  const y = 180 - (trend.failed / maxTotal) * 160
                  return `${x},${y}`
                })
                .join(" ")

              return (
                <g>
                  {/* Success area */}
                  <path
                    d={`M 50,180 L ${successPoints} L ${50 + (trends.length - 1) * xStep},180 Z`}
                    fill="url(#successGradient)"
                  />
                  {/* Failure area */}
                  <path
                    d={`M 50,180 L ${failurePoints} L ${50 + (trends.length - 1) * xStep},180 Z`}
                    fill="url(#failureGradient)"
                  />

                  {/* Success line */}
                  <polyline
                    points={successPoints}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Failure line */}
                  <polyline
                    points={failurePoints}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {trends.map((trend, index) => {
                    const x = 50 + index * xStep
                    const successY = 180 - (trend.successful / maxTotal) * 160
                    const failureY = 180 - (trend.failed / maxTotal) * 160

                    return (
                      <g key={index}>
                        <circle cx={x} cy={successY} r="4" fill="#10b981" stroke="#18181b" strokeWidth="2" />
                        <circle cx={x} cy={failureY} r="4" fill="#ef4444" stroke="#18181b" strokeWidth="2" />
                      </g>
                    )
                  })}
                </g>
              )
            })()}

          {/* X-axis */}
          <line x1="40" y1="180" x2="760" y2="180" stroke="#27272a" strokeWidth="1" />
          <line x1="40" y1="20" x2="40" y2="180" stroke="#27272a" strokeWidth="1" />
        </svg>
      </div>

      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-sm text-zinc-400 font-medium">Successful</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-zinc-400 font-medium">Failed</span>
        </div>
      </div>
    </div>
  )

  const QuickActions: React.FC = () => (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-100">Quick Actions</h3>
        <p className="text-sm text-zinc-400 mt-1">Get started with common tasks</p>
      </div>
      <div className="space-y-3">
        {[
          {
            to: "/generator",
            icon: TestTube,
            title: "Generate New Tests",
            description: "Upload files and create test cases",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
          },
          {
            to: "/history",
            icon: BarChart3,
            title: "View Test History",
            description: "Browse and manage generated tests",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-400",
          },
          {
            to: "/jenkins",
            icon: Server,
            title: "Jenkins Dashboard",
            description: "View builds and coverage data",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-400",
          },
          {
            to: "/settings",
            icon: Settings,
            title: "Configure Jenkins",
            description: "Set up Jenkins integration",
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-400",
          },
        ].map((action, index) => (
          <Link
            key={index}
            to={action.to}
            className="flex items-center gap-4 p-4 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-xl transition-all duration-200 group border border-zinc-800/30 hover:border-zinc-700/50"
          >
            <div
              className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
            >
              <action.icon className={`${action.iconColor}`} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                {action.title}
              </div>
              <div className="text-sm text-zinc-400 truncate">{action.description}</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
            <p className="text-zinc-400 mt-1">Monitor your test generation and coverage metrics</p>
          </div>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "24h" | "7d" | "30d" | "all")}
              className="appearance-none bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-2 pr-10 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all duration-200"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tests Generated"
            value={stats.totalTests.toLocaleString()}
            change={previousStats ? calculateChange(stats.totalTests, previousStats.totalTests) : undefined}
            changeType={previousStats ? getChangeType(stats.totalTests, previousStats.totalTests) : "neutral"}
            icon={<FileText size={20} />}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-400"
          />
          <StatCard
            title="Success Rate"
            value={`${getSuccessRate()}%`}
            change={previousStats ? calculateChange(getSuccessRate(), getPreviousSuccessRate()) : undefined}
            changeType={previousStats ? getChangeType(getSuccessRate(), getPreviousSuccessRate()) : "neutral"}
            icon={<CheckCircle size={20} />}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Average Coverage"
            value={`${stats.testCoverage}%`}
            change={previousStats ? calculateChange(stats.testCoverage, previousStats.testCoverage) : undefined}
            changeType={previousStats ? getChangeType(stats.testCoverage, previousStats.testCoverage) : "neutral"}
            icon={<Target size={20} />}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-400"
          />
          <StatCard
            title="Avg Generation Time"
            value={`${stats.avgGenerationTime}s`}
            change={
              previousStats ? calculateChange(stats.avgGenerationTime, previousStats.avgGenerationTime) : undefined
            }
            changeType={
              previousStats ? getChangeType(stats.avgGenerationTime, previousStats.avgGenerationTime, true) : "neutral"
            }
            icon={<Zap size={20} />}
            iconBg="bg-orange-500/10"
            iconColor="text-orange-400"
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tests Today"
            value={stats.testsToday}
            icon={<Calendar size={20} />}
            iconBg="bg-cyan-500/10"
            iconColor="text-cyan-400"
          />
          <StatCard
            title="Tests This Week"
            value={stats.testsThisWeek}
            change={previousStats ? calculateChange(stats.testsThisWeek, previousStats.testsThisWeek) : undefined}
            changeType={previousStats ? getChangeType(stats.testsThisWeek, previousStats.testsThisWeek) : "neutral"}
            icon={<TrendingUp size={20} />}
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-400"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<Users size={20} />}
            iconBg="bg-pink-500/10"
            iconColor="text-pink-400"
          />
          <StatCard
            title="Failed Tests"
            value={stats.failedTests}
            change={previousStats ? calculateChange(stats.failedTests, previousStats.failedTests) : undefined}
            changeType={previousStats ? getChangeType(stats.failedTests, previousStats.failedTests, true) : "neutral"}
            icon={<AlertTriangle size={20} />}
            iconBg="bg-red-500/10"
            iconColor="text-red-400"
          />
        </div>

        {/* Charts and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Jenkins Dashboard Section */}
        <div>
          <ErrorBoundary
            fallback={
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8">
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                      <AlertTriangle size={32} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-zinc-200">Jenkins Dashboard Unavailable</p>
                      <p className="text-sm text-zinc-400 mt-1">Configure Jenkins in Settings to view build data</p>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <JenkinsDashboard />
          </ErrorBoundary>
        </div>

        {/* Coverage Table
        <CoverageTable /> */}
      </div>

    </div>
  )
}

export default DashboardPage
