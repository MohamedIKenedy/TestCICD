"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Loader2, BarChart3 } from "lucide-react"
import { apiService } from "../services/api"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface TestCoverageInsight {
  className: string
  coverage: number
  recommendations: string[]
  missingTests: string[]
}

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [coverageInsights, setCoverageInsights] = useState<TestCoverageInsight[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const initializeChat = async () => {
    try {
      const insights = await apiService.getTestCoverageInsights()
      setCoverageInsights(insights)

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `👋 Hi! I'm your Test Coverage Assistant. I can help you analyze your test coverage, suggest improvements, and answer questions about your testing strategy.

Here's what I found in your current test suite:
• ${insights.length} classes analyzed
• Average coverage: ${Math.round(insights.reduce((acc, i) => acc + i.coverage, 0) / insights.length)}%
• ${insights.filter((i) => i.coverage < 70).length} classes need attention

How can I help you improve your test coverage today?`,
        timestamp: new Date(),
        suggestions: [
          "Show me classes with low coverage",
          "What tests are missing for my classes?",
          "How can I improve test coverage?",
          "Analyze my testing patterns",
        ],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Failed to initialize chat:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content:
          "👋 Hi! I'm your Test Coverage Assistant. I can help you analyze test coverage and suggest improvements. How can I assist you today?",
        timestamp: new Date(),
        suggestions: [
          "Show me test coverage overview",
          "Help me improve test quality",
          "What are best testing practices?",
        ],
      }
      setMessages([errorMessage])
    }
  }

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim()
    if (!messageContent || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await apiService.chatWithAssistant(messageContent, coverageInsights)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I apologize, but I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
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

  const QuickInsights: React.FC = () => {
    const lowCoverageClasses = coverageInsights.filter((c) => c.coverage < 70)
    const highCoverageClasses = coverageInsights.filter((c) => c.coverage >= 90)

    return (
      <div className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-lg mb-4 border border-gray-600 shadow-lg">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-gray-300" />
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Quick Insights</span>
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded border border-gray-600 backdrop-blur-sm">
            <div className="text-white font-bold text-lg">{lowCoverageClasses.length}</div>
            <div className="text-gray-400 text-xs">Low Coverage Classes</div>
          </div>
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded border border-gray-500 backdrop-blur-sm">
            <div className="text-white font-bold text-lg">{highCoverageClasses.length}</div>
            <div className="text-gray-300 text-xs">Well Tested Classes</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white rounded-full shadow-2xl hover:shadow-white/10 transition-all duration-300 flex items-center justify-center z-40 border border-gray-600 ${
          isOpen ? "scale-0" : "scale-100"
        } hover:scale-110`}
        style={{
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-96 h-[600px] bg-gradient-to-b from-black via-gray-900 to-black border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 flex flex-col backdrop-blur-xl ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(115, 115, 115, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-black backdrop-blur-sm rounded-t-xl">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center shadow-lg border border-gray-500"
              style={{ boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)" }}
            >
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Test Coverage Assistant
              </h3>
              <p className="text-xs text-gray-400">AI-powered testing insights</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-900/20">
          {coverageInsights.length > 0 && <QuickInsights />}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "assistant" && (
                <div
                  className="w-8 h-8 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border border-gray-500"
                  style={{ boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)" }}
                >
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                <div
                  className={`p-3 rounded-lg backdrop-blur-sm border ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-gray-500 shadow-lg"
                      : "bg-gradient-to-br from-gray-900 to-black text-gray-100 border-gray-600 shadow-lg"
                  }`}
                  style={
                    message.type === "user"
                      ? {
                          boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
                        }
                      : {
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
                        }
                  }
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>

                {message.suggestions && (
                  <div className="mt-2 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(suggestion)}
                        className="block w-full text-left p-2 text-xs bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded transition-all duration-200 text-gray-200 border border-gray-600 backdrop-blur-sm hover:border-gray-400 hover:shadow-lg hover:text-white"
                        style={{
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</div>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border border-gray-500">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center shadow-lg border border-gray-500"
                style={{ boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)" }}
              >
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black p-3 rounded-lg border border-gray-600 backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-2 text-gray-300">
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 bg-gradient-to-r from-gray-900 to-black backdrop-blur-sm rounded-b-xl">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about test coverage..."
              className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:shadow-lg text-sm transition-all duration-200 backdrop-blur-sm focus:text-white"
              style={{
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)",
              }}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="px-3 py-2 bg-gradient-to-r from-gray-700 to-black hover:from-gray-600 hover:to-gray-800 disabled:from-gray-800 disabled:to-gray-900 text-white rounded-lg transition-all duration-200 border border-gray-500 disabled:border-gray-700 shadow-lg hover:shadow-white/10 hover:scale-105"
              style={{
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatAssistant