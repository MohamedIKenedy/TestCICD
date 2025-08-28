// import React from 'react';
// import { Copy, Download, Wrench, Package } from 'lucide-react';
// import { GeneratedTest } from '../types';

// interface GeneratedFilesListProps {
//   tests: Record<string, GeneratedTest>;
//   onFixCode: (fileName: string, content: string) => void;
//   onDownloadAll: () => void;
// }

// const GeneratedFilesList: React.FC<GeneratedFilesListProps> = ({
//   tests,
//   onFixCode,
//   onDownloadAll
// }) => {
//   const copyToClipboard = async (content: string, fileName: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       alert(`Copied ${fileName} to clipboard`);
//     } catch (error) {
//       console.error('Failed to copy to clipboard:', error);
//     }
//   };

//   const downloadFile = (fileName: string, content: string) => {
//     const blob = new Blob([content], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = fileName;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold">📄 Generated Test Files</h3>
//         <button
//           onClick={onDownloadAll}
//           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
//         >
//           <Package size={16} />
//           Download All as ZIP
//         </button>
//       </div>

//       <div className="space-y-6">
//         {Object.entries(tests).map(([fileName, test]) => (
//           <div key={fileName} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
//             <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
//               <h4 className="font-medium text-slate-200">{fileName}</h4>
//             </div>
            
//             <div className="p-4">
//               <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 font-mono overflow-x-auto max-h-96 overflow-y-auto border border-slate-600">
//                 {test.content}
//               </pre>
//             </div>
            
//             <div className="bg-slate-700 px-4 py-3 flex gap-2">
//               <button
//                 onClick={() => copyToClipboard(test.content, fileName)}
//                 className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-slate-200 px-3 py-2 rounded-lg transition-colors text-sm"
//               >
//                 <Copy size={14} />
//                 Copy
//               </button>
//               <button
//                 onClick={() => downloadFile(fileName, test.content)}
//                 className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-slate-200 px-3 py-2 rounded-lg transition-colors text-sm"
//               >
//                 <Download size={14} />
//                 Download
//               </button>
//               <button
//                 onClick={() => onFixCode(fileName, test.content)}
//                 className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
//               >
//                 <Wrench size={14} />
//                 Fix Code
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GeneratedFilesList;
"use client"

import type React from "react"
import { Copy, Download, Wrench, Package, FileText, Code, CheckCircle } from "lucide-react"
import type { GeneratedTest } from "../types"

interface GeneratedFilesListProps {
  tests: Record<string, GeneratedTest>
  onFixCode: (fileName: string, content: string) => void
  onDownloadAll: () => void
}

const GeneratedFilesList: React.FC<GeneratedFilesListProps> = ({ tests, onFixCode, onDownloadAll }) => {
  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // You could add a toast notification here
      console.log(`Copied ${fileName} to clipboard`)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Generated Test Files</h3>
            <p className="text-sm text-zinc-400">{Object.keys(tests).length} files ready for download</p>
          </div>
        </div>
        <button
          onClick={onDownloadAll}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-blue-600/20"
        >
          <Package size={16} />
          Download All as ZIP
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(tests).map(([fileName, test]) => (
          <div
            key={fileName}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden"
          >
            <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-200">{fileName}</h4>
                    <p className="text-xs text-zinc-400">Generated test file</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Ready</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="relative">
                <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 leading-relaxed">
                  {test.content}
                </pre>
                <div className="absolute top-3 right-3 bg-zinc-800/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-zinc-400 font-medium">
                  {test.content.split("\n").length} lines
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/30 px-6 py-4 flex gap-3">
              <button
                onClick={() => copyToClipboard(test.content, fileName)}
                className="flex items-center gap-2 bg-zinc-700/50 hover:bg-zinc-700/70 text-zinc-300 hover:text-zinc-200 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-zinc-600/50"
              >
                <Copy size={14} />
                Copy
              </button>
              <button
                onClick={() => downloadFile(fileName, test.content)}
                className="flex items-center gap-2 bg-zinc-700/50 hover:bg-zinc-700/70 text-zinc-300 hover:text-zinc-200 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-zinc-600/50"
              >
                <Download size={14} />
                Download
              </button>
              <button
                onClick={() => onFixCode(fileName, test.content)}
                className="flex items-center gap-2 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 hover:text-orange-300 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-orange-600/20 hover:border-orange-600/30"
              >
                <Wrench size={14} />
                Fix Code
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GeneratedFilesList
