// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Search, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, SearchX, AlertCircle } from 'lucide-react';
// import { apiService } from '../services/api';

// interface TestRun {
//   id: number;
//   java_file: string;
//   test_file: string;
//   created_at: string;
// }

// const TestHistoryPage: React.FC = () => {
//   const [allTests, setAllTests] = useState<TestRun[]>([]);
//   const [filteredTests, setFilteredTests] = useState<TestRun[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const itemsPerPage = 10;

//   useEffect(() => {
//     loadHistory();
//   }, []);

//   useEffect(() => {
//     filterTests();
//   }, [allTests, searchTerm]);

//   const loadHistory = async () => {
//     try {
//       setLoading(true);
//       const tests = await apiService.getTestHistory();
//       setAllTests(tests);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load test history. Please try again.');
//       console.error('Failed to load test history:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterTests = () => {
//     if (searchTerm) {
//       const filtered = allTests.filter(test => 
//         test.id.toString().includes(searchTerm.toLowerCase()) ||
//         test.java_file.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         test.test_file.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredTests(filtered);
//     } else {
//       setFilteredTests([...allTests]);
//     }
//     setCurrentPage(1);
//   };

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       const pageTests = getCurrentPageTests();
//       setSelectedTests(new Set([...selectedTests, ...pageTests.map(test => test.id)]));
//     } else {
//       const pageTestIds = new Set(getCurrentPageTests().map(test => test.id));
//       setSelectedTests(new Set([...selectedTests].filter(id => !pageTestIds.has(id))));
//     }
//   };

//   const handleSelectTest = (testId: number, checked: boolean) => {
//     const newSelected = new Set(selectedTests);
//     if (checked) {
//       newSelected.add(testId);
//     } else {
//       newSelected.delete(testId);
//     }
//     setSelectedTests(newSelected);
//   };

//   const handleDeleteTest = async (testId: number) => {
//     if (!confirm('Are you sure you want to delete this test?')) return;

//     try {
//       await apiService.deleteTest(testId);
//       await loadHistory();
//       setSelectedTests(new Set([...selectedTests].filter(id => id !== testId)));
//     } catch (error) {
//       console.error('Failed to delete test:', error);
//       alert('Failed to delete test');
//     }
//   };

//   const handleDeleteSelected = async () => {
//     if (selectedTests.size === 0) return;
//     if (!confirm(`Delete ${selectedTests.size} selected test(s)?`)) return;

//     try {
//       await Promise.all([...selectedTests].map(id => apiService.deleteTest(id)));
//       await loadHistory();
//       setSelectedTests(new Set());
//     } catch (error) {
//       console.error('Failed to delete selected tests:', error);
//       alert('Failed to delete selected tests');
//     }
//   };

//   const getCurrentPageTests = () => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     return filteredTests.slice(startIndex, endIndex);
//   };

//   const getTotalPages = () => Math.ceil(filteredTests.length / itemsPerPage);

//   const formatTimestamp = (timestamp: string) => {
//     try {
//       return new Date(timestamp).toLocaleString();
//     } catch {
//       return timestamp;
//     }
//   };

//   const generatePageNumbers = () => {
//     const totalPages = getTotalPages();
//     const maxVisible = 5;
//     const pages = [];
    
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
//     if (endPage - startPage + 1 < maxVisible) {
//       startPage = Math.max(1, endPage - maxVisible + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return pages;
//   };

//   const pageTests = getCurrentPageTests();
//   const totalPages = getTotalPages();
//   const startItem = (currentPage - 1) * itemsPerPage + 1;
//   const endItem = Math.min(currentPage * itemsPerPage, filteredTests.length);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors">
//       <div className="max-w-7xl mx-auto p-8">
//         {/* Page Title */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">🗂️ Test Case History</h1>
//           <p className="text-gray-600 dark:text-slate-400 mt-2">View and manage all your generated test cases</p>
//         </div>

//         {/* Controls */}
//         <div className="flex gap-4 items-center flex-wrap mb-8">
//           <div className="relative flex-1 min-w-80">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" size={18} />
//             <input
//               type="text"
//               placeholder="Search by ID, Java file, or test file..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
//             />
//           </div>
//           {selectedTests.size > 0 && (
//             <button
//               onClick={handleDeleteSelected}
//               className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
//             >
//               <Trash2 size={18} />
//               Delete Selected
//             </button>
//           )}
//         </div>

//         {/* Table */}
//         <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-xl mb-8 transition-colors">
//           <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
//             <table className="w-full min-w-[600px]">
//               <thead className="bg-gray-100 dark:bg-slate-700 sticky top-0 z-10">
//                 <tr>
//                   <th className="p-4 text-left">
//                     <input
//                       type="checkbox"
//                       checked={pageTests.length > 0 && pageTests.every(test => selectedTests.has(test.id))}
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
//                     />
//                   </th>
//                   <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 uppercase tracking-wider">ID</th>
//                   <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Java File</th>
//                   <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Test File</th>
//                   <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Created</th>
//                   <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-slate-400">
//                       <div className="flex items-center justify-center gap-2">
//                         <Loader2 className="animate-spin" size={20} />
//                         Loading test history...
//                       </div>
//                     </td>
//                   </tr>
//                 ) : error ? (
//                   <tr>
//                     <td colSpan={6} className="p-8 text-center">
//                       <div className="flex flex-col items-center gap-2 text-red-400">
//                         <AlertCircle size={48} className="opacity-50" />
//                         <div>{error}</div>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : pageTests.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="p-8 text-center">
//                       <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-slate-400">
//                         <SearchX size={48} className="opacity-50" />
//                         <div>{searchTerm ? 'No tests match your search criteria.' : 'No test cases found.'}</div>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   pageTests.map((test) => (
//                     <tr key={test.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
//                       <td className="p-4">
//                         <input
//                           type="checkbox"
//                           checked={selectedTests.has(test.id)}
//                           onChange={(e) => handleSelectTest(test.id, e.target.checked)}
//                           className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="p-4">
//                         <strong className="text-gray-900 dark:text-slate-200">#{test.id}</strong>
//                       </td>
//                       <td className="p-4">
//                         <span className="font-mono text-sm bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 text-orange-600 dark:text-orange-400">
//                           {test.java_file}
//                         </span>
//                       </td>
//                       <td className="p-4">
//                         <span className="font-mono text-sm bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded border border-gray-300 dark:border-slate-600 text-orange-600 dark:text-orange-400">
//                           {test.test_file}
//                         </span>
//                       </td>
//                       <td className="p-4">
//                         <span className="text-sm text-gray-600 dark:text-slate-400">{formatTimestamp(test.created_at)}</span>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex gap-2">
//                           <Link
//                             to={`/tests/${test.id}/view`}
//                             className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-lg transition-colors"
//                             title="View Test"
//                           >
//                             <Eye size={18} />
//                           </Link>
//                           <button
//                             onClick={() => handleDeleteTest(test.id)}
//                             className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors"
//                             title="Delete Test"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Pagination */}
//         {!loading && !error && filteredTests.length > 0 && (
//           <div className="flex justify-center items-center gap-4 flex-wrap">
//             <button
//               onClick={() => setCurrentPage(currentPage - 1)}
//               disabled={currentPage <= 1}
//               className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronLeft size={20} />
//             </button>
            
//             <div className="flex gap-2">
//               {generatePageNumbers().map(page => (
//                 <button
//                   key={page}
//                   onClick={() => setCurrentPage(page)}
//                   className={`px-3 py-2 rounded-lg transition-colors ${
//                     page === currentPage
//                       ? 'bg-blue-600 text-white'
//                       : 'border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-200'
//                   }`}
//                 >
//                   {page}
//                 </button>
//               ))}
//             </div>
            
//             <button
//               onClick={() => setCurrentPage(currentPage + 1)}
//               disabled={currentPage >= totalPages}
//               className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronRight size={20} />
//             </button>
            
//             <div className="text-sm text-gray-600 dark:text-slate-400 ml-4">
//               Showing {startItem}-{endItem} of {filteredTests.length} entries
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TestHistoryPage;
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  SearchX,
  AlertTriangle,
  FileText,
  Calendar,
  Hash,
} from "lucide-react"
import { apiService } from "../services/api"

interface TestRun {
  id: number
  java_file: string
  test_file: string
  created_at: string
}

const TestHistoryPage: React.FC = () => {
  const [allTests, setAllTests] = useState<TestRun[]>([])
  const [filteredTests, setFilteredTests] = useState<TestRun[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    filterTests()
  }, [allTests, searchTerm])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const tests = await apiService.getTestHistory()
      setAllTests(tests)
      setError(null)
    } catch (err) {
      setError("Failed to load test history. Please try again.")
      console.error("Failed to load test history:", err)
    } finally {
      setLoading(false)
    }
  }

  const filterTests = () => {
    if (searchTerm) {
      const filtered = allTests.filter(
        (test) =>
          test.id.toString().includes(searchTerm.toLowerCase()) ||
          test.java_file.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.test_file.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredTests(filtered)
    } else {
      setFilteredTests([...allTests])
    }
    setCurrentPage(1)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageTests = getCurrentPageTests()
      setSelectedTests(new Set([...selectedTests, ...pageTests.map((test) => test.id)]))
    } else {
      const pageTestIds = new Set(getCurrentPageTests().map((test) => test.id))
      setSelectedTests(new Set([...selectedTests].filter((id) => !pageTestIds.has(id))))
    }
  }

  const handleSelectTest = (testId: number, checked: boolean) => {
    const newSelected = new Set(selectedTests)
    if (checked) {
      newSelected.add(testId)
    } else {
      newSelected.delete(testId)
    }
    setSelectedTests(newSelected)
  }

  const handleDeleteTest = async (testId: number) => {
    if (!confirm("Are you sure you want to delete this test?")) return

    try {
      await apiService.deleteTest(testId)
      await loadHistory()
      setSelectedTests(new Set([...selectedTests].filter((id) => id !== testId)))
    } catch (error) {
      console.error("Failed to delete test:", error)
      alert("Failed to delete test")
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedTests.size === 0) return
    if (!confirm(`Delete ${selectedTests.size} selected test(s)?`)) return

    try {
      await Promise.all([...selectedTests].map((id) => apiService.deleteTest(id)))
      await loadHistory()
      setSelectedTests(new Set())
    } catch (error) {
      console.error("Failed to delete selected tests:", error)
      alert("Failed to delete selected tests")
    }
  }

  const getCurrentPageTests = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTests.slice(startIndex, endIndex)
  }

  const getTotalPages = () => Math.ceil(filteredTests.length / itemsPerPage)

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  const generatePageNumbers = () => {
    const totalPages = getTotalPages()
    const maxVisible = 5
    const pages = []

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageTests = getCurrentPageTests()
  const totalPages = getTotalPages()
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredTests.length)

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Test Case History</h1>
            <p className="text-zinc-400 mt-1">View and manage all your generated test cases</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Total Tests</p>
                <p className="text-2xl font-bold text-zinc-100">{allTests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Filtered Results</p>
                <p className="text-2xl font-bold text-zinc-100">{filteredTests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Hash className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Selected</p>
                <p className="text-2xl font-bold text-zinc-100">{selectedTests.size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID, Java file, or test file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600/50 focus:ring-2 focus:ring-zinc-600/20 transition-all duration-200"
            />
          </div>
          {selectedTests.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all duration-200 font-medium"
            >
              <Trash2 size={18} />
              Delete Selected ({selectedTests.size})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-zinc-800/50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={pageTests.length > 0 && pageTests.every((test) => selectedTests.has(test.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-zinc-300 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-left text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Java File
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Test File
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-zinc-400">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-700 border-t-blue-500" />
                        <span className="font-medium">Loading test history...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
                          <AlertTriangle size={32} className="text-red-400" />
                        </div>
                        <div className="text-red-400 font-medium">{error}</div>
                        <button
                          onClick={loadHistory}
                          className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-200 rounded-xl transition-colors border border-zinc-700/50"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : pageTests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center">
                          <SearchX size={32} className="text-zinc-500" />
                        </div>
                        <div className="text-zinc-400 font-medium">
                          {searchTerm ? "No tests match your search criteria." : "No test cases found."}
                        </div>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-200 rounded-xl transition-colors border border-zinc-700/50"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageTests.map((test) => (
                    <tr
                      key={test.id}
                      className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedTests.has(test.id)}
                          onChange={(e) => handleSelectTest(test.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Hash size={14} className="text-blue-400" />
                          </div>
                          <span className="font-semibold text-zinc-200">#{test.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-orange-400" />
                          <span className="font-mono text-sm bg-zinc-800/50 px-2 py-1 rounded-lg border border-zinc-700/50 text-orange-300">
                            {test.java_file}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-emerald-400" />
                          <span className="font-mono text-sm bg-zinc-800/50 px-2 py-1 rounded-lg border border-zinc-700/50 text-emerald-300">
                            {test.test_file}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-zinc-400" />
                          <span className="text-sm text-zinc-400 font-medium">{formatTimestamp(test.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/tests/${test.id}/view`}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-500/20"
                            title="View Test"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteTest(test.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20"
                            title="Delete Test"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && !error && filteredTests.length > 0 && (
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 hover:border-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={20} className="text-zinc-300" />
            </button>

            <div className="flex gap-2">
              {generatePageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                    page === currentPage
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700/50 text-zinc-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 hover:border-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={20} className="text-zinc-300" />
            </button>

            <div className="text-sm text-zinc-400 ml-4 font-medium">
              Showing {startItem}-{endItem} of {filteredTests.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestHistoryPage
