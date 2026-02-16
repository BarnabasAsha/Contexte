export interface Definition {
  word: string;
  partOfSpeech: string;
  literalMeaning: string;
  contextualMeaning: string;
  confidence: number;
}

export interface HistoryItem {
  id: string;
  word: string;
  context: string;
  definition: Definition;
  timestamp: string;
}
