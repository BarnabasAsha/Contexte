<script lang="ts">
  import { getWordOfTheDay } from '../lib/word-of-the-day';

  const word = getWordOfTheDay();
</script>

<main class="popup">
  <header class="popup-header">
    <h1 class="popup-title">Contexte</h1>
  </header>

  <div class="how-to-use">
    <h3>How to use</h3>
    <ol>
      <li>Select any text on a webpage</li>
      <li>Right-click and choose "Get Context"</li>
      <li>View the definition tooltip</li>
    </ol>
  </div>

  <section class="wotd">
    <h3 class="wotd-label">Word of the Day</h3>
    <div class="wotd-card">
      <div class="wotd-header">
        <span class="wotd-word">{word.word}</span>
        <span class="wotd-pos">{word.partOfSpeech}</span>
      </div>
      <p class="wotd-definition">{word.definition}</p>
      <p class="wotd-example">"{word.example}"</p>
    </div>
  </section>
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

  .popup-header {
    padding: 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }

  .popup-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .how-to-use {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
  }

  .how-to-use h3 {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 6px 0;
    color: #555;
  }

  .how-to-use ol {
    font-size: 12px;
    color: #666;
    margin: 0;
    padding-left: 18px;
  }

  .how-to-use li {
    margin-bottom: 2px;
  }

  .wotd {
    padding: 16px;
    flex: 1;
  }

  .wotd-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #999;
    margin: 0 0 10px 0;
  }

  .wotd-card {
    padding: 14px;
    border: 1px solid #eee;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea08, #764ba208);
  }

  .wotd-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
  }

  .wotd-word {
    font-size: 18px;
    font-weight: 700;
    color: #333;
  }

  .wotd-pos {
    font-size: 12px;
    color: #667eea;
    font-style: italic;
  }

  .wotd-definition {
    font-size: 13px;
    color: #555;
    line-height: 1.5;
    margin: 0 0 10px 0;
  }

  .wotd-example {
    font-size: 12px;
    color: #888;
    font-style: italic;
    line-height: 1.4;
    margin: 0;
    padding-left: 10px;
    border-left: 2px solid #667eea40;
  }
</style>
