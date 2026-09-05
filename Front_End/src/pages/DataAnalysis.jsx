import { useState } from "react";


function DatasetAnalysis() {
  const [file, setFile] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [error, setError] = useState("");
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setDataset(null);
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:3000/api/dataset/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setDataset(data);

      if (data.columns.length > 0) {
        setSelectedColumn(data.columns[0]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDataset = async () => {
    if (!file || !selectedColumn) {
      setError("Please upload a CSV and select a comment column.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysisResults(null);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("column", selectedColumn);

    try {
      const response = await fetch(
        "http://localhost:3000/api/dataset/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Dataset analysis failed");
      }

      setAnalysisResults(data);

      console.log("Analysis Results:", data);
    } catch (error) {
      console.error("Dataset analysis error:", error);

      setError(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dataset Analysis</h1>
        <p>
          Upload a CSV file containing public reactions for bulk analysis
        </p>
      </div>

      {/* Upload Area */}
      <div className="upload-panel">
        <div className="upload-icon">📁</div>

        <h2>Upload your CSV dataset</h2>

        <p>
          Upload a CSV file containing the comments or public reactions
          you want to analyze.
        </p>

        <label className="upload-button">
          📂 Choose CSV File
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            hidden
          />
        </label>

        {file && (
          <div className="file-info">
            <span>📄</span>

            <div>
              <strong>{file.name}</strong>
              <p>{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading">
            ⏳ Processing dataset...
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      {dataset && (
        <div className="dataset-results">
          <div className="dataset-header">
            <div>
              <h2>Dataset Loaded Successfully ✅</h2>
              <p>Your CSV has been processed.</p>
            </div>
          </div>

          <div className="dataset-stats">
            <div className="dataset-stat">
              <span>📄</span>
              <p>File</p>
              <h3>{dataset.fileName}</h3>
            </div>

            <div className="dataset-stat">
              <span>💬</span>
              <p>Total Rows</p>
              <h3>{dataset.rowCount}</h3>
            </div>

            <div className="dataset-stat">
              <span>📊</span>
              <p>Columns</p>
              <h3>{dataset.columns.length}</h3>
            </div>
          </div>

          {/* Column Selection */}
          <div className="column-panel">
            <h2>Select Column</h2>

            <p>
              Choose the column containing the data you
              want to analyze.
            </p>

            <select
              className="column-select"
              value={selectedColumn}
              onChange={(event) => setSelectedColumn(event.target.value)}
            >
              {dataset.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div className="preview-panel">
            <div className="panel-header">
              <div>
                <h2>Dataset Preview</h2>
                <p>First 5 rows of your uploaded dataset</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {dataset.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {dataset.preview.map((row, index) => (
                    <tr key={index}>
                      {dataset.columns.map((column) => (
                        <td key={column}>
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            className="analyze-dataset-btn"
            onClick={analyzeDataset}
            disabled={analyzing}
          >

            {analyzing
              ? "⏳ Analyzing Dataset..."
              : "🧠 Analyze Dataset"}
          </button>

          {analysisResults?.limited && (
            <div className="dataset-warning">
              ⚠️ Your dataset contains {analysisResults.totalRows} rows.
              Only the first 500 rows were analyzed in this run.
            </div>

          )}

          {analysisResults && (
            <div className="analysis-results">

              <div className="analysis-results-header">
                <div>
                  <h2>📊 Analysis Results</h2>
                  <p>
                    RoBERTa sentiment analysis of your dataset
                  </p>
                </div>
              </div>

              <div className="analysis-stats">

                <div className="analysis-stat">
                  <span>💬</span>
                  <p>Total Rows</p>
                  <h3>{analysisResults.totalRows}</h3>
                </div>

                <div className="analysis-stat">
                  <span>🧠</span>
                  <p>Analyzed</p>
                  <h3>{analysisResults.analyzedRows}</h3>
                </div>

                <div className="analysis-stat positive-stat">
                  <span>😊</span>
                  <p>Positive</p>
                  <h3>
                    {analysisResults.sentimentCounts.Positive}
                  </h3>
                </div>

                <div className="analysis-stat neutral-stat">
                  <span>😐</span>
                  <p>Neutral</p>
                  <h3>
                    {analysisResults.sentimentCounts.Neutral}
                  </h3>
                </div>

                <div className="analysis-stat negative-stat">
                  <span>😞</span>
                  <p>Negative</p>
                  <h3>
                    {analysisResults.sentimentCounts.Negative}
                  </h3>
                </div>

              </div>

            </div>


          )}
          {analysisResults && analysisResults.results && (
            <div className="results-table-container">

              <div className="results-table-header">
                <div>
                  <h2>📋 Analyzed Comments</h2>
                  <p>
                    Showing {analysisResults.analyzedRows} analyzed comments
                  </p>
                </div>
              </div>

              <div className="table-scroll">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Comment</th>
                      <th>Sentiment</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysisResults.results.map((row, index) => (
                      <tr key={index}>

                        <td className="comment-cell">
                          {row[selectedColumn]}
                        </td>

                        <td>
                          <span
                            className={`sentiment-badge ${row.Sentiment.toLowerCase()}`}
                          >
                            {row.Sentiment === "Positive" && "😊"}
                            {row.Sentiment === "Neutral" && "😐"}
                            {row.Sentiment === "Negative" && "😞"}

                            {" "}{row.Sentiment}
                          </span>
                        </td>

                        <td className="confidence-cell">
                          {row.Confidence}%
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default DatasetAnalysis;