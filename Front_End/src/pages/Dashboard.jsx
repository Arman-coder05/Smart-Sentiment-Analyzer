import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Dashboard({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/dataset/latest"
        );

        if (!response.ok) {
          throw new Error("No analysis found");
        }

        const data = await response.json();

        setAnalytics(data);
      } catch (error) {
        console.log("Analytics:", error.message);
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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

  const positiveCount =
    analytics?.sentimentCounts?.Positive || 0;

  const neutralCount =
    analytics?.sentimentCounts?.Neutral || 0;

  const negativeCount =
    analytics?.sentimentCounts?.Negative || 0;

  const analyzedRows =
    analytics?.analyzedRows || 0;

  const positivePercentage =
    analyzedRows
      ? ((positiveCount / analyzedRows) * 100).toFixed(1)
      : 0;

  const neutralPercentage =
    analyzedRows
      ? ((neutralCount / analyzedRows) * 100).toFixed(1)
      : 0;

  const negativePercentage =
    analyzedRows
      ? ((negativeCount / analyzedRows) * 100).toFixed(1)
      : 0;

  const sentimentData = [
    {
      name: "Positive",
      value: positiveCount,
    },
    {
      name: "Neutral",
      value: neutralCount,
    },
    {
      name: "Negative",
      value: negativeCount,
    },
  ];
  const confidenceData =
    analytics?.results?.map((item, index) => ({
      comment: `#${index + 1}`,
      confidence: item.confidence,
    })) || [];

  const confidenceValues =
    analytics?.results?.map((item) => item.confidence) || [];

  const highestConfidence =
    confidenceValues.length > 0
      ? Math.max(...confidenceValues)
      : 0;

  const lowestConfidence =
    confidenceValues.length > 0
      ? Math.min(...confidenceValues)
      : 0;

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

          <button
            onClick={() => onNavigate("dataset")}
            className="nav-item">
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
            <h2>
              {analyticsLoading
                ? "..."
                : analytics?.analyzedRows ?? 0}
            </h2>
          </div>

          <div className="stat-card positive">
            <span>😊</span>
            <p>Positive</p>
            <h2>{positivePercentage}%</h2>
          </div>

          <div className="stat-card neutral">
            <span>😐</span>
            <p>Neutral</p>
            <h2>{neutralPercentage}%</h2>
          </div>

          <div className="stat-card negative">
            <span>😞</span>
            <p>Negative</p>
            <h2>{negativePercentage}%</h2>
          </div>
          <div className="stat-card">
            <span>🎯</span>
            <p>Avg. Confidence</p>
            <h2>
              {analytics
                ? `${analytics.averageConfidence}%`
                : "0%"}
            </h2>
          </div>
          <div className="stat-card">
            <span>⬆️</span>
            <p>Highest Confidence</p>
            <h2>{highestConfidence.toFixed(2)}%</h2>
          </div>

          <div className="stat-card">
            <span>⬇️</span>
            <p>Lowest Confidence</p>
            <h2>{lowestConfidence.toFixed(2)}%</h2>
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
            <div className="chart-container">
              {analyticsLoading ? (
                <p>Loading analytics...</p>
              ) : analytics ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={85}
                      outerRadius={130}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ percent }) =>
                        ` ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ef4444" />
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  <div>📊</div>
                  <p>No analysis available</p>
                  <span>Analyze a dataset to view sentiment distribution.</span>
                </div>
              )}
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
      <section className="confidence-grid">
        <div className="panel confidence-panel">
          <div className="panel-header">
            <div>
              <h2>Confidence Analysis</h2>
              <p>RoBERTa prediction confidence across analyzed comments</p>
            </div>
          </div>

          {analytics?.results?.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="comment"
                  interval="preserveStartEnd"
                />

                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />

                <Tooltip className="custom-tooltip" contentStyle={{ backgroundColor: "#fff", padding: "10px", color: "#3182BD" }}
                  formatter={(value) => [`${value}%`, "Confidence"]}
                />

                <Line
                  type="monotone"
                  dataKey="confidence"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              <div>🎯</div>
              <p>No confidence data available</p>
              <span>Analyze a dataset to view confidence analytics.</span>
            </div>
          )}
        </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;