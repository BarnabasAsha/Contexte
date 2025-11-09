import Tooltip from "../components/Tooltip.svelte";

interface Definition {
  word: string;
  literalMeaning: string;
  contextualMeaning: string;
  partOfSpeech?: string;
  confidence: number;
  timestamp: string;
}

class ContextTooltip {
  private tooltipContainer: HTMLElement | null = null;
  private tooltipComponent: Tooltip | null = null;
  private isVisible = false;

  constructor() {
    this.setupEventListeners();
    console.log("ContextTooltip initialized on:", window.location.href);
  }

  private setupEventListeners() {
    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      switch (request.action) {
        case "getContext":
          const context = this.getContextAroundSelection(request.selectedText);
          return sendResponse({ context });

        case "showLoading":
          return this.showLoadingTooltip(request.word);

        case "showDefinition":
          return this.showDefinitionTooltip(request.definition);

        case "showError":
          return this.showErrorTooltip(request.error);

        default:
          return sendResponse({ error: "Unknown action" });
      }
    });

    document.addEventListener("click", (e) => {
      if (
        this.tooltipContainer &&
        !this.tooltipContainer.contains(e.target as Node)
      ) {
        this.hideTooltip();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible) {
        this.hideTooltip();
      }
    });
  }

  private getContextAroundSelection(selectedText: string): string {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return selectedText;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    let contextElement =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    while (
      contextElement &&
      contextElement.textContent &&
      contextElement.textContent.length < 200
    ) {
      const parent = contextElement.parentElement;
      if (!parent || parent === document.body) break;
      contextElement = parent;
    }

    let contextText = contextElement?.textContent || selectedText;

    if (contextText.length > 500) {
      const selectedIndex = contextText.indexOf(selectedText);
      if (selectedIndex !== -1) {
        const start = Math.max(0, selectedIndex - 150);
        const end = Math.min(
          contextText.length,
          selectedIndex + selectedText.length + 150
        );
        contextText = contextText.substring(start, end);
      } else {
        contextText = contextText.substring(0, 500);
      }
    }

    return contextText;
  }

  private getSelectionPosition(): { x: number; y: number } {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return { x: 0, y: 0 };
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY,
    };
  }

  private createTooltipContainer(): HTMLElement {
    const container = document.createElement("div");
    container.className = "context-tooltip";
    document.body.appendChild(container);
    return container;
  }

  private positionTooltip(container: HTMLElement) {
    const position = this.getSelectionPosition();
    const rect = container.getBoundingClientRect();

    let x = position.x - rect.width / 2;
    let y = position.y + 10;

    if (x < 10) x = 10;
    if (x + rect.width > window.innerWidth - 10) {
      x = window.innerWidth - rect.width - 10;
    }

    if (y + rect.height > window.innerHeight + window.scrollY - 10) {
      y = position.y - rect.height - 10;
    }

    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
  }

  showLoadingTooltip(word: string) {
    this.hideTooltip();

    this.tooltipContainer = this.createTooltipContainer();
    this.tooltipComponent = new Tooltip({
      target: this.tooltipContainer,
      props: {
        loading: true,
        loadingWord: word,
        onClose: () => this.hideTooltip(),
      },
    });

    this.positionTooltip(this.tooltipContainer);

    requestAnimationFrame(() => {
      this.tooltipContainer?.classList.add("visible");
      this.isVisible = true;
    });
  }

  showDefinitionTooltip(definition: Definition) {
    if (!this.tooltipComponent) return;

    this.tooltipComponent.$set({
      loading: false,
      definition: definition,
      error: "",
    });

    if (this.tooltipContainer) {
      this.positionTooltip(this.tooltipContainer);
    }
  }

  showErrorTooltip(error: string) {
    if (!this.tooltipComponent) return;

    this.tooltipComponent.$set({
      loading: false,
      error: error,
      definition: null,
    });

    if (this.tooltipContainer) {
      this.positionTooltip(this.tooltipContainer);
    }

    setTimeout(() => this.hideTooltip(), 3000);
  }

  hideTooltip() {
    if (this.tooltipContainer) {
      this.tooltipContainer.classList.remove("visible");
      setTimeout(() => {
        this.tooltipComponent?.$destroy();
        this.tooltipContainer?.remove();
        this.tooltipComponent = null;
        this.tooltipContainer = null;
        this.isVisible = false;
      }, 200);
    }
  }
}

new ContextTooltip();
