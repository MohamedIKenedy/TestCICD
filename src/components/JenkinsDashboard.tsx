// import React, { useState, useEffect } from 'react';
// import { 
//   Activity, 
//   CheckCircle, 
//   XCircle, 
//   Clock, 
//   TrendingUp, 
//   AlertTriangle,
//   RefreshCw,
//   Server,
//   BarChart3
// } from 'lucide-react';
// import { apiService } from '../services/api';
// import { JenkinsBuild, JenkinsCoverage, JenkinsTestResult } from '../types';

// interface JenkinsDashboardProps {
//   className?: string;
// }

// const JenkinsDashboard: React.FC<JenkinsDashboardProps> = ({ className = '' }) => {
//   const [builds, setBuilds] = useState<JenkinsBuild[]>([]);
//   const [coverage, setCoverage] = useState<JenkinsCoverage[]>([]);
//   const [testResults, setTestResults] = useState<JenkinsTestResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     loadJenkinsData();
//   }, []);

//   const loadJenkinsData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Check if Jenkins is configured first
//       const settings = await apiService.getJenkinsSettings().catch(() => null);
//       if (!settings) {
//         setError('Jenkins is not configured. Please configure Jenkins in Settings first.');
//         return;
//       }

//       const [buildsData, coverageData, testData] = await Promise.all([
//         apiService.getJenkinsBuilds().catch(() => []),
//         apiService.getJenkinsCoverage().catch(() => []),
//         apiService.getJenkinsTestResults().catch(() => [])
//       ]);

//       setBuilds(Array.isArray(buildsData) ? buildsData : []);
//       setCoverage(Array.isArray(coverageData) ? coverageData : []);
//       setTestResults(Array.isArray(testData) ? testData : []);
//     } catch (err) {
//       setError('Failed to load Jenkins data. Please check your Jenkins configuration.');
//       console.error('Failed to load Jenkins data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadJenkinsData();
//     setRefreshing(false);
//   };

//   const formatDuration = (ms: number) => {
//     const seconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);

//     if (hours > 0) return `${hours}h ${minutes % 60}m`;
//     if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
//     return `${seconds}s`;
//   };

//   const formatDate = (timestamp: number) => {
//     return new Date(timestamp).toLocaleString();
//   };

//   const getLatestCoverage = () => {
//     if (coverage.length === 0) return null;
//     return coverage.sort((a, b) => b.timestamp - a.timestamp)[0];
//   };

//   const getLatestTestResult = () => {
//     if (testResults.length === 0) return null;
//     return testResults.sort((a, b) => b.timestamp - a.timestamp)[0];
//   };

//   const getSuccessRate = () => {
//     if (builds.length === 0) return 0;
//     const successfulBuilds = builds.filter(build => build.result === 'SUCCESS').length;
//     return Math.round((successfulBuilds / builds.length) * 100);
//   };

//   if (loading) {
//     return (
//       <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 ${className}`}>
//         <div className="flex items-center justify-center py-8">
//           <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
//             <RefreshCw className="animate-spin" size={20} />
//             <span>Loading Jenkins data...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 ${className}`}>
//         <div className="flex items-center justify-center py-8">
//           <div className="flex flex-col items-center gap-3 text-red-500">
//             <AlertTriangle size={32} />
//             <p className="text-center">{error}</p>
//             <button
//               onClick={loadJenkinsData}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const latestCoverage = getLatestCoverage();
//   const latestTestResult = getLatestTestResult();

//   return (
//     <div className={`space-y-6 ${className}`}>
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Server className="text-blue-600 dark:text-blue-400" size={24} />
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Jenkins Dashboard</h2>
//         </div>
//         <button
//           onClick={handleRefresh}
//           disabled={refreshing}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
//         >
//           <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
//           Refresh
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Build Success Rate */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-green-100 dark:bg-green-400/10 rounded-lg">
//               <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 dark:text-slate-400">Success Rate</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{getSuccessRate()}%</p>
//             </div>
//           </div>
//         </div>

//         {/* Latest Coverage */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 dark:bg-blue-400/10 rounded-lg">
//               <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 dark:text-slate-400">Line Coverage</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
//                 {latestCoverage ? `${Math.round(latestCoverage.lineCoverage)}%` : 'N/A'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Test Results */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-purple-100 dark:bg-purple-400/10 rounded-lg">
//               <Activity className="text-purple-600 dark:text-purple-400" size={20} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 dark:text-slate-400">Tests Passed</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
//                 {latestTestResult ? `${latestTestResult.passCount}/${latestTestResult.totalCount}` : 'N/A'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Recent Builds */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-orange-100 dark:bg-orange-400/10 rounded-lg">
//               <TrendingUp className="text-orange-600 dark:text-orange-400" size={20} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 dark:text-slate-400">Total Builds</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{builds.length}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recent Builds Table */}
//       <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
//         <div className="p-6 border-b border-gray-200 dark:border-slate-700">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Builds</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-slate-700">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
//                   Build
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
//                   Duration
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
//                   Started
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
//               {builds.slice(0, 5).map((build) => (
//                 <tr key={build.number} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <a 
//                       href={build.url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
//                     >
//                       #{build.number}
//                     </a>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       {build.result === 'SUCCESS' ? (
//                         <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
//                       ) : build.result === 'FAILURE' ? (
//                         <XCircle className="text-red-600 dark:text-red-400" size={16} />
//                       ) : (
//                         <Clock className="text-yellow-600 dark:text-yellow-400" size={16} />
//                       )}
//                       <span className={`text-sm font-medium ${
//                         build.result === 'SUCCESS' ? 'text-green-600 dark:text-green-400' :
//                         build.result === 'FAILURE' ? 'text-red-600 dark:text-red-400' :
//                         'text-yellow-600 dark:text-yellow-400'
//                       }`}>
//                         {build.result || 'Building'}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
//                     {build.duration ? formatDuration(build.duration) : 'N/A'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
//                     {formatDate(build.timestamp)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {builds.length === 0 && (
//             <div className="p-8 text-center text-gray-500 dark:text-slate-400">
//               No build data available
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JenkinsDashboard;
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Server,
  BarChart3,
} from "lucide-react"
import { apiService } from "../services/api"
import type { JenkinsBuild, JenkinsCoverage, JenkinsTestResult } from "../types"

interface JenkinsDashboardProps {
  className?: string
}

const JenkinsDashboard: React.FC<JenkinsDashboardProps> = ({ className = "" }) => {
  const [builds, setBuilds] = useState<JenkinsBuild[]>([])
  const [coverage, setCoverage] = useState<JenkinsCoverage[]>([])
  const [testResults, setTestResults] = useState<JenkinsTestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadJenkinsData()
  }, [])

  const loadJenkinsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if Jenkins is configured first
      const settings = await apiService.getJenkinsSettings().catch(() => null)
      if (!settings) {
        setError("Jenkins is not configured. Please configure Jenkins in Settings first.")
        return
      }

      const [buildsData, coverageData, testData] = await Promise.all([
        apiService.getJenkinsBuilds().catch(() => []),
        apiService.getJenkinsCoverage().catch(() => []),
        apiService.getJenkinsTestResults().catch(() => []),
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadJenkinsData()
    setRefreshing(false)
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

  const getLatestCoverage = () => {
    if (coverage.length === 0) return null
    return coverage.sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  const getLatestTestResult = () => {
    if (testResults.length === 0) return null
    return testResults.sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  const getSuccessRate = () => {
    if (builds.length === 0) return 0
    const successfulBuilds = builds.filter((build) => build.result === "SUCCESS").length
    return Math.round((successfulBuilds / builds.length) * 100)
  }

  if (loading) {
    return (
      <div className={`bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-700 border-t-emerald-500" />
            <span className="font-medium">Loading Jenkins data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-200">{error}</p>
              <button
                onClick={loadJenkinsData}
                className="mt-4 px-6 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-200 rounded-xl transition-all duration-200 border border-zinc-700/50"
              >
                Retry
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
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Server className="text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Jenkins Dashboard</h2>
            <p className="text-sm text-zinc-400 mt-0.5">Monitor builds, coverage, and test results</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 disabled:opacity-50 text-zinc-200 rounded-xl transition-all duration-200 border border-zinc-700/50"
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Build Success Rate */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-zinc-100">{getSuccessRate()}%</p>
            </div>
          </div>
        </div>

        {/* Latest Coverage */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Line Coverage</p>
              <p className="text-2xl font-bold text-zinc-100">
                {latestCoverage ? `${Math.round(latestCoverage.lineCoverage)}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Activity className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Tests Passed</p>
              <p className="text-2xl font-bold text-zinc-100">
                {latestTestResult ? `${latestTestResult.passCount}/${latestTestResult.totalCount}` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Builds */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-orange-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Total Builds</p>
              <p className="text-2xl font-bold text-zinc-100">{builds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Builds Table */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50">
          <h3 className="text-lg font-semibold text-zinc-100">Recent Builds</h3>
          <p className="text-sm text-zinc-400 mt-1">Latest build activity and status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Build
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
              {builds.slice(0, 5).map((build) => (
                <tr key={build.number} className="hover:bg-zinc-800/20 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={build.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      #{build.number}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {build.result === "SUCCESS" ? (
                        <CheckCircle className="text-emerald-400" size={16} />
                      ) : build.result === "FAILURE" ? (
                        <XCircle className="text-red-400" size={16} />
                      ) : (
                        <Clock className="text-yellow-400" size={16} />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          build.result === "SUCCESS"
                            ? "text-emerald-400"
                            : build.result === "FAILURE"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {build.result || "Building"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 font-medium">
                    {build.duration ? formatDuration(build.duration) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{formatDate(build.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {builds.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              <Server size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No build data available</p>
              <p className="text-sm mt-1">Builds will appear here once Jenkins is configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JenkinsDashboard
