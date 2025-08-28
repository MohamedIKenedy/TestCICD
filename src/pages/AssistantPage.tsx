"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import {
  Send,
  Bot,
  User,
  Code,
  FileText,
  Loader2,
  Copy,
  Database,
  Trash2,
  MessageSquare,
  History,
  Plus,
  Search,
  Calendar,
  Clock,
  Brain,
  Check,
} from "lucide-react"
import { apiService } from "../services/api"
import type { ChatMessage, CodeChatRequest } from "../types"

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  messages: ChatMessage[]
}

const AssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "code" | "database" | "analysis">("all")
  const [showConversationHistory, setShowConversationHistory] = useState(true)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  useEffect(() => {
    loadConversationHistory()
  }, [])

  useEffect(() => {
    // Save conversations whenever they change
    if (conversations.length > 0) {
      localStorage.setItem("ai-conversations", JSON.stringify(conversations))
    }
  }, [conversations])

  useEffect(() => {
    // Save current conversation messages whenever they change
    if (currentConversation && messages.length > 0) {
      updateCurrentConversation(messages)
    }
  }, [messages])

  useEffect(() => {
    // Create initial conversation if none exists
    if (conversations.length === 0 && !currentConversation) {
      createNewConversation()
    }
  }, [conversations.length, currentConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversationHistory = () => {
    const savedConversations = localStorage.getItem("ai-conversations")
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations)
      setConversations(parsed)
      if (parsed.length > 0) {
        setCurrentConversation(parsed[0])
        setMessages(parsed[0].messages)
      }
    } else {
      // No saved conversations, create a new one
      const initialConversation: Conversation = {
        id: Date.now().toString(),
        title: "Welcome Chat",
        lastMessage: "",
        timestamp: new Date(),
        messageCount: 1,
        messages: [
          {
            id: "1",
            role: "assistant",
            content:
              "Hello! 👋 I'm your AI coding assistant. I can help you with:\n\n• **Code Generation** - Write functions, components, APIs in any language\n• **Code Review** - Analyze and improve your code quality\n• **Debugging** - Find and fix bugs in your projects\n• **Architecture** - Design patterns and best practices\n• **Testing** - Unit tests, integration tests, test strategies\n• **Database** - Queries, schema design, optimization\n• **Frameworks** - React, Node.js, Python, Java, and more\n\nWhat would you like to work on today?",
            timestamp: new Date(),
          },
        ],
      }
      setConversations([initialConversation])
      setCurrentConversation(initialConversation)
      setMessages(initialConversation.messages)
      localStorage.setItem("ai-conversations", JSON.stringify([initialConversation]))
    }
  }

  const saveConversationHistory = (updatedConversations: Conversation[]) => {
    localStorage.setItem("ai-conversations", JSON.stringify(updatedConversations))
    setConversations(updatedConversations)
  }

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
      messages: [
        {
          id: "1",
          role: "assistant",
          content:
            "Hello! 👋 I'm your AI coding assistant. I can help you with:\n\n• **Code Generation** - Write functions, components, APIs in any language\n• **Code Review** - Analyze and improve your code quality\n• **Debugging** - Find and fix bugs in your projects\n• **Architecture** - Design patterns and best practices\n• **Testing** - Unit tests, integration tests, test strategies\n• **Database** - Queries, schema design, optimization\n• **Frameworks** - React, Node.js, Python, Java, and more\n\nWhat would you like to work on today?",
          timestamp: new Date(),
        },
      ],
    }
    
    const updatedConversations = [newConversation, ...conversations]
    saveConversationHistory(updatedConversations)
    setCurrentConversation(newConversation)
    setMessages(newConversation.messages)
  }

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId)
    saveConversationHistory(updatedConversations)
    
    if (currentConversation?.id === conversationId) {
      if (updatedConversations.length > 0) {
        setCurrentConversation(updatedConversations[0])
        setMessages(updatedConversations[0].messages)
      } else {
        createNewConversation()
      }
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation)
    setMessages(conversation.messages)
  }

  const updateCurrentConversation = (newMessages: ChatMessage[]) => {
    if (!currentConversation) return
    
    const lastMessage = newMessages[newMessages.length - 1]
    const updatedConversation = {
      ...currentConversation,
      messages: newMessages,
      lastMessage: lastMessage?.content.substring(0, 100) || "",
      timestamp: new Date(),
      messageCount: newMessages.length,
      title: currentConversation.title === "New Conversation" && newMessages.length > 1 
        ? generateConversationTitle(newMessages[1].content)
        : currentConversation.title
    }

    const updatedConversations = conversations.map(c =>
      c.id === currentConversation.id ? updatedConversation : c
    )
    
    saveConversationHistory(updatedConversations)
    setCurrentConversation(updatedConversation)
  }

  const generateConversationTitle = (firstUserMessage: string): string => {
    const words = firstUserMessage.split(" ").slice(0, 4).join(" ")
    return words.length > 20 ? words.substring(0, 20) + "..." : words
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage("")
    // Reset textarea height
    setTimeout(() => adjustTextareaHeight(), 0)
    setIsLoading(true)

    try {
      const request: CodeChatRequest = {
        message: inputMessage.trim(),
        context: {
          currentFile: "",
          selectedCode: "",
          projectFiles: [],
        },
      }

      const response = await apiService.chatWithCodeAssistant(request)

      let messageContent = response.message
      
      // Only add formatted code if the response doesn't already contain markdown code blocks
      const hasCodeBlocks = messageContent.includes('```')
      const hasFileMetadata = messageContent.includes('**File:**') || messageContent.includes('Filename:') || messageContent.includes('// Filename:')
      
      // If there's a code snippet and no existing code blocks, format it properly with markdown
      if (response.codeSnippet && response.codeSnippet.code && !hasCodeBlocks) {
        const { code, language, fileName } = response.codeSnippet
        messageContent += `\n\n\`\`\`${language || 'text'}\n${code}\n\`\`\``
        if (fileName && !hasFileMetadata) {
          messageContent += `\n\n**File:** \`${fileName}\``
        }
      }
      
      // If there's a diff and no existing code blocks, format it properly
      if (response.diff && !hasCodeBlocks) {
        const { oldCode, newCode, fileName, language = 'text' } = response.diff
        messageContent += `\n\n**Original Code:**\n\`\`\`${language}\n${oldCode}\n\`\`\``
        messageContent += `\n\n**Modified Code:**\n\`\`\`${language}\n${newCode}\n\`\`\``
        if (fileName && !hasFileMetadata) {
          messageContent += `\n\n**File:** \`${fileName}\``
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: messageContent,
        timestamp: new Date(),
        type: response.codeSnippet ? "code" : "text",
        metadata: response.codeSnippet ? {
          fileName: response.codeSnippet.fileName,
          language: response.codeSnippet.language
        } : undefined,
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)
      updateCurrentConversation(finalMessages)
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
        type: "text",
      }

      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)
      updateCurrentConversation(finalMessages)
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000) // Clear after 2 seconds
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterType === "all") return matchesSearch
    
    // Simple filtering based on message content
    const hasCodeContent = conversation.messages.some(msg => 
      msg.content.includes("```") || 
      /\b(function|class|component|interface|method|variable|import|export|const|let|var)\b/i.test(msg.content)
    )
    const hasDatabaseContent = conversation.messages.some(msg => 
      /\b(sql|database|query|table|schema|mongodb|postgres|mysql|redis)\b/i.test(msg.content.toLowerCase())
    )
    const hasDebugContent = conversation.messages.some(msg => 
      /\b(debug|error|bug|fix|issue|problem|troubleshoot|analyze|review)\b/i.test(msg.content.toLowerCase())
    )

    switch (filterType) {
      case "code": return matchesSearch && hasCodeContent
      case "database": return matchesSearch && hasDatabaseContent
      case "analysis": return matchesSearch && hasDebugContent
      default: return matchesSearch
    }
  })

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  // Clean and normalize message content for better markdown rendering
  const preprocessMessageContent = (content: string): string => {
    if (!content) return ""
    
    let cleaned = content.trim()
    
    // Fix malformed responses that mix plain text with code
    // Pattern: "language code_here" without proper code blocks
    const languageCodePattern = /\b(java|javascript|python|csharp|typescript|cpp|c\+\+|go|rust|sql|html|css)\s+((?:import|public|class|function|def|var|let|const|#include|\<\?php).+?)(?=\n\n|\n[A-Z]|$)/gs
    
    cleaned = cleaned.replace(languageCodePattern, (_, lang, code) => {
      // Clean up the code block
      const cleanCode = code.trim()
      return `\n\`\`\`${lang.toLowerCase()}\n${cleanCode}\n\`\`\`\n`
    })
    
    // Fix cases where code blocks are missing language tags
    // Look for code-like content that should be in blocks
    const lines = cleaned.split('\n')
    const result: string[] = []
    let inCodeBlock = false
    let codeBuffer: string[] = []
    let detectedLanguage = 'text'
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Check if we're entering or leaving a proper code block
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // Closing a code block
          result.push(line)
          inCodeBlock = false
        } else {
          // Opening a code block
          result.push(line)
          inCodeBlock = true
        }
        continue
      }
      
      // If we're in a proper code block, just pass through
      if (inCodeBlock) {
        result.push(line)
        continue
      }
      
      // Detect if this line looks like code that should be in a block
      const isCodeLine = 
        /^(import|package|public|private|class|interface|function|def|var|let|const|#include|using|namespace|\s*\{|\s*\}|\s*if\s*\(|\s*for\s*\(|\s*while\s*\()/.test(trimmed) ||
        /[;}]{1,2}\s*$/.test(trimmed) ||
        /^\s{4,}/.test(line) || // Indented lines
        (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[=\(]/.test(trimmed) && trimmed.length > 20)
      
      if (isCodeLine && codeBuffer.length === 0) {
        // Start collecting code
        detectedLanguage = detectLanguage(trimmed)
        codeBuffer.push(line)
      } else if (isCodeLine && codeBuffer.length > 0) {
        // Continue collecting code
        codeBuffer.push(line)
      } else if (codeBuffer.length > 0) {
        // End of code block - output it
        if (codeBuffer.length > 1) {
          result.push(`\`\`\`${detectedLanguage}`)
          result.push(...codeBuffer)
          result.push('```')
        } else {
          // Single line, treat as inline
          result.push(...codeBuffer)
        }
        codeBuffer = []
        result.push(line)
      } else {
        // Regular text line
        result.push(line)
      }
    }
    
    // Handle any remaining code buffer
    if (codeBuffer.length > 0) {
      if (codeBuffer.length > 1) {
        result.push(`\`\`\`${detectedLanguage}`)
        result.push(...codeBuffer)
        result.push('```')
      } else {
        result.push(...codeBuffer)
      }
    }
    
    cleaned = result.join('\n')
    
    // Clean up extra whitespace but preserve structure
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
    
    // Ensure proper spacing around code blocks
    cleaned = cleaned.replace(/```(\w+)\s*\n/g, '```$1\n')
    cleaned = cleaned.replace(/\n\s*```/g, '\n```')
    
    return cleaned.trim()
  }
  
  const detectLanguage = (code: string): string => {
    if (/\b(import|public|class|private|static|void)\b/.test(code)) return 'java'
    if (/\b(function|const|let|var|=>)\b/.test(code)) return 'javascript'
    if (/\b(def|import|class|if __name__)\b/.test(code)) return 'python'
    if (/\b(using|namespace|public|private|static|void)\b/.test(code)) return 'csharp'
    if (/\b(interface|type|const|let|function)\b/.test(code)) return 'typescript'
    if (/\b(#include|int main|std::)\b/.test(code)) return 'cpp'
    if (/\b(package|func|import|var)\b/.test(code)) return 'go'
    if (/\b(fn|let|mut|struct|impl)\b/.test(code)) return 'rust'
    if (/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\b/i.test(code)) return 'sql'
    if (/<[^>]+>/.test(code)) return 'html'
    return 'text'
  }
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const codeContent = String(children).replace(/\n$/, '')
      
      // Handle multiline code blocks (both with and without language detection)
      if (!inline && (match || codeContent.includes('\n') || codeContent.length > 50)) {
        const language = match ? match[1] : 'text'
        
        return (
          <div className="my-4">
            <div className="bg-zinc-950/80 border border-zinc-700/30 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between bg-zinc-900/50 px-4 py-2 border-b border-zinc-700/30">
                <span className="text-xs text-zinc-400 font-medium">
                  {language.toUpperCase()}
                </span>
                <button
                  onClick={() => copyToClipboard(codeContent)}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                >
                  {copiedText === codeContent ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                className="!m-0 !bg-transparent"
                customStyle={{
                  background: 'transparent',
                  padding: '1rem',
                  margin: 0,
                  fontSize: '0.875rem',
                }}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          </div>
        )
      }
      
      return (
        <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-300" {...props}>
          {children}
        </code>
      )
    },
    pre({ children }: any) {
      // Handle pre blocks that might not have proper language detection
      return <div className="overflow-x-auto">{children}</div>
    },
    p({ children }: any) {
      return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
    },
    strong({ children }: any) {
      return <strong className="font-semibold text-zinc-100">{children}</strong>
    },
    em({ children }: any) {
      return <em className="italic text-zinc-300">{children}</em>
    },
    ul({ children }: any) {
      return <ul className="list-disc list-inside mb-3 space-y-1 pl-4">{children}</ul>
    },
    ol({ children }: any) {
      return <ol className="list-decimal list-inside mb-3 space-y-1 pl-4">{children}</ol>
    },
    li({ children }: any) {
      return <li className="text-zinc-300">{children}</li>
    },
    blockquote({ children }: any) {
      return (
        <blockquote className="border-l-4 border-zinc-600 pl-4 my-3 text-zinc-400 italic">
          {children}
        </blockquote>
      )
    },
    h1({ children }: any) {
      return <h1 className="text-xl font-bold mb-3 text-zinc-100">{children}</h1>
    },
    h2({ children }: any) {
      return <h2 className="text-lg font-semibold mb-2 text-zinc-100">{children}</h2>
    },
    h3({ children }: any) {
      return <h3 className="text-base font-medium mb-2 text-zinc-200">{children}</h3>
    },
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === "user"
    
    return (
      <div key={message.id} className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Bot size={16} className="text-purple-400" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
          <div
            className={`p-4 rounded-2xl ${
              isUser
                ? "bg-blue-600 text-white ml-auto"
                : "bg-zinc-800/50 text-zinc-200 border border-zinc-700/50"
            }`}
          >
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {preprocessMessageContent(message.content)}
              </ReactMarkdown>
            </div>
            
            {message.metadata && message.metadata.fileName && (
              <div className="mt-3 pt-3 border-t border-zinc-700/30">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>📁 {message.metadata.fileName}</span>
                  {message.metadata.language && (
                    <span>💾 {message.metadata.language}</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
            <Clock size={12} />
            <span>{formatTimestamp(message.timestamp)}</span>
            {!isUser && (
              <button
                onClick={() => copyToClipboard(message.content)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                {copiedText === message.content ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            )}
          </div>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <User size={16} className="text-blue-400" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-slate-100 flex">
      {/* Conversation History Sidebar */}
      {showConversationHistory && (
        <div className="w-80 bg-zinc-950 border-r border-zinc-800/50 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-zinc-100">Code Assistant</h1>
                  <p className="text-sm text-zinc-400">All Programming Languages</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={createNewConversation}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={16} />
              New Conversation
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-zinc-800/50 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            
            <div className="flex gap-2">
              {[
                { key: "all", label: "All", icon: MessageSquare },
                { key: "code", label: "Code", icon: Code },
                { key: "database", label: "DB", icon: Database },
                { key: "analysis", label: "Debug", icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as any)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === key
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`p-4 rounded-xl cursor-pointer transition-all group ${
                  currentConversation?.id === conversation.id
                    ? "bg-purple-500/10 border border-purple-500/20"
                    : "bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-200 truncate mb-1">
                      {conversation.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={10} />
                        {conversation.messageCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatTimestamp(conversation.timestamp)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conversation.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare size={32} className="text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500">No conversations found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-zinc-950/50 border-b border-zinc-800/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConversationHistory(!showConversationHistory)}
                className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <History size={16} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  {currentConversation?.title || "AI Assistant"}
                </h2>
                <p className="text-sm text-zinc-400">
                  {currentConversation?.messageCount || 0} messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-zinc-400">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-purple-400" />
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                  <span className="text-zinc-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-800/50 p-6">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about coding, debugging, architecture, or any programming question..."
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl px-4 py-4 pr-12 text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 min-h-[60px] max-h-[200px] overflow-y-auto"
              rows={1}
              style={{ height: '60px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-3 bottom-3 w-8 h-8 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:opacity-50 rounded-lg flex items-center justify-center text-white transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-zinc-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{inputMessage.length}/1000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistantPage
