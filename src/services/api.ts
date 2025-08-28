import { FileTreeNode, GenerateTestsRequest, FixCodeRequest, TestRun, JenkinsSettings, JenkinsBuild, JenkinsCoverage, JenkinsTestResult, ChatMessage, ChatResponse, CodeChatRequest } from '../types';

const API_BASE_URL = 'http://localhost:5005';

interface DashboardStats {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  avgGenerationTime: number;
  testCoverage: number;
  activeProjects: number;
  testsToday: number;
  testsThisWeek: number;
}

interface TestTrend {
  date: string;
  successful: number;
  failed: number;
  total: number;
}

interface CoverageData {
  className: string;
  coverage: number;
  methods: number;
  testedMethods: number;
  lastUpdated: string;
}

interface TestCoverageInsight {
  className: string;
  coverage: number;
  recommendations: string[];
  missingTests: string[];
}

class ApiService {
  async uploadFiles(files: File[]): Promise<FileTreeNode> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('zipFile', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async readFile(path: string): Promise<{ code: string }> {
    const response = await fetch(`${API_BASE_URL}/read-file?path=${encodeURIComponent(path)}`);
    
    if (!response.ok) {
      throw new Error('Failed to read file');
    }

    return response.json();
  }

  async generateTests(request: GenerateTestsRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate tests');
    }

    return response.text();
  }

  async suggestContextFiles(filePath: string): Promise<{
    suggestions: Array<{
      path: string, 
      name: string, 
      reason: string, 
      score: number,
      priority?: string,
      should_mock?: boolean
    }>, 
    count: number,
    ai_enhanced?: boolean,
    mock_strategy?: any
  }> {
    const response = await fetch(`${API_BASE_URL}/suggest-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      throw new Error('Failed to get context suggestions');
    }

    return response.json();
  }

  async fixCode(request: FixCodeRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/fix-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to fix code');
    }

    return response.text();
  }

  async getTestHistory(): Promise<TestRun[]> {
    const response = await fetch(`${API_BASE_URL}/tests`);
    
    if (!response.ok) {
      throw new Error('Failed to get test history');
    }

    const data = await response.json();
    return data.map(([id, java_file, test_file, created_at]: any[]) => ({
      id,
      java_file,
      test_file,
      created_at,
      test_code: '',
      success: true,
      errors: ''
    }));
  }

  async getTest(testId: number): Promise<{ code: string }> {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get test');
    }

    return response.json();
  }

  async updateTest(testId: number, code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to update test');
    }
  }

  async deleteTest(testId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete test');
    }
  }

  async getContextData(contextPaths: string[]): Promise<Record<string, string>> {
    const contextData: Record<string, string> = {};
    
    for (const path of contextPaths) {
      try {
        const response = await this.readFile(path);
        const fileName = path.split('/').pop() || path;
        contextData[fileName] = response.code;
      } catch (error) {
        console.warn(`Failed to load context file: ${path}`, error);
      }
    }
    
    return contextData;
  }

  // Dashboard Analytics APIs
  async getDashboardStats(timeRange: string): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats?timeRange=${timeRange}`);
    
    if (!response.ok) {
      throw new Error('Failed to get dashboard stats');
    }

    return response.json();
  }

  async getTestTrends(timeRange: string): Promise<TestTrend[]> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/trends?timeRange=${timeRange}`);
    
    if (!response.ok) {
      throw new Error('Failed to get test trends');
    }

    return response.json();
  }

  async getCoverageData(): Promise<CoverageData[]> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/coverage`);
    
    if (!response.ok) {
      throw new Error('Failed to get coverage data');
    }

    return response.json();
  }

  async getTestCoverageInsights(): Promise<TestCoverageInsight[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat/coverage-insights`);
    
    if (!response.ok) {
      throw new Error('Failed to get coverage insights');
    }

    return response.json();
  }

  async chatWithAssistant(message: string, context: TestCoverageInsight[]): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to chat with assistant');
    }

    return response.json();
  }

  async chatWithCodeAssistant(request: CodeChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to chat with code assistant');
    }

    return response.json();
  }

  // Jenkins API methods
  async saveJenkinsSettings(settings: JenkinsSettings): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/settings/jenkins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to save Jenkins settings');
    }
  }

  async getJenkinsSettings(): Promise<JenkinsSettings | null> {
    const response = await fetch(`${API_BASE_URL}/api/settings/jenkins`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to get Jenkins settings');
    }

    return response.json();
  }

  async getJenkinsBuilds(): Promise<JenkinsBuild[]> {
    const response = await fetch(`${API_BASE_URL}/api/jenkins/builds`);
    
    if (!response.ok) {
      throw new Error('Failed to get Jenkins builds');
    }

    const data = await response.json();
    return data.builds || []; // Extract builds array from response
  }

  async getJenkinsCoverage(): Promise<JenkinsCoverage[]> {
    const response = await fetch(`${API_BASE_URL}/api/jenkins/coverage`);
    
    if (!response.ok) {
      throw new Error('Failed to get Jenkins coverage data');
    }

    const data = await response.json();
    return data.coverage || []; // Extract coverage array from response
  }

  async getJenkinsTestResults(): Promise<JenkinsTestResult[]> {
    const response = await fetch(`${API_BASE_URL}/api/jenkins/test-results`);
    
    if (!response.ok) {
      throw new Error('Failed to get Jenkins test results');
    }

    const data = await response.json();
    return data.test_results || []; // Extract test_results array from response
  }

  async testJenkinsConnection(settings: JenkinsSettings): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/jenkins/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to test Jenkins connection');
    }

    return response.json();
  }
}

export const apiService = new ApiService();