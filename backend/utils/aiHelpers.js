const Sentiment = require('sentiment');
const natural = require('natural');

const sentimentAnalyzer = new Sentiment();
const tokenizer = new natural.WordTokenizer();

/**
 * Analyze sentiment of a text block.
 * Returns a label and normalized score.
 */
const analyzeSentiment = (text = '') => {
  const result = sentimentAnalyzer.analyze(text);
  let label = 'neutral';
  if (result.score > 1) label = 'positive';
  else if (result.score < -1) label = 'negative';
  return { label, score: result.score };
};

// Keyword-based auto-categorization — simple NLP, no external model needed.
const CATEGORY_KEYWORDS = {
  Bug: ['bug', 'error', 'crash', 'broken', 'not working', 'issue', 'fail', 'problem'],
  'UI/UX': ['ui', 'ux', 'design', 'layout', 'button', 'color', 'theme', 'dark mode', 'responsive', 'interface'],
  Performance: ['slow', 'lag', 'speed', 'performance', 'loading', 'optimize', 'faster'],
  Integration: ['integrate', 'api', 'connect', 'sync', 'webhook', 'third party'],
  Feature: ['add', 'feature', 'implement', 'support', 'enable', 'allow', 'new'],
};

/**
 * Auto-categorize feedback/request text using keyword matching.
 * Falls back to 'General' / 'Feature' if no match.
 */
const autoCategorize = (text = '', type = 'feedback') => {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  const joined = text.toLowerCase();

  const scores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = 0;
    for (const kw of keywords) {
      if (joined.includes(kw)) scores[cat] += 2;
      if (tokens.includes(kw)) scores[cat] += 1;
    }
  }

  let best = null;
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }

  if (!best) return type === 'feedback' ? 'General' : 'Feature';

  // Restrict categories per type to match the enum
  const feedbackCats = ['Bug', 'UI/UX', 'Performance', 'General', 'Other'];
  const featureCats = ['UI/UX', 'Feature', 'Integration', 'Performance', 'Other'];
  const allowed = type === 'feedback' ? feedbackCats : featureCats;

  return allowed.includes(best) ? best : allowed[0];
};

/**
 * Predict popularity score based on sentiment + keyword strength.
 * Returns a rough number between 0 and 100.
 */
const predictPopularity = (text = '') => {
  const { score } = analyzeSentiment(text);
  const length = text.length;
  const hasStrongKeywords = /amazing|love|must|need|critical|urgent|please|crucial/i.test(text);
  let base = 40;
  base += Math.min(20, score * 3);
  base += Math.min(20, length / 20);
  if (hasStrongKeywords) base += 15;
  return Math.max(0, Math.min(100, Math.round(base)));
};

module.exports = { analyzeSentiment, autoCategorize, predictPopularity };
