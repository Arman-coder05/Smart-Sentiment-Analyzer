const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },

    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    datasetName: {
      type: String,
      required: true,
    },

    columnName: {
      type: String,
      required: true,
    },

    totalRows: {
      type: Number,
      required: true,
    },

    analyzedRows: {
      type: Number,
      required: true,
    },

    sentimentCounts: {
      Positive: {
        type: Number,
        default: 0,
      },

      Neutral: {
        type: Number,
        default: 0,
      },

      Negative: {
        type: Number,
        default: 0,
      },
    },

    averageConfidence: {
      type: Number,
      default: 0,
    },

    results: [resultSchema],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);