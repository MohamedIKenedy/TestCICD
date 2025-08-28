// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ThemeProvider } from './contexts/ThemeContext';
// import Navbar from './components/Navbar';
// import DashboardPage from './pages/DashboardPage';
// import HomePage from './pages/HomePage';
// import TestHistoryPage from './pages/TestHistoryPage';
// import ViewTestPage from './pages/ViewTestPage';
// import SettingsPage from './pages/SettingsPage';
// import JenkinsPage from './pages/JenkinsPage';
// import ChatAssistant from './components/ChatAssistant';

// function App() {
//   return (
//     <ThemeProvider>
//       <Router>
//         <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
//           <Navbar />
//           <Routes>
//             <Route path="/" element={<DashboardPage />} />
//             <Route path="/generator" element={<HomePage />} />
//             <Route path="/history" element={<TestHistoryPage />} />
//             <Route path="/tests/:testId/view" element={<ViewTestPage />} />
//             <Route path="/settings" element={<SettingsPage />} />
//             <Route path="/jenkins" element={<JenkinsPage />} />
//           </Routes>
//           <ChatAssistant />
//         </div>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;
"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import Sidebar from "./components/Sidebar"
import DashboardPage from "./pages/DashboardPage"
import HomePage from "./pages/HomePage"
import AssistantPage from "./pages/AssistantPage"
import TestHistoryPage from "./pages/TestHistoryPage"
import ViewTestPage from "./pages/ViewTestPage"
import SettingsPage from "./pages/SettingsPage"
import JenkinsPage from "./pages/JenkinsPage"

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-black text-slate-100 flex">
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/generator" element={<HomePage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/history" element={<TestHistoryPage />} />
                <Route path="/tests/:testId/view" element={<ViewTestPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/jenkins" element={<JenkinsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
