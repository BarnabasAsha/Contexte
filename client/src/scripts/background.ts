import { getDefinition } from "../lib/api";

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
          return;
        }

        if (response?.context) {
          handleContextRequest(selectedText, response.context, tab.id!);
        }
      }
    );
  }
});

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
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
