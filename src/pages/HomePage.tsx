"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Upload, Play, TestTube, MessageCircle, Sparkles, Code2, GripVertical } from "lucide-react"
import FileUpload from "../components/FileUpload"
import FileTree from "../components/FileTree"
import CodeViewer from "../components/CodeViewer"
import ProgressTimeline from "../components/ProgressTimeline"
import BatchProgress from "../components/BatchProgress"
import GeneratedFilesList from "../components/GeneratedFilesList"
import FixerModal from "../components/FixerModal"
import type { FileTreeNode, GeneratedTest, ContextFiles } from "../types"
import { apiService } from "../services/api"

const HomePage: React.FC = () => {
  const [fileTree, setFileTree] = useState<FileTreeNode | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentFilePath, setCurrentFilePath] = useState<string>("")
  const [currentCode, setCurrentCode] = useState<string>("")
  const [singleFileContext, setSingleFileContext] = useState<string[]>([])
  const [fileContexts, setFileContexts] = useState<ContextFiles>({})
  const [llmModel, setLlmModel] = useState("starchat2:15b")
  const [framework, setFramework] = useState("junit")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  
  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320) // Default 320px
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const [batchProgress, setBatchProgress] = useState({
    show: false,
    current: 0,
    total: 0,
    files: [] as Array<{
      name: string
      status: "waiting" | "processing" | "completed" | "error"
      message: string
    }>,
  })
  const [generatedTests, setGeneratedTests] = useState<Record<string, GeneratedTest>>({})
  const [showFixerModal, setShowFixerModal] = useState(false)
  const [currentFixingFile, setCurrentFixingFile] = useState<string>("")
  const [currentFixingContent, setCurrentFixingContent] = useState<string>("")

  const handleUploadComplete = useCallback((tree: FileTreeNode) => {
    setFileTree(tree)
    setSelectedFiles([])
    setFileContexts({})
  }, [])

  const handleFileSelect = useCallback(async (filePath: string) => {
    setCurrentFilePath(filePath)
    setSingleFileContext([]) // Clear context when selecting new file
    try {
      const response = await apiService.readFile(filePath)
      setCurrentCode(response.code)
    } catch (error) {
      console.error("Failed to read file:", error)
      setCurrentCode("Failed to load file content")
    }
  }, [])

  const handleFileSelectionChange = useCallback(
    (filePath: string, selected: boolean) => {
      if (selected) {
        setSelectedFiles((prev) => [...prev, filePath])
        if (!fileContexts[filePath]) {
          setFileContexts((prev) => ({ ...prev, [filePath]: [] }))
        }
      } else {
        setSelectedFiles((prev) => prev.filter((f) => f !== filePath))
        setFileContexts((prev) => {
          const newContexts = { ...prev }
          delete newContexts[filePath]
          return newContexts
        })
      }
    },
    [fileContexts],
  )

  const handleContextChange = useCallback((filePath: string, contextFiles: string[]) => {
    setFileContexts((prev) => ({ ...prev, [filePath]: contextFiles }))
  }, [])

  // Resize handlers for sidebar
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    const newWidth = e.clientX
    // Constrain width between 250px and 600px
    const constrainedWidth = Math.max(250, Math.min(600, newWidth))
    setSidebarWidth(constrainedWidth)
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add global mouse events for dragging
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const simulateProgressSteps = async () => {
    const steps = [
      { step: 1, delay: 800 },
      { step: 2, delay: 1200 },
      { step: 3, delay: 2000 },
      { step: 4, delay: 600 },
    ]

    for (const { step, delay } of steps) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  const handleSingleGenerate = async () => {
    if (!currentFilePath || !currentCode) return

    setIsGenerating(true)
    setShowProgress(true)

    try {
      const progressPromise = simulateProgressSteps()

      const response = await apiService.generateTests({
        code: currentCode,
        fileName: currentFilePath.split("/").pop() || "",
        llm: llmModel,
        framework,
        context: singleFileContext.length > 0
          ? await apiService.getContextData(singleFileContext)
          : undefined,
      })

      await progressPromise

      const testFileName = currentFilePath.split("/").pop()?.replace(".java", "Test.java") || "Test.java"
      setGeneratedTests((prev) => ({
        ...prev,
        [testFileName]: {
          fileName: testFileName,
          content: response,
          originalFile: currentFilePath,
        },
      }))
    } catch (error) {
      console.error("Failed to generate test:", error)
    } finally {
      setIsGenerating(false)
      setTimeout(() => setShowProgress(false), 1000)
    }
  }

  const handleBatchGenerate = async () => {
    if (selectedFiles.length === 0) return

    setBatchProgress({
      show: true,
      current: 0,
      total: selectedFiles.length,
      files: selectedFiles.map((path) => ({
        name: path.split(/[/\\]/).pop() || "",
        status: "waiting",
        message: "Waiting...",
      })),
    })

    const newGeneratedTests: Record<string, GeneratedTest> = {}

    for (let i = 0; i < selectedFiles.length; i++) {
      const filePath = selectedFiles[i]

      const relativeFileName = filePath.replace(/^.*uploads[\\/]/, "")

      setBatchProgress((prev) => ({
        ...prev,
        current: i + 1,
        files: prev.files.map((file, index) =>
          index === i ? { ...file, status: "processing", message: "Generating tests..." } : file,
        ),
      }))

      try {
        const fileResponse = await apiService.readFile(filePath)
        const contextData = fileContexts[filePath] ? await apiService.getContextData(fileContexts[filePath]) : undefined

        const testCode = await apiService.generateTests({
          code: fileResponse.code,
          fileName: relativeFileName,
          llm: llmModel,
          framework,
          context: contextData,
        })

        const testFileName = relativeFileName.split(/[/\\]/).pop()?.replace(".java", "Test.java") || "Test.java"
        newGeneratedTests[testFileName] = {
          fileName: testFileName,
          content: testCode,
          originalFile: filePath,
        }

        setBatchProgress((prev) => ({
          ...prev,
          files: prev.files.map((file, index) =>
            index === i ? { ...file, status: "completed", message: "Completed" } : file,
          ),
        }))
      } catch (error) {
        setBatchProgress((prev) => ({
          ...prev,
          files: prev.files.map((file, index) =>
            index === i ? { ...file, status: "error", message: "Failed to generate" } : file,
          ),
        }))
      }
    }
  }

  const handleFixCode = (fileName: string, content: string) => {
    setCurrentFixingFile(fileName)
    setCurrentFixingContent(content)
    setShowFixerModal(true)
  }

  const handleFixSubmit = async (errorMessage: string) => {
    try {
      const fixedCode = await apiService.fixCode({
        fileName: currentFixingFile,
        code: currentFixingContent,
        error: errorMessage,
        llm: llmModel,
        framework,
      })

      setGeneratedTests((prev) => ({
        ...prev,
        [currentFixingFile]: {
          ...prev[currentFixingFile],
          content: fixedCode,
        },
      }))

      setShowFixerModal(false)
      return true
    } catch (error) {
      console.error("Failed to fix code:", error)
      return false
    }
  }

  const downloadAllTests = () => {
    console.log("Download all tests:", generatedTests)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="flex h-screen">
        {/* Resizable Sidebar */}
        <div 
          ref={sidebarRef}
          className="bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800/50 overflow-y-auto relative flex-shrink-0"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="p-6 space-y-8">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">Upload Project</h2>
                  <p className="text-sm text-zinc-400">Start by uploading your Java files</p>
                </div>
              </div>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                llmModel={llmModel}
                onLlmChange={setLlmModel}
                framework={framework}
                onFrameworkChange={setFramework}
              />
            </div>

            {/* File Tree */}
            {fileTree && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">Project Files</h2>
                    <p className="text-sm text-zinc-400">Select files to generate tests</p>
                  </div>
                </div>
                <FileTree
                  tree={fileTree}
                  selectedFiles={selectedFiles}
                  fileContexts={fileContexts}
                  onFileSelect={handleFileSelect}
                  onFileSelectionChange={handleFileSelectionChange}
                  onContextChange={handleContextChange}
                />
                {selectedFiles.length > 0 && (
                  <button
                    onClick={handleBatchGenerate}
                    disabled={batchProgress.show}
                    className="w-full bg-zinc-800/50 hover:bg-zinc-800/70 disabled:bg-zinc-800/30 disabled:opacity-50 text-zinc-100 px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-zinc-700/50 hover:border-zinc-600/50"
                  >
                    <Play size={16} />
                    Generate Tests for Selected ({selectedFiles.length})
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Resize Handle */}
          <div
            ref={resizeHandleRef}
            className="absolute top-0 right-0 w-1 h-full bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-8 bg-zinc-700/50 hover:bg-blue-500/30 rounded-l-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={12} className="text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8 space-y-8 overflow-y-auto">
            {/* Code Viewer Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100">Code Preview</h2>
                  <p className="text-sm text-zinc-400">View and generate tests for individual files</p>
                </div>
              </div>

              {showProgress && <ProgressTimeline />}

              <CodeViewer
                code={currentCode}
                filePath={currentFilePath}
                onGenerate={handleSingleGenerate}
                isGenerating={isGenerating}
                selectedContextPaths={singleFileContext}
                onContextChange={setSingleFileContext}
              />
            </div>

            {/* Generated Tests Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100">Generated Tests</h2>
                  <p className="text-sm text-zinc-400">Review and manage your test files</p>
                </div>
              </div>

              {batchProgress.show && (
                <BatchProgress
                  current={batchProgress.current}
                  total={batchProgress.total}
                  files={batchProgress.files}
                />
              )}

              {Object.keys(generatedTests).length > 0 && (
                <GeneratedFilesList tests={generatedTests} onFixCode={handleFixCode} onDownloadAll={downloadAllTests} />
              )}
            </div>

            {/* AI Code Assistant Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-100">AI Code Assistant</h2>
                    <p className="text-sm text-zinc-400">Get intelligent help with your code</p>
                  </div>
                </div>
                <Link
                  to="/assistant"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200 font-medium"
                >
                  <MessageCircle size={16} />
                  Open AI Assistant
                </Link>
              </div>

              {/* Quick AI Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  to="/assistant"
                  className="p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl hover:bg-zinc-900/70 hover:border-zinc-700/50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <TestTube size={18} className="text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-zinc-100">Generate Smart Tests</h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Ask AI to generate targeted unit tests for your current file with intelligent coverage analysis
                  </p>
                </Link>

                <Link
                  to="/assistant"
                  className="p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl hover:bg-zinc-900/70 hover:border-zinc-700/50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <MessageCircle size={18} className="text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-zinc-100">Code Analysis</h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Get insights on code quality, potential bugs, and improvement suggestions from AI
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixer Modal */}
      <FixerModal
        isOpen={showFixerModal}
        onClose={() => setShowFixerModal(false)}
        onSubmit={handleFixSubmit}
        fileName={currentFixingFile}
      />
    </div>
  )
}

export default HomePage
