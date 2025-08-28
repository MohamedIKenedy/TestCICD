"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { BarChart3, TestTube, History, Settings, Activity, Server, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  const menuItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/generator", icon: TestTube, label: "Generator" },
    { path: "/assistant", icon: MessageSquare, label: "AI Assistant" },
    { path: "/history", icon: History, label: "History" },
    { path: "/jenkins", icon: Server, label: "Jenkins" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
      <div className={`bg-zinc-950 border-r border-zinc-800/50 transition-all duration-300 flex flex-col min-h-full ${
        isCollapsed ? "w-16" : "w-72"
      }`}>

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <span className="text-lg font-semibold text-zinc-100">TestGen</span>
              <p className="text-xs text-zinc-500 mt-0.5">AI Test Generator</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-zinc-800/80 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <item.icon size={18} className="flex-shrink-0 -ml-1" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-800/50">
          <div className="bg-zinc-900/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200">System Status</p>
                <p className="text-xs text-zinc-500">All services online</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
