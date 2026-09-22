# 🧠 Smart Sentiment Analyzer

A MERN-based sentiment analysis platform that uses **RoBERTa** to analyze sentiment from CSV datasets. The application provides automated sentiment classification, confidence analysis, interactive visualizations, and downloadable PDF reports.

---

## 📌 Project Overview

**Smart Sentiment Analyzer** is a full-stack web application designed to analyze textual data stored in CSV files.

Users can upload a CSV dataset, select the appropriate text column, and analyze the data using a **RoBERTa-based sentiment analysis model**.

The system classifies text into:

- 🟢 Positive
- 🔴 Negative
- 🟡 Neutral

Along with sentiment classification, the application provides confidence scores, statistical insights, interactive charts, and PDF reports.

The project combines the **MERN stack** with a transformer-based NLP model to create a complete sentiment analysis platform.

---

## ✨ Features

### 📂 CSV Dataset Analysis
- Upload CSV datasets through the web interface.
- Select the column containing textual data.
- Analyze up to **500 rows per analysis**.
- Display analyzed results in a structured dataset table.

### 🤖 RoBERTa Sentiment Analysis
- Uses a **RoBERTa-based sentiment classification model**.
- Automatically classifies textual data as:
  - Positive
  - Neutral
  - Negative
- Generates confidence scores for individual predictions.

### 📊 Interactive Analytics
The dashboard provides:
- Total analyzed rows
- Positive sentiment percentage
- Neutral sentiment percentage
- Negative sentiment percentage
- Average confidence
- Highest confidence
- Lowest confidence
- Confidence distribution
- Interactive sentiment charts

### 📈 Data Visualization
Interactive charts are used to make sentiment results easier to understand and interpret.

### 📄 PDF Report Generation
Generate a downloadable PDF report containing:
- Dataset information
- Sentiment statistics
- Sentiment distribution
- Confidence analytics
- Highest-confidence result
- Lowest-confidence result
- Analysis summary

### 🗄️ MongoDB Storage
Analysis results can be stored in MongoDB for persistence and retrieval.

### 🖥️ Dashboard
A centralized dashboard provides access to:
- Dataset analysis
- Quick analysis
- Sentiment analytics
- Confidence analytics
- PDF report generation

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Recharts

### Backend
- Node.js
- Express.js
- JavaScript

### Database
- MongoDB
- Mongoose

### Machine Learning / NLP
- RoBERTa
- Hugging Face Transformers
- ONNX Runtime

### PDF Generation
- PDFKit

### Development Tools
- Git
- GitHub
- Thunder Client
- Visual Studio Code

---

## 🧠 Sentiment Analysis Model

The application uses:

**`onnx-community/twitter-roberta-base-sentiment-ONNX`**

This is an ONNX version of the RoBERTa-based sentiment model originally developed by CardiffNLP.

The model processes textual input and produces sentiment predictions with associated confidence scores.

### Sentiment Classes

| Label | Meaning |
|-------|---------|
| 🟢 Positive | Positive sentiment |
| 🟡 Neutral | Neutral or objective sentiment |
| 🔴 Negative | Negative sentiment |

---

## 🏗️ System Architecture

```text
                 ┌─────────────────────┐
                 │      User           │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │      + Vite         │
                 └──────────┬──────────┘
                            │
                     HTTP Requests
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Express Backend   │
                 │     + Node.js       │
                 └───────┬─────┬───────┘
                         │     │
              ┌──────────┘     └──────────┐
              ▼                           ▼
     ┌─────────────────┐         ┌─────────────────┐
     │     MongoDB     │         │    RoBERTa      │
     │    Database     │         │ Sentiment Model │
     └─────────────────┘         └────────┬────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │ Sentiment +     │
                                │ Confidence      │
                                │ Results         │
                                └────────┬────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │ Analytics + PDF │
                                │     Reports     │
                                └─────────────────┘