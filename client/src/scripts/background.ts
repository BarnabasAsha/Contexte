import { getDefinition, getErrorMessage } from "../lib/api";

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
    requestContext(tab.id, selectedText);
  }
});

async function requestContext(tabId: number, selectedText: string) {
  try {
    const response = await sendMessageToTab(tabId, {
      action: "getContext",
      selectedText,
    });

    if (response?.context) {
      handleContextRequest(selectedText, response.context, tabId);
    }
  } catch {
    // Content script not injected — inject it and retry
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
      });
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ["content.css"],
      });

      const response = await sendMessageToTab(tabId, {
        action: "getContext",
        selectedText,
      });

      if (response?.context) {
        handleContextRequest(selectedText, response.context, tabId);
      }
    } catch (err) {
      console.error("Failed to inject content script:", err);
    }
  }
}

function sendMessageToTab(
  tabId: number,
  message: Record<string, unknown>
): Promise<{ context?: string; [key: string]: unknown } | undefined> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function handleContextRequest(
  word: string,
  context: string,
  tabId: number
) {
  try {
    chrome.tabs.sendMessage(tabId, {
      action: "showLoading",
      word: word,
    });

    const definition = await getDefinition(word, context);

    chrome.tabs.sendMessage(tabId, {
      action: "showDefinition",
      word: word,
      definition: definition,
    });
  } catch (error) {
    chrome.tabs.sendMessage(tabId, {
      action: "showError",
      error: getErrorMessage(error),
    });
  }
}
