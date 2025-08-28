// // import React from 'react';
// // import { Play } from 'lucide-react';

// // interface CodeViewerProps {
// //   code: string;
// //   filePath: string;
// //   onGenerate: () => void;
// //   isGenerating: boolean;
// // }

// // const CodeViewer: React.FC<CodeViewerProps> = ({
// //   code,
// //   filePath,
// //   onGenerate,
// //   isGenerating
// // }) => {
// //   const fileName = filePath.split('/').pop() || '';
// //   const isJavaFile = filePath.endsWith('.java');

// //   return (
// //     <div className="space-y-4">
// //       {/* File Display */}
// //       <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
// //         <div className="flex items-center justify-between mb-3">
// //           <span className="text-sm text-gray-600 dark:text-slate-400">Selected File:</span>
// //           {fileName && (
// //             <div className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-sm text-gray-900 dark:text-slate-100 transition-colors">
// //               📄 {fileName}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Code Frame */}
// //       <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
// //         <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 border-b border-gray-200 dark:border-slate-600 transition-colors">
// //           <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Code Preview</span>
// //         </div>
// //         <div className="p-4">
// //           {code ? (
// //             <pre className="text-sm text-gray-900 dark:text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto transition-colors">
// //               {code}
// //             </pre>
// //           ) : (
// //             <div className="text-gray-500 dark:text-slate-500 text-center py-8">
// //               Select a file to view...
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Generate Button */}
// //       {isJavaFile && code && (
// //         <button
// //           onClick={onGenerate}
// //           disabled={isGenerating}
// //           className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
// //         >
// //           {isGenerating ? (
// //             <>
// //               <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
// //               Generating...
// //             </>
// //           ) : (
// //             <>
// //               <Play size={16} />
// //               Generate Tests
// //             </>
// //           )}
// //         </button>
// //       )}
// //     </div>
// //   );
// // };

// // export default CodeViewer;
// "use client"

// import type React from "react"
// import { Play } from "lucide-react"

// interface CodeViewerProps {
//   code: string
//   filePath: string
//   onGenerate: () => void
//   isGenerating: boolean
// }

// const CodeViewer: React.FC<CodeViewerProps> = ({ code, filePath, onGenerate, isGenerating }) => {
//   const fileName = filePath.split("/").pop() || ""
//   const isJavaFile = filePath.endsWith(".java")

//   return (
//     <div className="space-y-4">
//       {/* File Display */}
//       <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
//         <div className="flex items-center justify-between mb-3">
//           <span className="text-sm text-slate-400">Selected File:</span>
//           {fileName && (
//             <div className="bg-slate-800 px-3 py-1 rounded-lg text-sm text-slate-100 border border-slate-700">
//               📄 {fileName}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Code Frame */}
//       <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
//         <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
//           <span className="text-sm font-medium text-slate-300">Code Preview</span>
//         </div>
//         <div className="p-4">
//           {code ? (
//             <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
//               {code}
//             </pre>
//           ) : (
//             <div className="text-slate-500 text-center py-8">Select a file to view...</div>
//           )}
//         </div>
//       </div>

//       {/* Generate Button */}
//       {isJavaFile && code && (
//         <button
//           onClick={onGenerate}
//           disabled={isGenerating}
//           className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium border border-slate-700"
//         >
//           {isGenerating ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
//               Generating...
//             </>
//           ) : (
//             <>
//               <Play size={16} />
//               Generate Tests
//             </>
//           )}
//         </button>
//       )}
//     </div>
//   )
// }

// export default CodeViewer
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Play, FileCode, Sparkles, Brain, Clock, CheckCircle, Plus, Info } from "lucide-react"
import { apiService } from "../services/api"

interface CodeViewerProps {
  code: string
  filePath: string
  onGenerate: () => void
  isGenerating: boolean
  selectedContextPaths?: string[]
  onContextChange?: (paths: string[]) => void
}

const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  filePath, 
  onGenerate, 
  isGenerating,
  selectedContextPaths = [],
  onContextChange
}) => {
  const fileName = filePath.split("/").pop() || ""
  const isJavaFile = filePath.endsWith(".java")
  
  // Smart suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState<Array<{
    path: string, 
    name: string, 
    reason: string, 
    score: number, 
    priority?: string, 
    should_mock?: boolean
  }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);

  // Load smart suggestions when filePath changes
  useEffect(() => {
    const loadSmartSuggestions = async () => {
      if (!filePath || !isJavaFile) {
        setSmartSuggestions([]);
        return;
      }
      
      setLoadingSuggestions(true);
      try {
        const response = await apiService.suggestContextFiles(filePath);
        setSmartSuggestions(response.suggestions || []);
        setAiEnhanced(response.ai_enhanced || false);
      } catch (error) {
        console.error('Failed to load smart suggestions:', error);
        setSmartSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    loadSmartSuggestions();
  }, [filePath, isJavaFile]);

  const handleContextToggle = (path: string) => {
    if (!onContextChange) return;
    
    const newSelectedPaths = selectedContextPaths.includes(path)
      ? selectedContextPaths.filter(p => p !== path)
      : [...selectedContextPaths, path];
    
    onContextChange(newSelectedPaths);
  };

  const handleQuickSelectAll = () => {
    if (!onContextChange) return;
    
    const topSuggestions = smartSuggestions.slice(0, 5).map(s => s.path);
    onContextChange(topSuggestions);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Display */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <FileCode className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">Selected File</p>
              <p className="text-zinc-200 font-semibold">{fileName || "No file selected"}</p>
            </div>
          </div>
          {fileName && (
            <div className="bg-zinc-800/50 px-3 py-2 rounded-xl text-sm text-zinc-300 border border-zinc-700/50 font-mono">
              {fileName}
            </div>
          )}
        </div>
      </div>

      {/* Smart Context Suggestions - Only show for Java files */}
      {isJavaFile && filePath && (
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
                  Smart Context Suggestions
                  {aiEnhanced && (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/20 font-medium">
                      AI Enhanced
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-400">
                  {loadingSuggestions ? "Analyzing dependencies..." : `${smartSuggestions.length} suggestions found`}
                </p>
              </div>
            </div>
            {smartSuggestions.length > 0 && onContextChange && (
              <button
                onClick={handleQuickSelectAll}
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded-xl border border-purple-500/30 transition-colors flex items-center gap-2"
              >
                <Plus size={14} />
                Quick Select Top 5
              </button>
            )}
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
              <span className="ml-3 text-zinc-400">Loading suggestions...</span>
            </div>
          ) : smartSuggestions.length > 0 ? (
            <div className="space-y-3">
              {smartSuggestions.slice(0, 6).map((suggestion) => {
                const isSelected = selectedContextPaths.includes(suggestion.path);
                return (
                  <div 
                    key={suggestion.path}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/20' 
                        : 'bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50'
                    }`}
                    onClick={() => onContextChange && handleContextToggle(suggestion.path)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-zinc-200 font-medium truncate">
                            {suggestion.name}
                          </span>
                          {suggestion.priority && (
                            <span className={`px-2 py-1 text-xs rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </span>
                          )}
                          {suggestion.should_mock && (
                            <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-lg border border-orange-500/20">
                              Mock
                            </span>
                          )}
                          <span className="px-2 py-1 bg-zinc-700/50 text-zinc-400 text-xs rounded-lg">
                            {suggestion.score}%
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {suggestion.reason}
                        </p>
                      </div>
                      {onContextChange && (
                        <div className="flex-shrink-0 ml-3">
                          {isSelected ? (
                            <CheckCircle size={20} className="text-purple-400" />
                          ) : (
                            <Plus size={20} className="text-zinc-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {smartSuggestions.length > 6 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-zinc-500">
                    +{smartSuggestions.length - 6} more suggestions available
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Info size={32} className="text-zinc-500" />
              </div>
              <p className="text-zinc-500 font-medium">No context suggestions found</p>
              <p className="text-sm text-zinc-600 mt-1">The AI couldn't find relevant dependencies for this file</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Context Summary */}
      {onContextChange && selectedContextPaths.length > 0 && (
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">Selected Context Files</h3>
              <p className="text-xs text-zinc-400">{selectedContextPaths.length} files selected for context</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedContextPaths.map((path) => {
              const name = path.split('/').pop() || path;
              return (
                <div key={path} className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-2 rounded-xl border border-green-500/20">
                  <span className="text-sm font-medium">{name}</span>
                  <button
                    onClick={() => handleContextToggle(path)}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Code Frame */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <FileCode size={16} className="text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">Code Preview</h3>
              <p className="text-xs text-zinc-400">Review your Java source code</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {code ? (
            <div className="relative">
              <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 leading-relaxed">
                {code}
              </pre>
              <div className="absolute top-3 right-3 bg-zinc-800/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-zinc-400 font-medium">
                {code.split("\n").length} lines
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileCode size={32} className="text-zinc-500" />
              </div>
              <p className="text-zinc-500 font-medium">Select a file to view its content</p>
              <p className="text-sm text-zinc-600 mt-1">Choose a Java file from the file tree</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button with Context Info */}
      {isJavaFile && code && (
        <div className="space-y-3">
          {onContextChange && selectedContextPaths.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Info size={16} />
                <span className="text-sm font-medium">
                  {selectedContextPaths.length} context file(s) will be included for better test generation
                </span>
              </div>
            </div>
          )}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:opacity-50 text-white px-6 py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-emerald-600/20 disabled:shadow-none group"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Generating Tests...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Sparkles size={16} />
                </div>
                <span>Generate AI Tests</span>
                <Play size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default CodeViewer
