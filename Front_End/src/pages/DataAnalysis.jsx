import { useState } from "react";

function DatasetAnalysis() {
  const [file, setFile] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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

            <select className="column-select">
              {dataset.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
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

          <button className="analyze-dataset-btn">
            🧠 Analyze Dataset
          </button>
        </div>
      )}
    </div>
  );
}

export default DatasetAnalysis;