  # 🧠 TaxSentiment — AI-Based Sentiment Analysis Platform

TaxSentiment is a full-stack web application designed to analyze public reactions to taxation and budgetary reforms using Artificial Intelligence and Natural Language Processing (NLP).

The application allows users to upload a CSV dataset containing textual comments, analyze the data using a RoBERTa-based sentiment classification model, visualize the results through an interactive analytics dashboard, store analysis results in MongoDB, and generate detailed PDF reports.

---

## 🚀 Features

### 📂 Dataset Upload & Analysis

- Upload CSV datasets directly through the web interface.
- Automatically process the selected text/comment column.
- Supports large datasets while limiting individual analysis runs to a maximum of 500 rows.
- Displays analyzed results in a structured table.
- Provides sentiment classification and confidence scores for individual comments.

### 🤖 AI-Based Sentiment Analysis

TaxSentiment uses a RoBERTa-based sentiment classification model to classify public reactions into:

- 🟢 Positive
- 🔵 Neutral
- 🔴 Negative

Each prediction also includes a confidence score indicating the model's confidence in its classification.

### 📊 Interactive Analytics Dashboard

The dashboard provides an overview of the analyzed dataset through:

- Total comments analyzed
- Positive sentiment percentage
- Neutral sentiment percentage
- Negative sentiment percentage
- Average confidence
- Highest confidence
- Lowest confidence
- Sentiment distribution charts
- Confidence analytics

### 💬 Quick Sentiment Analysis

Users can enter an individual comment directly into the dashboard and receive:

- Predicted sentiment
- Confidence score
- Model information

This provides a quick way to test individual text without uploading a complete dataset.

### 🗄️ MongoDB Data Storage

Analysis results are stored in MongoDB, including:

- Dataset information
- Number of rows
- Number of analyzed rows
- Sentiment counts
- Average confidence
- Individual analysis results
- Sentiment labels
- Confidence values

### 📄 PDF Report Generation

TaxSentiment generates detailed PDF reports containing important analytical information such as:

- Dataset information
- Number of rows analyzed
- Sentiment distribution
- Confidence statistics
- Highest confidence
- Lowest confidence
- Average confidence
- Model information
- Methodology
- Interpretation of results
- Detailed sentiment results
- Limitations
- Conclusion

The PDF generation system also supports a separate manual download workflow.

### 🧭 Dashboard Navigation

The dashboard includes navigation between major sections of the application.

Navigation buttons automatically scroll to their corresponding sections, while the active navigation item updates when the user:

- Clicks a navigation option
- Manually scrolls to a section

---

# 🛠️ Technology Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Recharts
- Vite

## Backend

- Node.js
- Express.js
- JavaScript
- Multer
- CSV parsing

## Database

- MongoDB
- Mongoose

## Artificial Intelligence / NLP

- RoBERTa
- Hugging Face Transformers
- Transformers.js
- ONNX Runtime

## Reporting

- PDFKit

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    React Frontend   │
                         │                     │
                         │ Dashboard           │
                         │ Dataset Upload      │
                         │ Analytics           │
                         │ Charts              │
                         │ PDF Panel           │
                         └──────────┬──────────┘
                                    │
                              HTTP Requests
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │                     │
                         │ API Routes          │
                         │ Dataset Processing  │
                         │ Sentiment Service   │
                         │ PDF Service         │
                         └───────┬───────┬─────┘
                                 │       │
                   ┌─────────────┘       └──────────────┐
                   ▼                                    ▼
          ┌─────────────────┐                  ┌─────────────────┐
          │    MongoDB      │                  │    RoBERTa      │
          │                 │                  │ Sentiment Model │
          │ Analysis Data   │                  │                 │
          │ Results         │                  │ NLP Inference   │
          └─────────────────┘                  └─────────────────┘