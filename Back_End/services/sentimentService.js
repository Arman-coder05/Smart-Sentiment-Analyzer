const { analyzeWithRoberta } = require("./robertaService");

async function analyzeSentiment(text) {
  const result = await analyzeWithRoberta(text);

  const labelMap = {
    LABEL_0: "Negative",
    LABEL_1: "Neutral",
    LABEL_2: "Positive",
  };

  const sentiment = labelMap[result.label] || "Neutral";

  return {
    sentiment,
    confidence: Number((result.score * 100).toFixed(2)),
  };
}

module.exports = analyzeSentiment;