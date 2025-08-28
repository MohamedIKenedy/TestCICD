// import React, { useState, useEffect } from 'react';
// import { 
//   Settings, 
//   Save, 
//   TestTube2, 
//   Server, 
//   Database,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   BarChart3
// } from 'lucide-react';
// import { apiService } from '../services/api';
// import { UserPreferences } from '../types';

// interface JenkinsConfig {
//   url: string;
//   username: string;
//   token: string;
//   jobName: string;
// }

// interface DatabaseConfig {
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
// }

// interface AppSettings {
//   jenkins: JenkinsConfig;
//   database: DatabaseConfig;
//   ollama: {
//     url: string;
//     model: string;
//   };
//   preferences: UserPreferences;
// }

// const SettingsPage: React.FC = () => {
//   const [settings, setSettings] = useState<AppSettings>({
//     jenkins: {
//       url: '',
//       username: '',
//       token: '',
//       jobName: ''
//     },
//     database: {
//       host: 'localhost',
//       port: 5432,
//       database: 'test_coverage',
//       username: '',
//       password: ''
//     },
//     ollama: {
//       url: 'http://localhost:11434',
//       model: 'starchat2:15b'
//     },
//     preferences: {
//       dashboard: {
//         defaultTimeRange: '7d',
//         refreshInterval: 30000, // 30 seconds
//         showChangeIndicators: true
//       }
//     }
//   });

//   const [connectionStatus, setConnectionStatus] = useState({
//     jenkins: 'idle',
//     database: 'idle',
//     ollama: 'idle'
//   });

//   const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

//   useEffect(() => {
//     // Load settings from localStorage and API on component mount
//     loadSettings();
//   }, []);

//   const loadSettings = async () => {
//     try {
//       // Load Jenkins settings from API
//       const jenkinsSettings = await apiService.getJenkinsSettings();
//       if (jenkinsSettings) {
//         setSettings(prev => ({
//           ...prev,
//           jenkins: jenkinsSettings
//         }));
//       }
//     } catch (error) {
//       console.error('Failed to load Jenkins settings:', error);
//     }

//     // Load other settings from localStorage
//     const savedSettings = localStorage.getItem('appSettings');
//     if (savedSettings) {
//       const parsed = JSON.parse(savedSettings);
//       setSettings(prev => ({
//         ...prev,
//         database: parsed.database || prev.database,
//         ollama: parsed.ollama || prev.ollama,
//         preferences: parsed.preferences || prev.preferences
//       }));
//     }
//   };

//   const handleInputChange = (section: keyof AppSettings, field: string, value: string | number) => {
//     setSettings(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [field]: value
//       }
//     }));
//   };

//   const handlePreferenceChange = (category: keyof UserPreferences, field: string, value: string | number | boolean) => {
//     setSettings(prev => ({
//       ...prev,
//       preferences: {
//         ...prev.preferences,
//         [category]: {
//           ...prev.preferences[category],
//           [field]: value
//         }
//       }
//     }));
//   };

//   const testJenkinsConnection = async () => {
//     setConnectionStatus(prev => ({ ...prev, jenkins: 'testing' }));
    
//     try {
//       const result = await apiService.testJenkinsConnection(settings.jenkins);
      
//       if (result.success) {
//         setConnectionStatus(prev => ({ ...prev, jenkins: 'connected' }));
//       } else {
//         setConnectionStatus(prev => ({ ...prev, jenkins: 'error' }));
//         alert(`Jenkins connection failed: ${result.message}`);
//       }
//     } catch (error) {
//       setConnectionStatus(prev => ({ ...prev, jenkins: 'error' }));
//       alert(`Jenkins connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   };

//   const testDatabaseConnection = async () => {
//     setConnectionStatus(prev => ({ ...prev, database: 'testing' }));
    
//     try {
//       const response = await fetch(`/api/test-database`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(settings.database)
//       });

//       if (response.ok) {
//         setConnectionStatus(prev => ({ ...prev, database: 'success' }));
//       } else {
//         setConnectionStatus(prev => ({ ...prev, database: 'error' }));
//       }
//     } catch (error) {
//       setConnectionStatus(prev => ({ ...prev, database: 'error' }));
//     }
//   };

//   const testOllamaConnection = async () => {
//     setConnectionStatus(prev => ({ ...prev, ollama: 'testing' }));
    
//     try {
//       const response = await fetch(`/api/test-ollama`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(settings.ollama)
//       });

//       if (response.ok) {
//         setConnectionStatus(prev => ({ ...prev, ollama: 'success' }));
//       } else {
//         setConnectionStatus(prev => ({ ...prev, ollama: 'error' }));
//       }
//     } catch (error) {
//       setConnectionStatus(prev => ({ ...prev, ollama: 'error' }));
//     }
//   };

//   const saveSettings = async () => {
//     setSaveStatus('saving');
    
//     try {
//       // Save Jenkins settings via API
//       await apiService.saveJenkinsSettings(settings.jenkins);
      
//       // Save other settings to localStorage
//       const localSettings = {
//         database: settings.database,
//         ollama: settings.ollama,
//         preferences: settings.preferences
//       };
//       localStorage.setItem('appSettings', JSON.stringify(localSettings));

//       setSaveStatus('saved');
//       setTimeout(() => setSaveStatus('idle'), 2000);
//     } catch (error) {
//       console.error('Failed to save settings:', error);
//       setSaveStatus('error');
//       setTimeout(() => setSaveStatus('idle'), 3000);
//       alert('Failed to save Jenkins settings. Please check your configuration and try again.');
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'testing':
//         return <AlertCircle className="w-4 h-4 text-yellow-500 animate-spin" />;
//       case 'success':
//         return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case 'error':
//         return <XCircle className="w-4 h-4 text-red-500" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6 transition-colors">
//           <div className="flex items-center gap-3">
//             <Settings className="w-6 h-6 text-blue-500 dark:text-blue-400" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
//               <p className="text-gray-600 dark:text-slate-400">Configure your application connections and preferences</p>
//             </div>
//           </div>
//         </div>

//         {/* Jenkins Configuration */}
//         <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-6 mb-6 transition-colors">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <Server className="w-5 h-5 text-orange-600 dark:text-orange-400" />
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Jenkins Integration</h2>
//             </div>
//             <div className="flex items-center gap-2">
//               {getStatusIcon(connectionStatus.jenkins)}
//               <button
//                 onClick={testJenkinsConnection}
//                 className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-400/20 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-400/30 transition-colors"
//                 disabled={connectionStatus.jenkins === 'testing'}
//               >
//                 Test Connection
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Jenkins URL
//               </label>
//               <input
//                 type="text"
//                 value={settings.jenkins.url}
//                 onChange={(e) => handleInputChange('jenkins', 'url', e.target.value)}
//                 placeholder="http://localhost:8080"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Job Name
//               </label>
//               <input
//                 type="text"
//                 value={settings.jenkins.jobName}
//                 onChange={(e) => handleInputChange('jenkins', 'jobName', e.target.value)}
//                 placeholder="test-generation-job"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={settings.jenkins.username}
//                 onChange={(e) => handleInputChange('jenkins', 'username', e.target.value)}
//                 placeholder="your-username"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 API Token
//               </label>
//               <input
//                 type="password"
//                 value={settings.jenkins.token}
//                 onChange={(e) => handleInputChange('jenkins', 'token', e.target.value)}
//                 placeholder="your-api-token"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Database Configuration */}
//         <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-6 mb-6 transition-colors">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Database Configuration</h2>
//             </div>
//             <div className="flex items-center gap-2">
//               {getStatusIcon(connectionStatus.database)}
//               <button
//                 onClick={testDatabaseConnection}
//                 className="px-3 py-1 text-sm bg-green-100 dark:bg-green-400/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-400/30 transition-colors"
//                 disabled={connectionStatus.database === 'testing'}
//               >
//                 Test Connection
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Host
//               </label>
//               <input
//                 type="text"
//                 value={settings.database.host}
//                 onChange={(e) => handleInputChange('database', 'host', e.target.value)}
//                 placeholder="localhost"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Port
//               </label>
//               <input
//                 type="number"
//                 value={settings.database.port}
//                 onChange={(e) => handleInputChange('database', 'port', parseInt(e.target.value))}
//                 placeholder="5432"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Database Name
//               </label>
//               <input
//                 type="text"
//                 value={settings.database.database}
//                 onChange={(e) => handleInputChange('database', 'database', e.target.value)}
//                 placeholder="test_coverage"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={settings.database.username}
//                 onChange={(e) => handleInputChange('database', 'username', e.target.value)}
//                 placeholder="db-username"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={settings.database.password}
//                 onChange={(e) => handleInputChange('database', 'password', e.target.value)}
//                 placeholder="db-password"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Ollama Configuration */}
//         <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-6 mb-6 transition-colors">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <TestTube2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Ollama AI Configuration</h2>
//             </div>
//             <div className="flex items-center gap-2">
//               {getStatusIcon(connectionStatus.ollama)}
//               <button
//                 onClick={testOllamaConnection}
//                 className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-400/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-400/30 transition-colors"
//                 disabled={connectionStatus.ollama === 'testing'}
//               >
//                 Test Connection
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Ollama URL
//               </label>
//               <input
//                 type="text"
//                 value={settings.ollama.url}
//                 onChange={(e) => handleInputChange('ollama', 'url', e.target.value)}
//                 placeholder="http://localhost:11434"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Model Name
//               </label>
//               <input
//                 type="text"
//                 value={settings.ollama.model}
//                 onChange={(e) => handleInputChange('ollama', 'model', e.target.value)}
//                 placeholder="starchat2:15b"
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Dashboard Preferences */}
//         <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-6 mb-6 transition-colors">
//           <div className="flex items-center gap-3 mb-4">
//             <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Dashboard Preferences</h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Default Time Range
//               </label>
//               <select
//                 value={settings.preferences.dashboard.defaultTimeRange}
//                 onChange={(e) => handlePreferenceChange('dashboard', 'defaultTimeRange', e.target.value)}
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               >
//                 <option value="24h">Last 24 Hours</option>
//                 <option value="7d">Last 7 Days</option>
//                 <option value="30d">Last 30 Days</option>
//                 <option value="all">All Time</option>
//               </select>
//               <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
//                 The default time range when opening the dashboard
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
//                 Auto-refresh Interval
//               </label>
//               <select
//                 value={settings.preferences.dashboard.refreshInterval}
//                 onChange={(e) => handlePreferenceChange('dashboard', 'refreshInterval', parseInt(e.target.value))}
//                 className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               >
//                 <option value="15000">15 seconds</option>
//                 <option value="30000">30 seconds</option>
//                 <option value="60000">1 minute</option>
//                 <option value="300000">5 minutes</option>
//                 <option value="600000">10 minutes</option>
//                 <option value="0">Disabled</option>
//               </select>
//               <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
//                 How often the dashboard automatically refreshes data
//               </p>
//             </div>

//             <div className="md:col-span-2">
//               <div className="flex items-center gap-3">
//                 <input
//                   type="checkbox"
//                   id="showChangeIndicators"
//                   checked={settings.preferences.dashboard.showChangeIndicators}
//                   onChange={(e) => handlePreferenceChange('dashboard', 'showChangeIndicators', e.target.checked)}
//                   className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//                 />
//                 <label htmlFor="showChangeIndicators" className="text-sm font-medium text-gray-700 dark:text-slate-300">
//                   Show change indicators on stat cards
//                 </label>
//               </div>
//               <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 ml-7">
//                 Display percentage changes and trend arrows on dashboard statistics
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Save Button */}
//         <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-6 transition-colors">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-600 dark:text-slate-400">
//               Settings are saved locally and synchronized with the backend
//             </div>
//             <button
//               onClick={saveSettings}
//               disabled={saveStatus === 'saving'}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
//             >
//               <Save className="w-4 h-4" />
//               {saveStatus === 'saving' ? 'Saving...' : 
//                saveStatus === 'saved' ? 'Saved!' : 
//                saveStatus === 'error' ? 'Error!' : 'Save Settings'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsPage;
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Settings,
  Save,
  TestTube2,
  Server,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Shield,
} from "lucide-react"
import { apiService } from "../services/api"
import type { UserPreferences } from "../types"

interface JenkinsConfig {
  url: string
  username: string
  token: string
  jobName: string
}

interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

interface AppSettings {
  jenkins: JenkinsConfig
  database: DatabaseConfig
  ollama: {
    url: string
    model: string
  }
  preferences: UserPreferences
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    jenkins: {
      url: "",
      username: "",
      token: "",
      jobName: "",
    },
    database: {
      host: "localhost",
      port: 5432,
      database: "test_coverage",
      username: "",
      password: "",
    },
    ollama: {
      url: "http://localhost:11434",
      model: "starchat2:15b",
    },
    preferences: {
      dashboard: {
        defaultTimeRange: "7d",
        refreshInterval: 30000,
        showChangeIndicators: true,
      },
    },
  })

  const [connectionStatus, setConnectionStatus] = useState({
    jenkins: "idle",
    database: "idle",
    ollama: "idle",
  })

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const jenkinsSettings = await apiService.getJenkinsSettings()
      if (jenkinsSettings) {
        setSettings((prev) => ({
          ...prev,
          jenkins: jenkinsSettings,
        }))
      }
    } catch (error) {
      console.error("Failed to load Jenkins settings:", error)
    }

    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings((prev) => ({
        ...prev,
        database: parsed.database || prev.database,
        ollama: parsed.ollama || prev.ollama,
        preferences: parsed.preferences || prev.preferences,
      }))
    }
  }

  const handleInputChange = (section: keyof AppSettings, field: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handlePreferenceChange = (category: keyof UserPreferences, field: string, value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [field]: value,
        },
      },
    }))
  }

  const testJenkinsConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, jenkins: "testing" }))

    try {
      const result = await apiService.testJenkinsConnection(settings.jenkins)

      if (result.success) {
        setConnectionStatus((prev) => ({ ...prev, jenkins: "connected" }))
      } else {
        setConnectionStatus((prev) => ({ ...prev, jenkins: "error" }))
        alert(`Jenkins connection failed: ${result.message}`)
      }
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, jenkins: "error" }))
      alert(`Jenkins connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const testDatabaseConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, database: "testing" }))

    try {
      const response = await fetch(`/api/test-database`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings.database),
      })

      if (response.ok) {
        setConnectionStatus((prev) => ({ ...prev, database: "success" }))
      } else {
        setConnectionStatus((prev) => ({ ...prev, database: "error" }))
      }
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, database: "error" }))
    }
  }

  const testOllamaConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, ollama: "testing" }))

    try {
      const response = await fetch(`/api/test-ollama`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings.ollama),
      })

      if (response.ok) {
        setConnectionStatus((prev) => ({ ...prev, ollama: "success" }))
      } else {
        setConnectionStatus((prev) => ({ ...prev, ollama: "error" }))
      }
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, ollama: "error" }))
    }
  }

  const saveSettings = async () => {
    setSaveStatus("saving")
    const errors = []

    try {
      // Try to save Jenkins settings first, but don't fail if it doesn't work
      try {
        await apiService.saveJenkinsSettings(settings.jenkins)
        console.log("✅ Jenkins settings saved successfully")
      } catch (jenkinsError) {
        console.error("⚠️ Failed to save Jenkins settings:", jenkinsError)
        errors.push("Jenkins settings could not be saved")
        // Continue with other settings even if Jenkins fails
      }

      // Save other settings to localletStorage (these should always work)
      const localSettings = {
        database: settings.database,
        ollama: settings.ollama,
        preferences: settings.preferences,
      }
      localStorage.setItem("appSettings", JSON.stringify(localSettings))
      console.log("✅ Local settings saved successfully")

      // Determine final status
      if (errors.length === 0) {
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("saved") // Still show success since local settings were saved
        setTimeout(() => setSaveStatus("idle"), 2000)
        
        // Show warning about partial save
        alert(
          `Settings partially saved!\n\n` +
          `✅ Local settings (database, ollama, preferences) saved successfully\n` +
          `⚠️ Issues encountered:\n${errors.join('\n')}\n\n` +
          `Please check your Jenkins configuration and try again.`
        )
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
      alert("Failed to save settings. Please try again.")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "testing":
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "connected":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "testing":
        return "Testing..."
      case "success":
      case "connected":
        return "Connected"
      case "error":
        return "Failed"
      default:
        return "Not tested"
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
            <p className="text-zinc-400 mt-1">Configure your application connections and preferences</p>
          </div>
        </div>

        {/* Jenkins Configuration */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Server className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Jenkins Integration</h2>
                <p className="text-sm text-zinc-400">Connect to your Jenkins CI/CD server</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(connectionStatus.jenkins)}
                <span className="text-zinc-400 font-medium">{getStatusText(connectionStatus.jenkins)}</span>
              </div>
              <button
                onClick={testJenkinsConnection}
                className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/20 hover:border-orange-500/30 rounded-xl transition-all duration-200 text-sm font-medium"
                disabled={connectionStatus.jenkins === "testing"}
              >
                Test Connection
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Jenkins URL</label>
              <input
                type="text"
                value={settings.jenkins.url}
                onChange={(e) => handleInputChange("jenkins", "url", e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Job Name</label>
              <input
                type="text"
                value={settings.jenkins.jobName}
                onChange={(e) => handleInputChange("jenkins", "jobName", e.target.value)}
                placeholder="test-generation-job"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
              <input
                type="text"
                value={settings.jenkins.username}
                onChange={(e) => handleInputChange("jenkins", "username", e.target.value)}
                placeholder="your-username"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">API Token</label>
              <input
                type="password"
                value={settings.jenkins.token}
                onChange={(e) => handleInputChange("jenkins", "token", e.target.value)}
                placeholder="your-api-token"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Database Configuration */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Database Configuration</h2>
                <p className="text-sm text-zinc-400">Configure your PostgreSQL database connection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(connectionStatus.database)}
                <span className="text-zinc-400 font-medium">{getStatusText(connectionStatus.database)}</span>
              </div>
              <button
                onClick={testDatabaseConnection}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/30 rounded-xl transition-all duration-200 text-sm font-medium"
                disabled={connectionStatus.database === "testing"}
              >
                Test Connection
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Host</label>
              <input
                type="text"
                value={settings.database.host}
                onChange={(e) => handleInputChange("database", "host", e.target.value)}
                placeholder="localhost"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Port</label>
              <input
                type="number"
                value={settings.database.port}
                onChange={(e) => handleInputChange("database", "port", Number.parseInt(e.target.value))}
                placeholder="5432"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Database Name</label>
              <input
                type="text"
                value={settings.database.database}
                onChange={(e) => handleInputChange("database", "database", e.target.value)}
                placeholder="test_coverage"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
              <input
                type="text"
                value={settings.database.username}
                onChange={(e) => handleInputChange("database", "username", e.target.value)}
                placeholder="db-username"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                type="password"
                value={settings.database.password}
                onChange={(e) => handleInputChange("database", "password", e.target.value)}
                placeholder="db-password"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Ollama Configuration */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <TestTube2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Ollama AI Configuration</h2>
                <p className="text-sm text-zinc-400">Configure your local AI model server</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(connectionStatus.ollama)}
                <span className="text-zinc-400 font-medium">{getStatusText(connectionStatus.ollama)}</span>
              </div>
              <button
                onClick={testOllamaConnection}
                className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/30 rounded-xl transition-all duration-200 text-sm font-medium"
                disabled={connectionStatus.ollama === "testing"}
              >
                Test Connection
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Ollama URL</label>
              <input
                type="text"
                value={settings.ollama.url}
                onChange={(e) => handleInputChange("ollama", "url", e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Model Name</label>
              <input
                type="text"
                value={settings.ollama.model}
                onChange={(e) => handleInputChange("ollama", "model", e.target.value)}
                placeholder="starchat2:15b"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Preferences */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Dashboard Preferences</h2>
              <p className="text-sm text-zinc-400">Customize your dashboard experience</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Default Time Range</label>
              <select
                value={settings.preferences.dashboard.defaultTimeRange}
                onChange={(e) => handlePreferenceChange("dashboard", "defaultTimeRange", e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <p className="text-xs text-zinc-500 mt-2">The default time range when opening the dashboard</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Auto-refresh Interval</label>
              <select
                value={settings.preferences.dashboard.refreshInterval}
                onChange={(e) =>
                  handlePreferenceChange("dashboard", "refreshInterval", Number.parseInt(e.target.value))
                }
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
              >
                <option value="15000">15 seconds</option>
                <option value="30000">30 seconds</option>
                <option value="60000">1 minute</option>
                <option value="300000">5 minutes</option>
                <option value="600000">10 minutes</option>
                <option value="0">Disabled</option>
              </select>
              <p className="text-xs text-zinc-500 mt-2">How often the dashboard automatically refreshes data</p>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-3 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                <input
                  type="checkbox"
                  id="showChangeIndicators"
                  checked={settings.preferences.dashboard.showChangeIndicators}
                  onChange={(e) => handlePreferenceChange("dashboard", "showChangeIndicators", e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <label htmlFor="showChangeIndicators" className="text-sm font-medium text-zinc-300 cursor-pointer">
                    Show change indicators on stat cards
                  </label>
                  <p className="text-xs text-zinc-500 mt-1">
                    Display percentage changes and trend arrows on dashboard statistics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-300">Settings Management</p>
                <p className="text-xs text-zinc-500">Settings are saved locally and synchronized with the backend</p>
              </div>
            </div>
            <button
              onClick={saveSettings}
              disabled={saveStatus === "saving"}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                saveStatus === "saved"
                  ? "bg-emerald-600 text-white"
                  : saveStatus === "error"
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
              } disabled:opacity-50`}
            >
              {saveStatus === "saving" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : saveStatus === "error" ? (
                <>
                  <XCircle className="w-4 h-4" />
                  Error!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
