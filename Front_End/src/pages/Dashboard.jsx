import { useState } from "react";

function Dashboard() {
  const [comment, setComment] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeComment = async () => {
    if (!comment.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/sentiment/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (error) {
      console.error("Analysis error:", error);

      setResult({
        error: "Unable to analyze the comment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          🧠 <span>TaxSentiment</span>
        </div>

        <nav>
          <button className="nav-item active">
            📊 <span>Dashboard</span>
          </button>

          <button className="nav-item">
            💬 <span>Comment Analysis</span>
          </button>

          <button className="nav-item">
            📁 <span>Dataset</span>
          </button>

          <button className="nav-item">
            📈 <span>Analytics</span>
          </button>

          <button className="nav-item">
            📄 <span>Reports</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>
              Public sentiment analysis on budgetary tax reforms
            </p>
          </div>

          <div className="status">
            <span className="status-dot"></span>
            System Online
          </div>
        </header>

        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <span>💬</span>
            <p>Total Comments</p>
            <h2>0</h2>
          </div>

          <div className="stat-card positive">
            <span>😊</span>
            <p>Positive</p>
            <h2>0%</h2>
          </div>

          <div className="stat-card neutral">
            <span>😐</span>
            <p>Neutral</p>
            <h2>0%</h2>
          </div>

          <div className="stat-card negative">
            <span>😞</span>
            <p>Negative</p>
            <h2>0%</h2>
          </div>
        </section>

        {/* Dashboard Panels */}
        <section className="dashboard-grid">

          {/* Sentiment Overview */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Sentiment Overview</h2>
                <p>
                  Distribution of analyzed public reactions
                </p>
              </div>
            </div>

            <div className="chart-placeholder">
              <span>📊</span>
              <p>Chart will appear here</p>
            </div>
          </div>

          {/* Quick Analysis */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Quick Analysis</h2>
                <p>Analyze a public reaction</p>
              </div>
            </div>

            <textarea
              className="comment-input"
              placeholder="Enter a comment to analyze..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />

            <button
              className="analyze-btn"
              onClick={analyzeComment}
              disabled={loading}
            >
              {loading
                ? "⏳ Analyzing..."
                : "🧠 Analyze Sentiment"}
            </button>

            {/* Result */}
            {result && !result.error && (
              <div className={`analysis-result ${result.sentiment.toLowerCase()}`}>
                <div className="result-header">
                  <span>
                    {result.sentiment === "Positive" && "😊"}
                    {result.sentiment === "Negative" && "😞"}
                    {result.sentiment === "Neutral" && "😐"}
                  </span>

                  <h3>{result.sentiment}</h3>
                </div>

                <div className="result-details">
                  <div>
                    <span>Confidence</span>
                    <strong>{result.confidence}%</strong>
                  </div>

                  <div>
                    <span>Model</span>
                    <strong>{result.model}</strong>
                  </div>
                </div>
              </div>
            )}

            {result?.error && (
              <div className="error-message">
                ❌ {result.error}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;