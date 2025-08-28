export interface FileTreeNode {
  [key: string]: FileTreeNode | string;
}

export interface GeneratedTest {
  fileName: string;
  content: string;
  originalFile: string;
}

export interface ContextFiles {
  [filePath: string]: string[];
}

export interface TestRun {
  id: number;
  java_file: string;
  test_file: string;
  test_code: string;
  success: boolean;
  errors: string;
  created_at: string;
}

export interface GenerateTestsRequest {
  code: string;
  fileName: string;
  llm: string;
  framework: string;
  context?: Record<string, string>;
}

export interface FixCodeRequest {
  fileName: string;
  code: string;
  error: string;
  llm: string;
  framework: string;
}

// Jenkins-related interfaces
export interface JenkinsSettings {
  url: string;
  username: string;
  token: string;
  jobName: string;
}

export interface JenkinsBuild {
  number: number;
  status: string;
  timestamp: number;
  duration: number;
  result: string;
  url: string;
}

export interface JenkinsCoverage {
  instructionCoverage: number;
  branchCoverage: number;
  lineCoverage: number;
  complexityCoverage: number;
  methodCoverage: number;
  classCoverage: number;
  buildNumber: number;
  timestamp: number;
}

export interface JenkinsTestResult {
  passCount: number;
  failCount: number;
  skipCount: number;
  totalCount: number;
  duration: number;
  buildNumber: number;
  timestamp: number;
  suites: JenkinsTestSuite[];
}

export interface JenkinsTestSuite {
  name: string;
  duration: number;
  cases: JenkinsTestCase[];
}

export interface JenkinsTestCase {
  name: string;
  className: string;
  duration: number;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  errorMessage?: string;
  errorStackTrace?: string;
}

export interface UserPreferences {
  dashboard: {
    defaultTimeRange: '24h' | '7d' | '30d' | 'all';
    refreshInterval: number; // in milliseconds
    showChangeIndicators: boolean;
  };
}

// Chat-related interfaces
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'diff';
  metadata?: {
    fileName?: string;
    language?: string;
    originalCode?: string;
    modifiedCode?: string;
  };
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  codeSnippet?: {
    language: string;
    code: string;
    fileName?: string;
  };
  diff?: {
    oldCode: string;
    newCode: string;
    fileName: string;
    language?: string;
  };
}

export interface CodeChatRequest {
  message: string;
  context?: {
    currentFile?: string;
    selectedCode?: string;
    projectFiles?: string[];
    databaseContext?: boolean;
  };
  conversationHistory?: ChatMessage[];
}