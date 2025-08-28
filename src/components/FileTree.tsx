import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, X } from 'lucide-react';
import { FileTreeNode, ContextFiles } from '../types';
import { apiService } from '../services/api';

interface FileTreeProps {
  tree: FileTreeNode;
  selectedFiles: string[];
  fileContexts: ContextFiles;
  onFileSelect: (filePath: string) => void;
  onFileSelectionChange: (filePath: string, selected: boolean) => void;
  onContextChange: (filePath: string, contextFiles: string[]) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  tree,
  selectedFiles,
  fileContexts,
  onFileSelect,
  onFileSelectionChange,
  onContextChange
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showContextModal, setShowContextModal] = useState(false);
  const [currentContextFile, setCurrentContextFile] = useState<string>('');

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTreeNode = (node: FileTreeNode | string, path: string = '', level: number = 0): React.ReactNode => {
    if (typeof node === 'string') {
      // File node - node contains the full path, extract just the filename for display
      const isJavaFile = node.endsWith('.java');
      const fileName = node.split('/').pop() || node.split('\\').pop() || node;
      const fullPath = node; // Use the full path from backend for functionality
      
      return (
        <div key={fullPath} className="flex items-center gap-2 py-1" style={{ paddingLeft: `${level * 16}px` }}>
          {isJavaFile && (
            <input
              type="checkbox"
              checked={selectedFiles.includes(fullPath)}
              onChange={(e) => onFileSelectionChange(fullPath, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          )}
          <button
            onClick={() => onFileSelect(fullPath)}
            className="flex items-center gap-2 text-left hover:text-blue-400 transition-colors flex-1"
          >
            <File size={16} />
            <span className="text-sm">{fileName}</span>
          </button>
        </div>
      );
    }

    // Folder node
    const folderName = path.split('/').pop() || 'Root';
    const isExpanded = expandedFolders.has(path);

    return (
      <div key={path}>
        <button
          onClick={() => toggleFolder(path)}
          className="flex items-center gap-2 py-1 hover:text-blue-400 transition-colors w-full text-left"
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder size={16} />
          <span className="text-sm font-medium">{folderName}</span>
        </button>
        {isExpanded && (
          <div>
            {Object.entries(node).map(([name, childNode]) =>
              renderTreeNode(childNode, path ? `${path}/${name}` : name, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const openContextModal = (filePath: string) => {
    setCurrentContextFile(filePath);
    setShowContextModal(true);
  };

  const addSelectedContext = (selectedPaths: string[]) => {
    const currentContexts = fileContexts[currentContextFile] || [];
    const newContexts = [...currentContexts];
    
    selectedPaths.forEach(path => {
      if (!newContexts.includes(path)) {
        newContexts.push(path);
      }
    });
    
    onContextChange(currentContextFile, newContexts);
    setShowContextModal(false);
  };

  const removeContext = (filePath: string, contextPath: string) => {
    const currentContexts = fileContexts[filePath] || [];
    const newContexts = currentContexts.filter(path => path !== contextPath);
    onContextChange(filePath, newContexts);
  };

  return (
    <div className="space-y-4">
      {/* File Tree */}
      <div className="bg-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
        {renderTreeNode(tree)}
      </div>

      {/* Selected Files & Context */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">📋 Selected Files & Context</h3>
          {selectedFiles.map(filePath => {
            const fileName = filePath.split('/').pop() || '';
            const contextFiles = fileContexts[filePath] || [];
            
            return (
              <div key={filePath} className="bg-slate-700 rounded-lg p-3 space-y-2">
                <div className="font-medium text-slate-200">📄 {fileName}</div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">📎 Context Files</span>
                    <button
                      onClick={() => openContextModal(filePath)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      + Add Context
                    </button>
                  </div>
                  
                  {contextFiles.length > 0 ? (
                    <div className="space-y-1">
                      {contextFiles.map(contextPath => (
                        <div key={contextPath} className="flex items-center justify-between bg-slate-800 px-2 py-1 rounded text-sm">
                          <span>📎 {contextPath.split('/').pop()}</span>
                          <button
                            onClick={() => removeContext(filePath, contextPath)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">No context files added</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Context Modal */}
      {showContextModal && (
        <ContextModal
          tree={tree}
          currentFile={currentContextFile}
          existingContexts={fileContexts[currentContextFile] || []}
          onClose={() => setShowContextModal(false)}
          onAdd={addSelectedContext}
        />
      )}
    </div>
  );
};

interface ContextModalProps {
  tree: FileTreeNode;
  currentFile: string;
  existingContexts: string[];
  onClose: () => void;
  onAdd: (selectedPaths: string[]) => void;
}

const ContextModal: React.FC<ContextModalProps> = ({
  tree,
  currentFile,
  existingContexts,
  onClose,
  onAdd
}) => {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([...existingContexts]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [smartSuggestions, setSmartSuggestions] = useState<Array<{path: string, name: string, reason: string, score: number, priority?: string, should_mock?: boolean}>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);

  // Load smart suggestions when modal opens
  useEffect(() => {
    const loadSmartSuggestions = async () => {
      if (!currentFile) return;
      
      setLoadingSuggestions(true);
      try {
        const response = await apiService.suggestContextFiles(currentFile);
        setSmartSuggestions(response.suggestions);
        setAiEnhanced(response.ai_enhanced || false);
      } catch (error) {
        console.error('Failed to load smart suggestions:', error);
        setSmartSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    loadSmartSuggestions();
  }, [currentFile]);

  const toggleSelection = (path: string) => {
    if (selectedPaths.includes(path)) {
      setSelectedPaths(selectedPaths.filter(p => p !== path));
    } else {
      setSelectedPaths([...selectedPaths, path]);
    }
  };

  const toggleModalFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  // Function to collect all file paths from the tree
  const collectAllFiles = (node: FileTreeNode | string, path: string = ''): string[] => {
    if (typeof node === 'string') {
      return [path ? `${path}/${node}` : node];
    }

    let files: string[] = [];
    Object.entries(node).forEach(([name, childNode]) => {
      const childPath = path ? `${path}/${name}` : name;
      files.push(...collectAllFiles(childNode, childPath));
    });
    return files;
  };

  // Filter files based on search term
  const filteredFiles = searchTerm ? 
    collectAllFiles(tree).filter(filePath => 
      filePath.toLowerCase().includes(searchTerm.toLowerCase())
    ) : null;

  const renderModalTreeNode = (node: FileTreeNode | string, path: string = ''): React.ReactNode => {
    if (typeof node === 'string') {
      // This is a file path - node contains the full path, extract filename for display
      const fullPath = node; // Use the full path from backend
      const fileName = node.split('/').pop() || node.split('\\').pop() || node;
      
      // Skip current file
      if (fullPath === currentFile) {
        return (
          <div key={fullPath} className="py-1 px-2 text-slate-500 text-sm">
            📄 {fileName} (current file)
          </div>
        );
      }

      const isSelected = selectedPaths.includes(fullPath);
      return (
        <button
          key={fullPath}
          onClick={() => toggleSelection(fullPath)}
          className={`block w-full text-left py-1 px-2 rounded text-sm transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'hover:bg-slate-700 text-slate-300'
          }`}
        >
          📄 {fileName}
        </button>
      );
    }

    // This is a directory - render its contents with indentation
    const folderName = path.split('/').pop() || 'Root';
    const isExpanded = expandedFolders.has(path) || searchTerm.length > 0; // Auto-expand when searching

    return (
      <div key={path} className="ml-2">
        {path && (
          <button
            onClick={() => toggleModalFolder(path)}
            className="flex items-center gap-2 py-1 px-2 text-slate-400 text-sm font-medium hover:text-slate-300 transition-colors w-full text-left"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            📁 {folderName}
          </button>
        )}
        {isExpanded && (
          <div className="ml-4">
            {Object.entries(node).map(([name, childNode]) =>
              renderModalTreeNode(childNode, path ? `${path}/${name}` : name)
            )}
          </div>
        )}
      </div>
    );
  };

  // Render search results
  const renderSearchResults = () => {
    if (!filteredFiles || filteredFiles.length === 0) {
      return (
        <div className="text-slate-500 text-center py-8">
          <File size={48} className="mx-auto mb-2 opacity-50" />
          <p>No files found matching "{searchTerm}"</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {filteredFiles.map(filePath => {
          const fileName = filePath.split('/').pop() || filePath;
          const isSelected = selectedPaths.includes(filePath);
          const isCurrentFile = filePath === currentFile;

          if (isCurrentFile) {
            return (
              <div key={filePath} className="py-2 px-3 text-slate-500 text-sm">
                📄 {fileName} (current file)
              </div>
            );
          }

          return (
            <button
              key={filePath}
              onClick={() => toggleSelection(filePath)}
              className={`block w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>📄 {fileName}</span>
                <span className="text-xs text-slate-500">{filePath}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl border border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-100">Add Context Files</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors p-1 hover:bg-slate-700 rounded"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-sm text-slate-400 mb-4">
          Select files from your project to provide additional context for test generation:
        </p>
        
        {/* Smart Suggestions */}
        {smartSuggestions.length > 0 && (
          <div className="mb-4 p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-200">
                {aiEnhanced ? '🤖 AI-Enhanced Suggestions' : '🔍 Smart Suggestions'}
              </h4>
              {aiEnhanced && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">AI Powered</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {aiEnhanced 
                ? 'AI-analyzed dependencies ranked by importance for test generation:' 
                : 'Automatically detected relevant files for your test:'
              }
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {smartSuggestions.slice(0, 8).map((suggestion) => {
                const isSelected = selectedPaths.includes(suggestion.path);
                const priorityColor = suggestion.priority === 'high' ? 'border-red-400' : 
                                    suggestion.priority === 'medium' ? 'border-yellow-400' : 'border-gray-400';
                
                return (
                  <button
                    key={suggestion.path}
                    onClick={() => toggleSelection(suggestion.path)}
                    className={`w-full text-left p-2 rounded text-xs transition-colors border-l-2 ${priorityColor} ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📄 {suggestion.name}</span>
                        {suggestion.should_mock && (
                          <span className="text-xs bg-orange-600 text-white px-1 rounded">MOCK</span>
                        )}
                        {suggestion.priority === 'high' && (
                          <span className="text-xs bg-red-600 text-white px-1 rounded">HIGH</span>
                        )}
                      </div>
                      <span className="text-xs opacity-75">Score: {suggestion.score}</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">{suggestion.reason}</div>
                  </button>
                );
              })}
            </div>
            {smartSuggestions.length > 8 && (
              <p className="text-xs text-slate-500 mt-2">
                +{smartSuggestions.length - 8} more suggestions available below
              </p>
            )}
          </div>
        )}

        {loadingSuggestions && (
          <div className="mb-4 p-3 bg-slate-700 rounded-lg text-center">
            <div className="text-sm text-slate-400">🔍 Finding relevant files...</div>
          </div>
        )}

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setExpandedFolders(new Set(collectAllFiles(tree, '').map(f => f.substring(0, f.lastIndexOf('/'))).filter(p => p)))}
              className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedFolders(new Set())}
              className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              Collapse All
            </button>
          </div>
          {selectedPaths.length > 0 && (
            <div className="text-sm text-blue-400">
              {selectedPaths.length} file{selectedPaths.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto border border-slate-600 rounded p-3 mb-4 min-h-[300px] max-h-[500px]">
          {searchTerm ? (
            renderSearchResults()
          ) : tree && Object.keys(tree).length > 0 ? (
            renderModalTreeNode(tree)
          ) : (
            <div className="text-slate-500 text-center py-8">
              <Folder size={48} className="mx-auto mb-2 opacity-50" />
              <p>No files found</p>
              <p className="text-xs mt-1">The file tree appears to be empty</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(selectedPaths)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileTree;