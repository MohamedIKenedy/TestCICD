"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  Bot,
  User,
  Code,
  FileText,
  Loader2,
  Copy,
  Download,
  Database,
  GitBranch,
  Minimize2,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react"
import { apiService } from "../services/api"
import type { ChatMessage, CodeChatRequest } from "../types"

interface CodeChatbotProps {
  currentFile?: string
  selectedCode?: string
  projectFiles?: string[]
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
  embedded?: boolean
}

const CodeChatbot: React.FC<CodeChatbotProps> = ({
  currentFile,
  selectedCode,
  projectFiles,
  isMinimized = false,
  onToggleMinimize,
  onClose,
  embedded = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI code assistant. I can help you with test generation, code analysis, database queries, and more. What would you like to work on?",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [includeDatabase, setIncludeDatabase] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [expandedCode, setExpandedCode] = useState<{ [key: string]: boolean }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const request: CodeChatRequest = {
        message: inputMessage.trim(),
        context: {
          currentFile,
          selectedCode,
          projectFiles,
          databaseContext: includeDatabase,
        },
        conversationHistory: messages.slice(-10),
      }

      const response = await apiService.chatWithCodeAssistant(request)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        type: response.codeSnippet ? "code" : response.diff ? "diff" : "text",
        metadata: response.codeSnippet
          ? {
              language: response.codeSnippet.language,
              fileName: response.codeSnippet.fileName,
            }
          : response.diff
            ? {
                fileName: response.diff.fileName,
                originalCode: response.diff.oldCode,
                modifiedCode: response.diff.newCode,
              }
            : undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (response.codeSnippet) {
        const codeMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: response.codeSnippet.code,
          timestamp: new Date(),
          type: "code",
          metadata: {
            language: response.codeSnippet.language,
            fileName: response.codeSnippet.fileName,
          },
        }
        setMessages((prev) => [...prev, codeMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please make sure the backend is running and try again.",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [messageId]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [messageId]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const downloadCode = (code: string, fileName: string) => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleCodeExpansion = (messageId: string) => {
    setExpandedCode((prev) => ({ ...prev, [messageId]: !prev[messageId] }))
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === "user"
    const isExpanded = expandedCode[message.id]
    const isCopied = copiedStates[message.id]

    return (
      <div key={message.id} className={`mb-6 ${isUser ? "ml-8" : "mr-8"}`}>
        <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && (
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} className="text-gray-300" />
            </div>
          )}

          <div className={`max-w-full ${isUser ? "order-first" : ""}`}>
            <div
              className={`rounded-lg p-4 ${
                isUser
                  ? "bg-gray-800 text-white border border-gray-700"
                  : "bg-gray-900 text-gray-100 border border-gray-700"
              }`}
            >
              {message.type === "code" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <Code size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">{message.metadata?.language || "code"}</span>
                      {message.metadata?.fileName && (
                        <span className="text-sm text-gray-500">• {message.metadata.fileName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{message.content.split("\n").length} lines</span>
                      <button
                        onClick={() => toggleCodeExpansion(message.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <pre
                      className={`bg-black text-gray-100 p-4 rounded-lg text-sm font-mono leading-relaxed overflow-x-auto border border-gray-800 ${
                        !isExpanded && message.content.split("\n").length > 10 ? "max-h-60 overflow-y-hidden" : ""
                      }`}
                      style={{
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        maxWidth: "100%",
                      }}
                    >
                      <code>{message.content}</code>
                    </pre>
                    {!isExpanded && message.content.split("\n").length > 10 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent rounded-b-lg" />
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors text-gray-200 border border-gray-600"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                    {message.metadata?.fileName && (
                      <button
                        onClick={() => downloadCode(message.content, message.metadata!.fileName!)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors border border-gray-600"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ) : message.type === "diff" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                    <GitBranch size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Code Changes</span>
                    {message.metadata?.fileName && (
                      <span className="text-sm text-gray-500">• {message.metadata.fileName}</span>
                    )}
                  </div>

                  <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
                      <div>
                        <div className="bg-gray-700 px-3 py-2 text-xs font-medium text-gray-300 border-b border-gray-600">
                          Before
                        </div>
                        <pre
                          className="p-3 text-xs overflow-x-auto max-h-40 text-gray-300 font-mono leading-relaxed"
                          style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
                        >
                          {message.metadata?.originalCode}
                        </pre>
                      </div>
                      <div>
                        <div className="bg-gray-700 px-3 py-2 text-xs font-medium text-gray-300 border-b border-gray-600">
                          After
                        </div>
                        <pre
                          className="p-3 text-xs overflow-x-auto max-h-40 text-gray-300 font-mono leading-relaxed"
                          style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
                        >
                          {message.metadata?.modifiedCode}
                        </pre>
                      </div>
                    </div>
                    <div className="bg-gray-700 px-3 py-2 flex justify-between items-center border-t border-gray-600">
                      <span className="text-xs text-gray-400">Suggested improvements</span>
                      <button
                        onClick={() => copyToClipboard(message.metadata?.modifiedCode || "", message.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
                      >
                        {isCopied ? <Check size={10} /> : <Copy size={10} />}
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-invert max-w-none"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 px-1">
              <div className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</div>
              {!isUser && message.type === "text" && (
                <button
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {isUser && (
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <User size={16} className="text-gray-300" />
            </div>
          )}
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      icon: Code,
      label: "Generate Tests",
      description: "Create unit tests with mocking",
      action: () =>
        setInputMessage("Generate comprehensive unit tests for the current file with edge cases and mocking"),
    },
    {
      icon: Bot,
      label: "Explain Code",
      description: "Understand code functionality",
      action: () => setInputMessage("Explain what this code does, its purpose, and how it works"),
    },
    {
      icon: GitBranch,
      label: "Refactor",
      description: "Improve code quality",
      action: () =>
        setInputMessage("Suggest refactoring improvements for better code quality, readability, and maintainability"),
    },
    {
      icon: FileText,
      label: "Document",
      description: "Generate documentation",
      action: () => setInputMessage("Generate comprehensive JavaDoc documentation for this class and its methods"),
    },
  ]

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 w-72 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="text-gray-300" size={20} />
            <div>
              <span className="font-medium text-white">Code Assistant</span>
              <p className="text-xs text-gray-400">Ready to help with your code</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onToggleMinimize} className="p-1 hover:bg-gray-800 rounded transition-colors">
              <Maximize2 size={16} className="text-gray-400 hover:text-white" />
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors">
                <X size={16} className="text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={
        embedded
          ? "w-full h-[700px] bg-transparent flex flex-col"
          : "fixed bottom-4 left-4 w-[480px] h-[700px] bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col"
      }
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <Bot size={18} className="text-gray-300" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Code Assistant</h3>
              <p className="text-xs text-gray-400">
                {isLoading ? "Processing your request..." : "Ready to help with your code"}
              </p>
            </div>
          </div>
          {!embedded && (
            <div className="flex gap-1">
              <button
                onClick={onToggleMinimize}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Minimize"
              >
                <Minimize2 size={14} className="text-gray-400 hover:text-white" />
              </button>
              {onClose && (
                <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Close">
                  <X size={14} className="text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Context Bar */}
      {(currentFile || selectedCode || includeDatabase) && (
        <div className="p-3 bg-gray-800 border-b border-gray-700">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {currentFile && (
              <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded border border-gray-600">
                <FileText size={12} className="text-gray-400" />
                <span className="text-gray-300 font-medium">{currentFile.split("/").pop()}</span>
              </div>
            )}
            {selectedCode && (
              <div className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded border border-gray-600">
                <Code size={12} className="text-gray-400" />
                <span className="text-gray-300 font-medium">Code selected</span>
              </div>
            )}
            <label className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded cursor-pointer border border-gray-600 hover:bg-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={includeDatabase}
                onChange={(e) => setIncludeDatabase(e.target.checked)}
                className="w-3 h-3"
              />
              <Database size={12} className="text-gray-400" />
              <span className="text-gray-300 font-medium">Include DB context</span>
            </label>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map(renderMessage)}

        {/* Welcome Screen */}
        {messages.length === 1 && (
          <div className="mt-6 space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-medium text-white mb-2">How can I help you today?</h4>
              <p className="text-sm text-gray-400">Choose a quick action or ask me anything about your code</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-start gap-3 p-4 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors text-left border border-gray-700 hover:border-gray-600"
                >
                  <action.icon size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white">{action.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start mb-6">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} className="text-gray-300" />
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Analyzing your code...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg">
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your code..."
                rows={2}
                className="w-full resize-none border border-gray-600 rounded-lg px-4 py-3 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:border-gray-500 focus:bg-gray-650 placeholder-gray-400 transition-colors"
                disabled={isLoading}
                style={{ minHeight: "44px" }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors min-w-[44px] h-[44px]"
              title={isLoading ? "Processing..." : "Send message"}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>Press Enter to send</span>
              <span>Shift+Enter for new line</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeChatbot