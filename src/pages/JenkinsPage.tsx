"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  Calendar,
  ExternalLink,
  Play,
  GitBranch,
} from "lucide-react"
import { apiService } from "../services/api"
import type { JenkinsBuild, JenkinsCoverage, JenkinsTestResult } from "../types"
import Loader from "../components/ui/SquidLoader"

const JenkinsPage: React.FC = () => {
  const [builds, setBuilds] = useState<JenkinsBuild[]>([])
  const [coverage, setCoverage] = useState<JenkinsCoverage[]>([])
  const [testResults, setTestResults] = useState<JenkinsTestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"builds" | "coverage" | "tests">("builds")

  useEffect(() => {
    loadJenkinsData()
  }, [])

  const loadJenkinsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [buildsData, coverageData, testData] = await Promise.all([
        apiService.getJenkinsBuilds(),
        apiService.getJenkinsCoverage(),
        apiService.getJenkinsTestResults(),
      ])

      setBuilds(Array.isArray(buildsData) ? buildsData : [])
      setCoverage(Array.isArray(coverageData) ? coverageData : [])
      setTestResults(Array.isArray(testData) ? testData : [])
    } catch (err) {
      setError("Failed to load Jenkins data. Please check your Jenkins configuration.")
      console.error("Failed to load Jenkins data:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getSuccessRate = () => {
    if (builds.length === 0) return 0
    const successfulBuilds = builds.filter((build) => build.result === "SUCCESS").length
    return Math.round((successfulBuilds / builds.length) * 100)
  }

  const getLatestCoverage = () => {
    if (coverage.length === 0) return null
    return coverage.sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  const getLatestTestResult = () => {
    if (testResults.length === 0) return null
    return testResults.sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 flex flex-col items-center justify-center">
        <div className="mb-2">
          <Loader />
        </div>
      </div>
    );
  }
  
  

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="p-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={40} className="text-red-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-zinc-200 mb-2">{error}</p>
                <p className="text-zinc-400">Check your Jenkins configuration in Settings</p>
              </div>
              <button
                onClick={loadJenkinsData}
                className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-200 rounded-xl transition-colors border border-zinc-700/50 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const latestCoverage = getLatestCoverage()
  const latestTestResult = getLatestTestResult()

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <Server className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Jenkins Integration</h1>
              <p className="text-zinc-400 mt-1">Monitor builds, coverage, and test results</p>
            </div>
          </div>
          <button
            onClick={loadJenkinsData}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-200 rounded-xl transition-all duration-200 border border-zinc-700/50 font-medium"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Total Builds</p>
                <p className="text-2xl font-bold text-zinc-100">{builds.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-zinc-100">{getSuccessRate()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Coverage</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {latestCoverage ? Math.round(latestCoverage.lineCoverage) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Tests Passed</p>
                <p className="text-2xl font-bold text-zinc-100">{latestTestResult ? latestTestResult.passCount : 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-2">
          <div className="flex space-x-2">
            {[
              { id: "builds" as const, label: "Build History", icon: Activity },
              { id: "coverage" as const, label: "Coverage Trends", icon: BarChart3 },
              { id: "tests" as const, label: "Test Results", icon: CheckCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-zinc-800/70 text-zinc-100 shadow-lg"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
          {activeTab === "builds" && (
            <div>
              <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-zinc-100">Build History</h3>
                  <span className="text-sm text-zinc-400">Latest build activity</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Build #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Started
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {builds.map((build) => (
                      <tr key={build.number} className="hover:bg-zinc-800/20 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={build.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
                          >
                            <span>#{build.number}</span>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {build.result === "SUCCESS" ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="text-emerald-400" size={16} />
                                <span className="text-sm font-medium text-emerald-400">Success</span>
                              </div>
                            ) : build.result === "FAILURE" ? (
                              <div className="flex items-center gap-2">
                                <XCircle className="text-red-400" size={16} />
                                <span className="text-sm font-medium text-red-400">Failed</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Clock className="text-yellow-400" size={16} />
                                <span className="text-sm font-medium text-yellow-400">In Progress</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 font-medium">
                          {build.duration ? formatDuration(build.duration) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-zinc-500" />
                            <span className="text-sm text-zinc-400">{formatDate(build.timestamp)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {builds.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Server size={32} className="text-zinc-500" />
                    </div>
                    <p className="font-medium text-zinc-400">No build data available</p>
                    <p className="text-sm text-zinc-500 mt-1">Builds will appear here once Jenkins is configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "coverage" && (
            <div>
              <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-zinc-100">Coverage History</h3>
                  <span className="text-sm text-zinc-400">Track test coverage over time</span>
                </div>
              </div>
              <div className="p-6">
                {coverage.length > 0 ? (
                  <div className="space-y-6">
                    {coverage
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((cov) => (
                        <div key={cov.buildNumber} className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                <BarChart3 size={20} className="text-purple-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-zinc-100">Build #{cov.buildNumber}</h4>
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                  <Calendar size={14} />
                                  <span>{formatDate(cov.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                              { label: "Line", value: cov.lineCoverage, color: "text-blue-400" },
                              { label: "Branch", value: cov.branchCoverage, color: "text-emerald-400" },
                              { label: "Method", value: cov.methodCoverage, color: "text-purple-400" },
                              { label: "Class", value: cov.classCoverage, color: "text-orange-400" },
                              { label: "Instruction", value: cov.instructionCoverage, color: "text-pink-400" },
                              { label: "Complexity", value: cov.complexityCoverage, color: "text-cyan-400" },
                            ].map((metric) => (
                              <div key={metric.label} className="text-center">
                                <div className="text-sm text-zinc-400 font-medium mb-1">{metric.label}</div>
                                <div className={`text-xl font-bold ${metric.color}`}>{Math.round(metric.value)}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 size={32} className="text-zinc-500" />
                    </div>
                    <p className="font-medium text-zinc-400">No coverage data available</p>
                    <p className="text-sm text-zinc-500 mt-1">Coverage reports will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tests" && (
            <div>
              <div className="p-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-zinc-100">Test Results</h3>
                  <span className="text-sm text-zinc-400">Detailed test execution results</span>
                </div>
              </div>
              <div className="p-6">
                {testResults.length > 0 ? (
                  <div className="space-y-6">
                    {testResults
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((result) => (
                        <div
                          key={result.buildNumber}
                          className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-6"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                <CheckCircle size={20} className="text-emerald-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-zinc-100">Build #{result.buildNumber}</h4>
                                <div className="flex items-center gap-4 text-sm text-zinc-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{formatDate(result.timestamp)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>Duration: {formatDuration(result.duration)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div className="text-center">
                              <div className="text-sm text-zinc-400 font-medium mb-1">Total</div>
                              <div className="text-2xl font-bold text-zinc-100">{result.totalCount}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-emerald-400 font-medium mb-1">Passed</div>
                              <div className="text-2xl font-bold text-emerald-400">{result.passCount}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-red-400 font-medium mb-1">Failed</div>
                              <div className="text-2xl font-bold text-red-400">{result.failCount}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-yellow-400 font-medium mb-1">Skipped</div>
                              <div className="text-2xl font-bold text-yellow-400">{result.skipCount}</div>
                            </div>
                          </div>
                          {result.suites && result.suites.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                                <Play size={14} />
                                Test Suites:
                              </h5>
                              <div className="space-y-2">
                                {result.suites.map((suite, idx) => (
                                  <div key={idx} className="bg-zinc-900/50 border border-zinc-700/30 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono text-sm text-zinc-300">{suite.name}</span>
                                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <Clock size={12} />
                                        <span>{formatDuration(suite.duration)}</span>
                                      </div>
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">{suite.cases.length} test cases</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-zinc-500" />
                    </div>
                    <p className="font-medium text-zinc-400">No test results available</p>
                    <p className="text-sm text-zinc-500 mt-1">Test results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JenkinsPage
