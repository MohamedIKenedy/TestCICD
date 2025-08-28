// import React, { useState, useEffect } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { ArrowLeft, Save, Code, AlignLeft, WrapText, Maximize, Type, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import { apiService } from '../services/api';

// const ViewTestPage: React.FC = () => {
//   const { testId } = useParams<{ testId: string }>();
//   const [code, setCode] = useState('');
//   const [originalCode, setOriginalCode] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
//   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

//   useEffect(() => {
//     if (testId) {
//       loadTest();
//     }
//   }, [testId]);

//   useEffect(() => {
//     setHasUnsavedChanges(code !== originalCode);
//   }, [code, originalCode]);

//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (hasUnsavedChanges) {
//         e.preventDefault();
//         e.returnValue = '';
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [hasUnsavedChanges]);

//   const loadTest = async () => {
//     try {
//       setLoading(true);
//       const response = await apiService.getTest(parseInt(testId!));
//       setCode(response.code);
//       setOriginalCode(response.code);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load test. Please try again.');
//       console.error('Failed to load test:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveTest = async () => {
//     if (!testId) return;

//     setSaving(true);
//     try {
//       await apiService.updateTest(parseInt(testId), code);
//       setOriginalCode(code);
//       showToast('Test saved successfully!', 'success');
//     } catch (error) {
//       console.error('Save error:', error);
//       showToast('Error saving test', 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const showToast = (message: string, type: 'success' | 'error') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const formatCode = () => {
//     // Basic Java code formatting
//     const formatted = code
//       .split('\n')
//       .map(line => line.trim())
//       .join('\n')
//       .replace(/\{\s*\n/g, '{\n')
//       .replace(/\n\s*\}/g, '\n}');
    
//     setCode(formatted);
//     showToast('Code formatted successfully', 'success');
//   };

//   const getLineCount = () => code.split('\n').length;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors flex items-center justify-center">
//         <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
//           <Loader2 className="animate-spin" size={24} />
//           Loading test...
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle size={48} className="mx-auto mb-4 text-red-500 dark:text-red-400" />
//           <div className="text-red-500 dark:text-red-400">{error}</div>
//           <Link
//             to="/history"
//             className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
//           >
//             <ArrowLeft size={16} />
//             Back to History
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors flex flex-col">
//       {/* Header */}
//       <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 transition-colors">
//         <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
//           <div className="flex items-center gap-4">
//             <Link
//               to="/history"
//               className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
//             >
//               <ArrowLeft size={20} />
//               Back to History
//             </Link>
//           </div>
//           <h1 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-slate-100">
//             📝 Edit Test
//             <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
//               #{testId}
//             </span>
//           </h1>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col">
//         {/* Editor Container */}
//         <div className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col transition-colors">
//           {/* Editor Header */}
//           <div className="bg-gray-100 dark:bg-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between flex-wrap gap-4 transition-colors">
//             <div className="flex items-center gap-2 text-gray-700 dark:text-slate-200 font-medium">
//               <Code size={20} />
//               Java Test Code
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={formatCode}
//                 className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded-lg transition-colors text-sm"
//                 title="Format Code"
//               >
//                 <AlignLeft size={16} />
//                 Format
//               </button>
//             </div>
//           </div>

//           {/* Code Editor */}
//           <div className="flex-1 p-0">
//             <textarea
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//               className="w-full h-full min-h-[500px] p-6 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-mono text-sm resize-none focus:outline-none border-none transition-colors"
//               placeholder="Java test code will appear here..."
//               spellCheck={false}
//             />
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
//           <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-slate-400">
//             <div className="flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-orange-400' : 'bg-green-400'}`} />
//               <span>{hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <FileText size={16} />
//               <span>{getLineCount()} lines</span>
//             </div>
//           </div>

//           <button
//             onClick={saveTest}
//             disabled={saving || !hasUnsavedChanges}
//             className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
//           >
//             {saving ? (
//               <>
//                 <Loader2 className="animate-spin" size={20} />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save size={20} />
//                 Save Changes
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Toast Notification */}
//       {toast && (
//         <div className={`fixed top-8 right-8 px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-2 text-white font-medium transition-transform ${
//           toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
//         }`}>
//           {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//           {toast.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewTestPage;
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Save,
  Code,
  AlignLeft,
  FileText,
  CheckCircle,
  AlertTriangle,
  Hash,
  Calendar,
  Edit3,
} from "lucide-react"
import { apiService } from "../services/api"

const ViewTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>()
  const [code, setCode] = useState("")
  const [originalCode, setOriginalCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (testId) {
      loadTest()
    }
  }, [testId])

  useEffect(() => {
    setHasUnsavedChanges(code !== originalCode)
  }, [code, originalCode])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const loadTest = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTest(Number.parseInt(testId!))
      setCode(response.code)
      setOriginalCode(response.code)
      setError(null)
    } catch (err) {
      setError("Failed to load test. Please try again.")
      console.error("Failed to load test:", err)
    } finally {
      setLoading(false)
    }
  }

  const saveTest = async () => {
    if (!testId) return

    setSaving(true)
    try {
      await apiService.updateTest(Number.parseInt(testId), code)
      setOriginalCode(code)
      showToast("Test saved successfully!", "success")
    } catch (error) {
      console.error("Save error:", error)
      showToast("Error saving test", "error")
    } finally {
      setSaving(false)
    }
  }

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const formatCode = () => {
    const formatted = code
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .replace(/\{\s*\n/g, "{\n")
      .replace(/\n\s*\}/g, "\n}")

    setCode(formatted)
    showToast("Code formatted successfully", "success")
  }

  const getLineCount = () => code.split("\n").length

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-medium">Loading test...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <div className="text-red-400 font-medium mb-4">{error}</div>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-200 rounded-xl transition-colors border border-zinc-700/50"
          >
            <ArrowLeft size={16} />
            Back to History
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800/50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/history"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-200 rounded-xl transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600/50 font-medium"
            >
              <ArrowLeft size={18} />
              Back to History
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                Edit Test
                <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Hash size={12} />
                  {testId}
                </span>
              </h1>
              <p className="text-sm text-zinc-400">Modify and save your test code</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto flex flex-col h-full">
          {/* Editor Container */}
          <div className="flex-1 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* Editor Header */}
            <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-700/50 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Code size={16} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-200">Java Test Code</h3>
                  <p className="text-xs text-zinc-400">Edit your test implementation</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={formatCode}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-700/50 hover:bg-zinc-700/70 text-zinc-300 rounded-lg transition-all duration-200 text-sm font-medium border border-zinc-600/50"
                  title="Format Code"
                >
                  <AlignLeft size={14} />
                  Format
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full min-h-[500px] p-6 bg-zinc-950/50 text-zinc-100 font-mono text-sm resize-none focus:outline-none border-none placeholder-zinc-500 leading-relaxed"
                placeholder="Java test code will appear here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Status Bar and Actions */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? "bg-orange-400" : "bg-emerald-400"}`} />
                <span className="text-zinc-400 font-medium">
                  {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <FileText size={16} />
                <span className="font-medium">{getLineCount()} lines</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={16} />
                <span className="font-medium">Last modified: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={saveTest}
              disabled={saving || !hasUnsavedChanges}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-emerald-600/20"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-8 right-8 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 text-white font-medium transition-all duration-300 backdrop-blur-sm ${
            toast.type === "success"
              ? "bg-emerald-600/90 border border-emerald-500/50"
              : "bg-red-600/90 border border-red-500/50"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} className="text-emerald-200" />
          ) : (
            <AlertTriangle size={20} className="text-red-200" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default ViewTestPage
