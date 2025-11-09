<script lang="ts">
  export let definition: {
    word: string;
    literalMeaning: string;
    contextualMeaning: string;
    partOfSpeech?: string;
    confidence: number;
  } | null = null;
  
  export let loading = false;
  export let error = "";
  export let loadingWord = "";
  export let onClose: () => void;

  $: confidencePercent = definition ? Math.round(definition.confidence * 100) : 0;
</script>

{#if loading}
  <div class="tooltip-loading">
    Looking up "{loadingWord}"
  </div>
{:else if error}
  <div class="tooltip-error">
    <strong>Error:</strong> {error}
  </div>
{:else if definition}
  <button class="tooltip-close" title="Close" on:click={onClose}>&times;</button>
  <div class="tooltip-header">
    <div class="tooltip-word">{definition.word}</div>
    {#if definition.partOfSpeech}
      <div class="tooltip-pos">{definition.partOfSpeech}</div>
    {/if}
  </div>
  <div class="tooltip-content">
    <div class="tooltip-section">
      <div class="tooltip-label">Literal Meaning</div>
      <div class="tooltip-text">{definition.literalMeaning}</div>
    </div>
    <div class="tooltip-section">
      <div class="tooltip-label">In Context</div>
      <div class="tooltip-text">{definition.contextualMeaning}</div>
    </div>
    <div class="tooltip-confidence">
      Confidence: {confidencePercent}%
      <div class="confidence-bar">
        <div class="confidence-fill" style="width: {confidencePercent}%"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.context-tooltip) {
    position: absolute;
    z-index: 10000;
    max-width: 300px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: #333;
    padding: 0;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  }
  
  :global(.context-tooltip.visible) {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  
  .tooltip-header {
    padding: 12px 16px 8px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
  }
  
  .tooltip-word {
    font-weight: 600;
    font-size: 16px;
    color: #2c3e50;
    margin-bottom: 4px;
  }
  
  .tooltip-pos {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
  
  .tooltip-content {
    padding: 12px 16px;
  }
  
  .tooltip-section {
    margin-bottom: 12px;
  }
  
  .tooltip-section:last-child {
    margin-bottom: 0;
  }
  
  .tooltip-label {
    font-weight: 500;
    color: #555;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }
  
  .tooltip-text {
    color: #333;
    line-height: 1.5;
  }
  
  .tooltip-confidence {
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }
  
  .confidence-bar {
    width: 50px;
    height: 4px;
    background: #eee;
    border-radius: 2px;
    margin-left: 8px;
    overflow: hidden;
  }
  
  .confidence-fill {
    height: 100%;
    background: #4CAF50;
    transition: width 0.3s ease;
  }
  
  .tooltip-close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 16px;
    color: #999;
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
  }
  
  .tooltip-close:hover {
    background: #f0f0f0;
    color: #666;
  }
  
  .tooltip-loading {
    padding: 16px;
    text-align: center;
    color: #666;
  }
  
  .tooltip-loading::after {
    content: '...';
    animation: loading-dots 1.5s infinite;
  }
  
  @keyframes loading-dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
  }
  
  .tooltip-error {
    padding: 16px;
    color: #d32f2f;
    text-align: center;
    background: #ffebee;
  }
</style>