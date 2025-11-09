<script lang="ts">
  import { onMount } from 'svelte';

  interface RequestStats {
    totalRequests: number;
    remainingRequests: number;
    maxRequests: number;
    lastUpdate?: number;
  }

  interface HistoryItem {
    id: string;
    word: string;
    context: string;
    definition: {
      word: string;
      literalMeaning: string;
      contextualMeaning: string;
      confidence: number;
      timestamp: string;
    };
    timestamp: string;
  }

  let stats: RequestStats = {
    totalRequests: 0,
    remainingRequests: 100,
    maxRequests: 100
  };

  let history: HistoryItem[] = [];
  let loading = true;
  let activeTab = 'stats';

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      // Get stats from background script
      const statsResponse = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (statsResponse && !statsResponse.error) {
        stats = statsResponse;
      }

      // Get history from background script
      const historyResponse = await chrome.runtime.sendMessage({ action: 'getHistory' });
      if (historyResponse && !historyResponse.error) {
        history = historyResponse.slice(0, 10); // Show only last 10 items
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      loading = false;
    }
  }

  function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getUsagePercentage(): number {
    return Math.round((stats.totalRequests / stats.maxRequests) * 100);
  }

  function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  }
</script>

<main class="popup">
  <header class="popup_header">
    Welcome Barnabas,
    
  </header>

  <nav class="tabs">
    <button 
      class="tab {activeTab === 'stats' ? 'active' : ''}"
      on:click={() => activeTab = 'stats'}
    >
      Stats
    </button>
    <button 
      class="tab {activeTab === 'history' ? 'active' : ''}"
      on:click={() => activeTab = 'history'}
    >
      History
    </button>
  </nav>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  {:else}
    {#if activeTab === 'stats'}
      <section class="stats-section">
        <div class="stat-card">
          <div class="stat-number">{stats.remainingRequests}</div>
          <div class="stat-label">Remaining Requests</div>
        </div>

        <div class="usage-info">
          <div class="usage-header">
            <span>Usage Today</span>
            <span class="usage-count">{stats.totalRequests}/{stats.maxRequests}</span>
          </div>
          <div class="usage-bar">
            <div 
              class="usage-fill" 
              style="width: {getUsagePercentage()}%"
            ></div>
          </div>
          <div class="usage-text">
            {getUsagePercentage()}% used
          </div>
        </div>

        <div class="info-section">
          <h3>How to use:</h3>
          <ol>
            <li>Select any text on a webpage</li>
            <li>Right-click and choose "Get Context"</li>
            <li>View the definition tooltip</li>
          </ol>
        </div>
      </section>
    {:else if activeTab === 'history'}
      <section class="history-section">
        {#if history.length === 0}
          <div class="empty-state">
            <div class="empty-icon">📚</div>
            <p>No lookups yet</p>
            <p class="empty-subtext">Start by selecting text and using "Get Context"</p>
          </div>
        {:else}
          <div class="history-list">
            {#each history as item}
              <div class="history-item">
                <div class="history-header">
                  <span class="history-word">{item.word}</span>
                  <span class="history-date">{formatDate(item.timestamp)}</span>
                </div>
                <div class="history-meaning">
                  {item.definition.contextualMeaning}
                </div>
                <div class="history-confidence">
                  <div 
                    class="confidence-dot" 
                    style="background-color: {getConfidenceColor(item.definition.confidence)}"
                  ></div>
                  {Math.round(item.definition.confidence * 100)}% confidence
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  {/if}

  <footer class="footer">
    <button class="refresh-btn" on:click={loadData} disabled={loading}>
      🔄 Refresh
    </button>
  </footer>
</main>

<style>
  .popup {
    width: 320px;
    min-height: 400px;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
    display: flex;
    flex-direction: column;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid #eee;
  }

  .tab {
    flex: 1;
    padding: 12px 16px;
    border: none;
    background: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .tab:hover {
    background: #f8f9fa;
    color: #333;
  }

  .tab.active {
    color: #667eea;
    border-bottom-color: #667eea;
    background: white;
  }

  .loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #666;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #eee;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .stats-section {
    flex: 1;
    padding: 20px;
  }

  .stat-card {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea20, #764ba220);
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .stat-number {
    font-size: 32px;
    font-weight: bold;
    color: #667eea;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }

  .usage-info {
    margin-bottom: 24px;
  }

  .usage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #555;
  }

  .usage-count {
    color: #667eea;
  }

  .usage-bar {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .usage-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .usage-text {
    font-size: 12px;
    color: #666;
    text-align: right;
  }

  .info-section h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
  }

  .info-section ol {
    font-size: 13px;
    color: #666;
    margin: 0;
    padding-left: 18px;
  }

  .info-section li {
    margin-bottom: 4px;
  }

  .history-section {
    flex: 1;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
  }

  .empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .empty-subtext {
    font-size: 12px;
    color: #999;
    margin: 4px 0 0 0;
  }

  .history-list {
    padding: 16px;
  }

  .history-item {
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 8px;
    background: white;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .history-word {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  .history-date {
    font-size: 11px;
    color: #999;
  }

  .history-meaning {
    font-size: 13px;
    color: #555;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .history-confidence {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #666;
  }

  .confidence-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .footer {
    border-top: 1px solid #eee;
    padding: 12px 16px;
  }

  .refresh-btn {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: #666;
    transition: all 0.2s ease;
  }

  .refresh-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #ccc;
  }

  .refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>