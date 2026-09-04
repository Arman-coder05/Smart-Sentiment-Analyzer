const express = require('express');
const router = express.Router();
const analyzeSentiment = require('../services/sentimentService');

router.post("/analyze", (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    const result = analyzeSentiment(text);

    res.json({
      text,
      ...result,
      model: "Temporary Sentiment Engine",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Sentiment analysis failed",
    });
  }
});

module.exports = router;