<script lang="ts">
  import { getWordOfTheDay } from '../lib/word-of-the-day';

  const word = getWordOfTheDay();
</script>

<main class="popup">
  <header class="header">
    <span class="logo">C</span>
    <span class="brand">Contexte</span>
  </header>

  <section class="wotd">
    <span class="wotd-label">Word of the day</span>
    <div class="wotd-word">{word.word}</div>
    <span class="wotd-pos">{word.partOfSpeech}</span>
    <p class="wotd-definition">{word.definition}</p>
    <blockquote class="wotd-example">{word.example}</blockquote>
  </section>

  <div class="divider"></div>

  <section class="usage">
    <div class="usage-step">
      <span class="step-num">1</span>
      <span class="step-text">Select any text on a page</span>
    </div>
    <div class="usage-step">
      <span class="step-num">2</span>
      <span class="step-text">Right-click &mdash; "Get Context"</span>
    </div>
    <div class="usage-step">
      <span class="step-num">3</span>
      <span class="step-text">See the definition instantly</span>
    </div>
  </section>
</main>

<style>
  .popup {
    width: 300px;
    background: #F2EDE4;
    font-family: 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #2C2C2C;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 16px 0;
  }

  .logo {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: linear-gradient(135deg, #E8773A, #D4622B);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    line-height: 24px;
    text-align: center;
  }

  .brand {
    font-size: 13px;
    font-weight: 600;
    color: #2C2C2C;
    letter-spacing: -0.2px;
  }

  .wotd {
    padding: 16px 16px 14px;
  }

  .wotd-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #A09A90;
    display: block;
    margin-bottom: 10px;
  }

  .wotd-word {
    font-size: 22px;
    font-weight: 700;
    color: #1A1A1A;
    letter-spacing: -0.4px;
    line-height: 1.1;
    margin-bottom: 4px;
  }

  .wotd-pos {
    font-size: 11px;
    color: #D4622B;
    font-style: italic;
    font-weight: 500;
  }

  .wotd-definition {
    font-size: 12.5px;
    color: #5C5C5C;
    line-height: 1.55;
    margin: 10px 0 12px;
    font-weight: 400;
  }

  .wotd-example {
    font-size: 11.5px;
    color: #8A8580;
    font-style: italic;
    line-height: 1.5;
    margin: 0;
    padding: 8px 10px 8px 12px;
    border: 1px solid #E8773A25;
    background: #EBE6DD;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(232, 119, 58, 0.08);
    position: relative;
  }

  .wotd-example::before {
    content: "\201C";
    position: absolute;
    top: 2px;
    left: 4px;
    font-size: 18px;
    color: #D4622B30;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
  }

  .divider {
    height: 1px;
    background: #E2DACE;
    margin: 0 16px;
  }

  .usage {
    padding: 12px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .usage-step {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .step-num {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    background: #EBE6DD;
    border: 1px solid #E8773A20;
    box-shadow: 0 1px 2px rgba(232, 119, 58, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 600;
    color: #A09A90;
    flex-shrink: 0;
    line-height: 18px;
    text-align: center;
  }

  .step-text {
    font-size: 11px;
    color: #9A9590;
    font-weight: 400;
  }
</style>
