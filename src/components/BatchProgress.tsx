// import React from 'react';

// interface BatchProgressProps {
//   current: number;
//   total: number;
//   files: Array<{
//     name: string;
//     status: 'waiting' | 'processing' | 'completed' | 'error';
//     message: string;
//   }>;
// }

// const BatchProgress: React.FC<BatchProgressProps> = ({ current, total, files }) => {
//   const progressPercentage = (current / total) * 100;

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'waiting': return '⏳';
//       case 'processing': return '🔄';
//       case 'completed': return '✅';
//       case 'error': return '❌';
//       default: return '⏳';
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'processing': return 'border-blue-500 bg-blue-500/10';
//       case 'completed': return 'border-green-500 bg-green-500/10';
//       case 'error': return 'border-red-500 bg-red-500/10';
//       default: return 'border-slate-600 bg-slate-800';
//     }
//   };

//   return (
//     <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
//       <div className="mb-4">
//         <div className="flex items-center justify-between mb-2">
//           <h3 className="text-lg font-semibold">🧪 Generating Test Files</h3>
//           <span className="text-sm text-slate-400">{current} / {total}</span>
//         </div>
        
//         <div className="w-full bg-slate-700 rounded-full h-2">
//           <div
//             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//             style={{ width: `${progressPercentage}%` }}
//           />
//         </div>
//       </div>

//       <div className="space-y-3 max-h-64 overflow-y-auto">
//         {files.map((file, index) => (
//           <div
//             key={index}
//             className={`p-3 rounded-lg border transition-colors ${getStatusColor(file.status)}`}
//           >
//             <div className="flex items-center gap-3">
//               <span className="text-lg">{getStatusIcon(file.status)}</span>
//               <div className="flex-1">
//                 <div className="font-medium text-slate-200">{file.name}</div>
//                 <div className="text-sm text-slate-400">{file.message}</div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {current === total && (
//         <div className="mt-4 p-3 bg-green-600/20 border border-green-600 rounded-lg text-green-400 text-center">
//           ✅ All tests generated successfully!
//         </div>
//       )}
//     </div>
//   );
// };

// export default BatchProgress;
"use client"

import type React from "react"
import { CheckCircle, XCircle, Clock, Loader2, Sparkles } from "lucide-react"

interface BatchProgressProps {
  current: number
  total: number
  files: Array<{
    name: string
    status: "waiting" | "processing" | "completed" | "error"
    message: string
  }>
}

const BatchProgress: React.FC<BatchProgressProps> = ({ current, total, files }) => {
  const progressPercentage = (current / total) * 100

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock size={16} className="text-zinc-400" />
      case "processing":
        return <Loader2 size={16} className="text-blue-400 animate-spin" />
      case "completed":
        return <CheckCircle size={16} className="text-emerald-400" />
      case "error":
        return <XCircle size={16} className="text-red-400" />
      default:
        return <Clock size={16} className="text-zinc-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "border-blue-500/30 bg-blue-500/5"
      case "completed":
        return "border-emerald-500/30 bg-emerald-500/5"
      case "error":
        return "border-red-500/30 bg-red-500/5"
      default:
        return "border-zinc-700/50 bg-zinc-800/30"
    }
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Generating Test Files</h3>
              <p className="text-sm text-zinc-400">AI is creating comprehensive test suites</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-100">{current}</div>
            <div className="text-sm text-zinc-400">of {total}</div>
          </div>
        </div>

        <div className="relative">
          <div className="w-full bg-zinc-800/50 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          <div className="absolute -top-1 right-0 text-xs font-medium text-zinc-300 bg-zinc-800/80 backdrop-blur-sm px-2 py-1 rounded-lg">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {files.map((file, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all duration-200 ${getStatusColor(file.status)}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{getStatusIcon(file.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-200 truncate">{file.name}</div>
                <div className="text-sm text-zinc-400 mt-1">{file.message}</div>
              </div>
              {file.status === "processing" && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {current === total && (
        <div className="mt-6 p-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-emerald-400">All tests generated successfully!</div>
              <div className="text-sm text-emerald-300/80 mt-1">
                {total} test files have been created and are ready for review
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchProgress
