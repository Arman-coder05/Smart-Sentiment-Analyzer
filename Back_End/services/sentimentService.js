function analyzeSentiment(text) {
  const positiveWords = [
    "good",
    "great",
    "beneficial",
    "excellent",
    "positive",
    "helpful",
    "better",
    "support",
    "progress",
    "improve",
  ];

  const negativeWords = [
    "bad",
    "poor",
    "harmful",
    "negative",
    "worse",
    "problem",
    "burden",
    "expensive",
    "increase",
    "disappointing",
  ];

  const words = text.toLowerCase().split(/\s+/);

  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) {
      positiveScore++;
    }

    if (negativeWords.includes(word)) {
      negativeScore++;
    }
  });

  let sentiment = "Neutral";

  if (positiveScore > negativeScore) {
    sentiment = "Positive";
  } else if (negativeScore > positiveScore) {
    sentiment = "Negative";
  }

  const totalScore = positiveScore + negativeScore;

  let confidence = 60;

  if (totalScore > 0) {
    confidence = Math.min(60 + totalScore * 10, 95);
  }

  return {
    sentiment,
    confidence,
  };
}

module.exports = analyzeSentiment;