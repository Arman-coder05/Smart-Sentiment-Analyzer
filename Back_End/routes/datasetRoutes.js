const express = require("express");
const Analysis = require("../models/analysis");
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

    const validRecords = records.filter(
      (row) =>
        row[column] &&
        String(row[column]).trim() !== ""
    );

    const totalRows = validRecords.length;

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

    const databaseResults = results.map((row) => ({
      comment: String(row[column]),
      sentiment: row.Sentiment,
      confidence: row.Confidence,
    }));

    const averageConfidence =
      databaseResults.length > 0
        ? Number(
          (
            databaseResults.reduce(
              (sum, item) => sum + item.confidence,
              0
            ) / databaseResults.length
          ).toFixed(2)
        )
        : 0;

    const counts = {
      Positive: results.filter(
        (row) => row.Sentiment === "Positive"
      ).length,

      Neutral: results.filter(
        (row) => row.Sentiment === "Neutral"
      ).length,

      Negative: results.filter(
        (row) => row.Sentiment === "Negative"
      ).length,
    };

    const analysis = await Analysis.create({
      datasetName: req.file.originalname,

      columnName: column,

      totalRows,

      analyzedRows: results.length,

      sentimentCounts: counts,

      averageConfidence,

      results: databaseResults,
    });


    results.forEach((row) => {
      counts[row.Sentiment]++;
    });

    res.json({
      message: "Dataset analyzed successfully",

      analysisId: analysis._id,

      datasetName: analysis.datasetName,

      totalRows,

      analyzedRows: results.length,

      limit: MAX_ROWS,

      limited: totalRows > MAX_ROWS,

      sentimentCounts: counts,

      averageConfidence,

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