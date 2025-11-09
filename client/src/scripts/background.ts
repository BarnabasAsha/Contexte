import { apiClient } from "../lib/api";

interface RequestStats {
  totalRequests: number;
  remainingRequests: number;
  maxRequests: number;
  lastUpdate?: number;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "getContext",
    title: "Get Context",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getContext" && info.selectionText && tab?.id) {
    const selectedText = info.selectionText.trim();

    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "getContext",
        selectedText: selectedText,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting context:", chrome.runtime.lastError);
          return;
        }

        if (response?.context) {
          handleContextRequest(selectedText, response.context, tab.id!);
        }
      }
    );
  }
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  switch (request.action) {
    case "getStats":
      getRequestStats().then(sendResponse);
      return true;

    case "getHistory":
      getRequestHistory().then(sendResponse);
      return true;

    default:
      sendResponse({ error: "Unknown action" });
      return false;
  }
});

async function handleContextRequest(
  word: string,
  context: string,
  tabId: number
) {
  try {
    const userId = await getUserId();

    chrome.tabs.sendMessage(tabId, {
      action: "showLoading",
      word: word,
    });

    const response = await apiClient.getContextDefinition({
      word,
      context,
      userId,
    });

    chrome.tabs.sendMessage(tabId, {
      action: "showDefinition",
      word: word,
      definition: response.definition,
      remainingRequests: response.remainingRequests,
    });

    await updateRequestStats(
      response.totalRequests,
      response.remainingRequests
    );
  } catch (error) {
    console.error("Error handling context request:", error);

    chrome.tabs.sendMessage(tabId, {
      action: "showError",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function getUserId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["userId"], (result) => {
      if (result.userId) {
        resolve(result.userId);
      } else {
        const newUserId = `user_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        chrome.storage.local.set({ userId: newUserId }, () => {
          resolve(newUserId);
        });
      }
    });
  });
}

async function getRequestStats(): Promise<RequestStats> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["requestStats"], (result) => {
      resolve(
        result.requestStats || {
          totalRequests: 0,
          remainingRequests: 100,
          maxRequests: 100,
        }
      );
    });
  });
}

async function updateRequestStats(
  totalRequests: number,
  remainingRequests: number
): Promise<void> {
  return new Promise((resolve) => {
    const stats: RequestStats = {
      totalRequests,
      remainingRequests,
      maxRequests: 100,
      lastUpdate: Date.now(),
    };

    chrome.storage.local.set({ requestStats: stats }, () => {
      resolve();
    });
  });
}

async function getRequestHistory(): Promise<any[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["requestHistory"], (result) => {
      resolve(result.requestHistory || []);
    });
  });
}
