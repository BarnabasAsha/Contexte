// API client for communicating with the backend server
export interface ContextDefinition {
  word: string;
  literalMeaning: string;
  contextualMeaning: string;
  partOfSpeech?: string;
  confidence: number;
  timestamp: string;
}

export interface ContextRequest {
  word: string;
  context: string;
  userId?: string;
}

export interface ContextResponse {
  success: boolean;
  definition: ContextDefinition;
  requestId: string;
  remainingRequests: number;
  totalRequests: number;
  error?: string;
  message?: string;
}

export interface RequestStats {
  totalRequests: number;
  remainingRequests: number;
  maxRequests: number;
  resetTime?: string;
}

export interface HistoryItem {
  id: string;
  word: string;
  context: string;
  definition: ContextDefinition;
  timestamp: string;
}

// Mock data generators
const mockDefinitions: Record<string, ContextDefinition> = {
  bank: {
    word: "bank",
    literalMeaning:
      "A financial institution that accepts deposits and channels the money into lending activities.",
    contextualMeaning: "The edge of a river or lake.",
    partOfSpeech: "noun",
    confidence: 0.92,
    timestamp: new Date().toISOString(),
  },
  run: {
    word: "run",
    literalMeaning:
      "To move at a speed faster than a walk by taking quick steps.",
    contextualMeaning: "To operate or manage something.",
    partOfSpeech: "verb",
    confidence: 0.88,
    timestamp: new Date().toISOString(),
  },
  light: {
    word: "light",
    literalMeaning:
      "Natural illumination from the sun; artificial illumination.",
    contextualMeaning: "Not heavy; having little weight.",
    partOfSpeech: "adjective",
    confidence: 0.95,
    timestamp: new Date().toISOString(),
  },
};

// Simulate request counts
let mockRequestCount = 23;
const maxRequests = 100;

// Mock history storage
const mockHistory: HistoryItem[] = [
  {
    id: "1",
    word: "bank",
    context: "I walked along the river bank during sunset.",
    definition: mockDefinitions.bank,
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "2",
    word: "run",
    context: "She decided to run the marathon next month.",
    definition: mockDefinitions.run,
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: "3",
    word: "light",
    context: "The package was surprisingly light to carry.",
    definition: mockDefinitions.light,
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
  },
];

class ApiClient {
  private baseUrl: string;
  private useMockData: boolean;

  constructor() {
    this.baseUrl = "http://localhost:3000/api"; // Change as needed

    // Enable mock data when server isn't available
    this.useMockData = true; // Set to false when your server is ready
  }

  // Simulate network delay
  private async simulateDelay(min = 200, max = 800): Promise<void> {
    if (!this.useMockData) return;
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Generate a mock definition for unknown words
  private generateMockDefinition(word: string): ContextDefinition {
    const partsOfSpeech = ["noun", "verb", "adjective", "adverb"];
    const randomPos =
      partsOfSpeech[Math.floor(Math.random() * partsOfSpeech.length)];

    return {
      word,
      literalMeaning: `The literal meaning of "${word}" - a common ${randomPos} in English.`,
      contextualMeaning: `In this context, "${word}" refers to its contextual usage based on surrounding text.`,
      partOfSpeech: randomPos,
      confidence: Math.random() * 0.3 + 0.7, // Between 0.7 and 1.0
      timestamp: new Date().toISOString(),
    };
  }

  async getContextDefinition(
    request: ContextRequest
  ): Promise<ContextResponse> {
    if (this.useMockData) {
      await this.simulateDelay();

      // Simulate occasional errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error("Mock network error - please try again");
      }

      // Get or generate mock definition
      const definition =
        mockDefinitions[request.word.toLowerCase()] ||
        this.generateMockDefinition(request.word);

      // Update request count
      mockRequestCount++;
      const remainingRequests = Math.max(0, maxRequests - mockRequestCount);

      // Add to mock history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        word: request.word,
        context: request.context,
        definition,
        timestamp: new Date().toISOString(),
      };
      mockHistory.unshift(historyItem); // Add to beginning

      // Keep only last 50 items
      if (mockHistory.length > 50) {
        mockHistory.splice(50);
      }

      return {
        success: true,
        definition,
        requestId: `mock-${Date.now()}`,
        remainingRequests,
        totalRequests: mockRequestCount,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/context`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: ContextResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to get definition");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error instanceof Error ? error : new Error("Unknown API error");
    }
  }

  async getRequestStats(userId: string): Promise<RequestStats> {
    if (this.useMockData) {
      await this.simulateDelay(100, 300);

      return {
        totalRequests: mockRequestCount,
        remainingRequests: Math.max(0, maxRequests - mockRequestCount),
        maxRequests,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/context/stats/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error("Failed to fetch request stats:", error);

      // Return default stats on error
      return {
        totalRequests: 0,
        remainingRequests: 100,
        maxRequests: 100,
      };
    }
  }

  async getRequestHistory(userId: string): Promise<HistoryItem[]> {
    if (this.useMockData) {
      await this.simulateDelay(150, 400);

      // Return a copy to avoid external modifications
      return [...mockHistory];
    }

    try {
      const response = await fetch(`${this.baseUrl}/context/history/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error("Failed to fetch request history:", error);
      return [];
    }
  }

  // Health check method
  async checkHealth(): Promise<boolean> {
    if (this.useMockData) {
      await this.simulateDelay(50, 200);
      // Simulate 95% uptime
      return Math.random() > 0.05;
    }

    try {
      const response = await fetch(
        `${this.baseUrl.replace("/api", "")}/health`
      );
      return response.ok;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  // Method to toggle between mock and real API
  setMockMode(useMock: boolean): void {
    this.useMockData = useMock;
  }

  // Method to reset mock data (useful for testing)
  resetMockData(): void {
    mockRequestCount = 0;
    mockHistory.length = 0;
  }

  // Method to add custom mock definitions
  addMockDefinition(
    word: string,
    definition: Partial<ContextDefinition>
  ): void {
    mockDefinitions[word.toLowerCase()] = {
      word,
      literalMeaning: definition.literalMeaning || `Literal meaning of ${word}`,
      contextualMeaning:
        definition.contextualMeaning || `Contextual meaning of ${word}`,
      partOfSpeech: definition.partOfSpeech || "noun",
      confidence: definition.confidence || 0.9,
      timestamp: definition.timestamp || new Date().toISOString(),
    };
  }
}

export const apiClient = new ApiClient();

// Helper functions for error handling
export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("Failed to fetch")
  );
}

export function isRateLimitError(error: Error): boolean {
  return (
    error.message.includes("429") ||
    error.message.includes("rate limit") ||
    error.message.includes("too many requests")
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      return "Network error. Please check your connection and try again.";
    }
    if (isRateLimitError(error)) {
      return "Rate limit exceeded. Please wait before making more requests.";
    }
    return error.message;
  }
  return "An unexpected error occurred";
}
