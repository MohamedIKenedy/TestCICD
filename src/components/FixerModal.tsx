// import React, { useState } from 'react';
// import { X, Wrench, Loader2 } from 'lucide-react';

// interface FixerModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (errorMessage: string) => Promise<boolean>;
//   fileName: string;
// }

// const FixerModal: React.FC<FixerModalProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   fileName
// }) => {
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!errorMessage.trim()) {
//       alert('Please provide the error message');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const success = await onSubmit(errorMessage);
//       if (success) {
//         setErrorMessage('');
//         onClose();
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold">Fix Generated Code</h3>
//           <button
//             onClick={onClose}
//             className="text-slate-400 hover:text-slate-300 transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="space-y-4 flex-1">
//           <div>
//             <label className="block text-sm font-medium text-slate-300 mb-2">
//               Paste your compilation/runtime error here
//             </label>
//             <textarea
//               value={errorMessage}
//               onChange={(e) => setErrorMessage(e.target.value)}
//               placeholder={`Paste the full error message here...

// Example:
// Error: Cannot find symbol
//  symbol: method someMethod()
//  location: class MyClass
//  at line 25`}
//               className="w-full h-40 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500"
//             />
//           </div>

//           <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
//             <div className="text-sm text-blue-300">
//               <strong>💡 Tip:</strong> Include the complete error message with line numbers, 
//               method names, and any stack traces for better fixing accuracy.
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3 justify-end mt-6">
//           <button
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting || !errorMessage.trim()}
//             className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="animate-spin" size={16} />
//                 Fixing...
//               </>
//             ) : (
//               <>
//                 <Wrench size={16} />
//                 Fix Code
//               </>
//             )}
//           </button>
//         </div>

//         {isSubmitting && (
//           <div className="mt-4 flex items-center gap-2 text-blue-400">
//             <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
//             <span>Analyzing error and fixing code...</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FixerModal;
"use client"

import type React from "react"
import { useState } from "react"
import { X, Wrench, AlertTriangle, Code } from "lucide-react"

interface FixerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (errorMessage: string) => Promise<boolean>
  fileName: string
}

const FixerModal: React.FC<FixerModalProps> = ({ isOpen, onClose, onSubmit, fileName }) => {
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!errorMessage.trim()) {
      alert("Please provide the error message")
      return
    }

    setIsSubmitting(true)
    try {
      const success = await onSubmit(errorMessage)
      if (success) {
        setErrorMessage("")
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Fix Generated Code</h3>
              <p className="text-sm text-zinc-400">Provide error details for AI-powered fixes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-zinc-300">Target File</span>
            </div>
            <div className="font-mono text-sm text-blue-400 bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-700/30">
              {fileName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Error Message or Issue Description</label>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder={`Paste the complete error message here...

Example:
Error: Cannot find symbol
 symbol: method someMethod()
 location: class MyClass
 at line 25

Or describe the issue:
- Test is not covering edge cases
- Missing import statements
- Incorrect assertion logic`}
              className="w-full h-40 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200 leading-relaxed"
            />
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <strong className="font-medium">💡 Pro Tips:</strong>
                <ul className="mt-2 space-y-1 text-blue-300/80">
                  <li>• Include complete error messages with line numbers</li>
                  <li>• Mention specific method names and class references</li>
                  <li>• Describe expected vs actual behavior</li>
                  <li>• Include any stack traces for better context</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-zinc-800/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-300 rounded-xl transition-all duration-200 font-medium border border-zinc-700/50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !errorMessage.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:opacity-50 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-orange-600/20"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Fixing Code...
              </>
            ) : (
              <>
                <Wrench size={16} />
                Fix Code with AI
              </>
            )}
          </button>
        </div>

        {isSubmitting && (
          <div className="mt-4 flex items-center gap-3 text-blue-400 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent flex-shrink-0" />
            <div>
              <div className="font-medium">Analyzing error and generating fix...</div>
              <div className="text-sm text-blue-300/80 mt-1">This may take a few moments</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FixerModal
