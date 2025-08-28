// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { 
//   BarChart3, 
//   TestTube, 
//   History, 
//   Settings, 
//   Download,
//   Activity,
//   Sun,
//   Moon,
//   Server
// } from 'lucide-react';
// import { useTheme } from '../contexts/ThemeContext';

// const Navbar: React.FC = () => {
//   const location = useLocation();
//   const { theme, toggleTheme } = useTheme();

//   const isActive = (path: string) => {
//     if (path === '/' && location.pathname === '/') return true;
//     if (path !== '/' && location.pathname.startsWith(path)) return true;
//     return false;
//   };

//   return (
//     <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-50 transition-colors">
//       <div className="max-w-7xl mx-auto flex items-center justify-between">
//         {/* Left: Brand/Logo */}
//         <div className="flex items-center gap-6">
//           <Link to="/" className="flex items-center gap-3">
//             <div className="p-2 bg-blue-600 rounded-lg">
//               <Activity className="w-6 h-6 text-white" />
//             </div>
//             <span className="text-xl font-bold text-gray-900 dark:text-slate-100">TestGen</span>
//           </Link>

//           {/* Navigation Links */}
//           <div className="hidden md:flex items-center gap-1 ml-8">
//             <Link
//               to="/"
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 isActive('/')
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
//               }`}
//             >
//               <BarChart3 size={18} />
//               Dashboard
//             </Link>
            
//             <Link
//               to="/generator"
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 isActive('/generator')
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
//               }`}
//             >
//               <TestTube size={18} />
//               Generator
//             </Link>
            
//             <Link
//               to="/history"
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 isActive('/history')
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
//               }`}
//             >
//               <History size={18} />
//               History
//             </Link>

//             <Link
//               to="/jenkins"
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 isActive('/jenkins')
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
//               }`}
//             >
//               <Server size={18} />
//               Jenkins
//             </Link>
//           </div>
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-3">
//           {/* Theme Toggle */}
//           <button
//             onClick={toggleTheme}
//             className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
//             title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
//           >
//             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
//           </button>

//           <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
//             <Download size={16} />
//             Export
//           </button>
          
//           <Link 
//             to="/settings" 
//             className={`p-2 rounded-lg transition-colors ${
//               isActive('/settings')
//                 ? 'bg-blue-600 text-white'
//                 : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
//             }`}
//             title="Settings"
//           >
//             <Settings size={20} />
//           </Link>
//         </div>
//       </div>

//       {/* Mobile Navigation - Hidden for now, can be expanded later */}
//       <div className="md:hidden mt-4">
//         <div className="flex flex-wrap gap-2">
//           <Link
//             to="/"
//             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
//               isActive('/')
//                 ? 'bg-blue-600 text-white'
//                 : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
//             }`}
//           >
//             <BarChart3 size={16} />
//             Dashboard
//           </Link>
          
//           <Link
//             to="/generator"
//             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
//               isActive('/generator')
//                 ? 'bg-blue-600 text-white'
//                 : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
//             }`}
//           >
//             <TestTube size={16} />
//             Generator
//           </Link>
          
//           <Link
//             to="/history"
//             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
//               isActive('/history')
//                 ? 'bg-blue-600 text-white'
//                 : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
//             }`}
//           >
//             <History size={16} />
//             History
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { BarChart3, TestTube, History, Settings, Download, Activity, Sun, Moon, Server } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"

const Navbar: React.FC = () => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand/Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-slate-100">TestGen</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <BarChart3 size={18} />
              Dashboard
            </Link>

            <Link
              to="/generator"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/generator")
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <TestTube size={18} />
              Generator
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/history")
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <History size={18} />
              History
            </Link>

            <Link
              to="/jenkins"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/jenkins")
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <Server size={18} />
              Jenkins
            </Link>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
            <Download size={16} />
            Export
          </button>

          <Link
            to="/settings"
            className={`p-2 rounded-lg transition-colors ${
              isActive("/settings")
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
            title="Settings"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      {/* Mobile Navigation - Hidden for now, can be expanded later */}
      <div className="md:hidden mt-4">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/")
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <BarChart3 size={16} />
            Dashboard
          </Link>

          <Link
            to="/generator"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/generator")
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <TestTube size={16} />
            Generator
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/history")
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <History size={16} />
            History
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
