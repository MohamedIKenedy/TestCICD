"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, FileCode, Zap } from "lucide-react"
import { apiService } from "../services/api"
import type { FileTreeNode } from "../types"

interface FileUploadProps {
  onUploadComplete: (tree: FileTreeNode) => void
  llmModel: string
  onLlmChange: (model: string) => void
  framework: string
  onFrameworkChange: (framework: string) => void
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  llmModel,
  onLlmChange,
  framework,
  onFrameworkChange,
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      alert("Please select or drop a .zip or .java file.")
      return
    }

    setUploading(true)
    try {
      const tree = await apiService.uploadFiles(files)
      onUploadComplete(tree)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {/* Drop Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-blue-500/50 bg-blue-500/5 scale-[1.02]"
            : "border-zinc-700/50 hover:border-zinc-600/50 hover:bg-zinc-800/20"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              dragActive ? "bg-blue-500/10" : "bg-zinc-800/50"
            }`}
          >
            <Upload className={`w-8 h-8 transition-colors ${dragActive ? "text-blue-400" : "text-zinc-400"}`} />
          </div>
          <div>
            <p className="text-zinc-300 font-medium mb-1">Drop files here or click to browse</p>
            <p className="text-sm text-zinc-500">Supports .zip, .rar and .java files</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.rar,.java"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <FileCode size={16} />
            Selected Files ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-zinc-800/30 px-4 py-3 rounded-xl border border-zinc-700/50 group hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <FileCode size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-200">{file.name}</span>
                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LLM Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Zap size={16} />
            AI Model
          </label>
          <select
            value={llmModel}
            onChange={(e) => onLlmChange(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="starchat2:15b">StarChat2 15B</option>
            <option value="deepseek-coder-v2-lite-instruct:latest">DeepSeek Coder V2 Lite</option>
            <option value="codellama:1.0">CodeLlama 13B</option>
          </select>
        </div>

        {/* Framework Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
            <FileCode size={16} />
            Framework
          </label>
          <select
            value={framework}
            onChange={(e) => onFrameworkChange(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="junit">JUnit</option>
            <option value="testng">TestNG</option>
            <option value="spock">Spock</option>
          </select>
        </div>
      </div>

      {/* Upload Button */}
      <button
        type="submit"
        disabled={uploading || files.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:opacity-50 text-white px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-blue-600/20 disabled:shadow-none"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            Processing Files...
          </>
        ) : (
          <>
            <Upload size={20} />
            Upload and Process Files
          </>
        )}
      </button>
    </form>
  )
}

export default FileUpload
