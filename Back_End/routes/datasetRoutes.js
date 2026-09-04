const express = require("express");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const {
  analyzeMultipleWithRoberta,
} = require("../services/robertaService");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

const MAX_ROWS = 500;

router.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No CSV file uploaded",
      });
    }

    const { column } = req.body;

    if (!column) {
      return res.status(400).json({
        error: "Please select a comment column",
      });
    }

    const csvData = req.file.buffer.toString("utf-8");

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) {
      return res.status(400).json({
        error: "CSV file contains no data",
      });
    }

    if (!Object.prototype.hasOwnProperty.call(records[0], column)) {
      return res.status(400).json({
        error: `Column "${column}" was not found in the dataset`,
      });
    }

    // Remove empty comments
    const validRecords = records.filter(
      (row) =>
        row[column] &&
        String(row[column]).trim() !== ""
    );

    const totalRows = validRecords.length;

    // 🔒 Maximum 500 rows per analysis
    const rowsToAnalyze = validRecords.slice(0, MAX_ROWS);

    const texts = rowsToAnalyze.map((row) =>
      String(row[column]).trim()
    );

    console.log(
      `Analyzing ${texts.length} of ${totalRows} rows...`
    );

    // Run all selected comments through RoBERTa
    const predictions = await analyzeMultipleWithRoberta(texts);

    const labelMap = {
      LABEL_0: "Negative",
      LABEL_1: "Neutral",
      LABEL_2: "Positive",
    };

    const results = rowsToAnalyze.map((row, index) => {
      const prediction = predictions[index];

      return {
        ...row,
        Sentiment:
          labelMap[prediction.label] || "Neutral",
        Confidence: Number(
          (prediction.score * 100).toFixed(2)
        ),
      };
    });

    const counts = {
      Positive: 0,
      Neutral: 0,
      Negative: 0,
    };

    results.forEach((row) => {
      counts[row.Sentiment]++;
    });

    res.json({
      message: "Dataset analyzed successfully",

      totalRows,

      analyzedRows: results.length,

      limit: MAX_ROWS,

      limited: totalRows > MAX_ROWS,

      sentimentCounts: counts,

      results,
    });
  } catch (error) {
    console.error("Dataset analysis error:", error);

    res.status(500).json({
      error: "Failed to analyze dataset",
    });
  }
});

module.exports = router;