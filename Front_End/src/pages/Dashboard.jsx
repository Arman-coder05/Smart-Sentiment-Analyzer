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
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

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

  const generateReport = async () => {

    try {

        setGeneratingReport(true);

        const response = await fetch(
            "http://localhost:3000/api/dataset/report"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to generate PDF report"
            );
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        setReportUrl(url);
        setReportGenerated(true);

    } catch (error) {

        console.error(
            "❌ PDF generation error:",
            error
        );

        alert(
            "Unable to generate the PDF report."
        );

    } finally {

        setGeneratingReport(false);

    }
};

const downloadReport = () => {

    if (!reportUrl) {
        return;
    }

    const link = document.createElement("a");

    link.href = reportUrl;

    link.download =
        "TaxSentiment_Analysis_Report.pdf";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
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
           <span>🧠 Smart Analyzer</span>
        </div>
        <nav>
          <button className="nav-item" onClick={() => scrollToSection("dashboard")} defaultValue={"active"}>
            💻 <span>Dashboard</span>
          </button>

          <button onClick={() => scrollToSection("chart-overview")} className="nav-item">
            📊 <span>Chart Overview</span>
          </button>

          <button onClick={() => scrollToSection("quick-analysis")} className="nav-item">
            💬 <span>Quick Analysis</span>
          </button>

          <button onClick={() => scrollToSection("confidence-analysis")} className="nav-item">
            📈 <span>Confidence</span>
          </button>

          <button onClick={() => scrollToSection("reports")} className="nav-item">
            📄 <span>Reports</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        <div className="topbar-actions">

          <input type="checkbox" id="check" />

          <button className="navigators open">
            <label htmlFor="check">
              <span>▼</span>
            </label>
          </button>

          <div className="upload-dataset">

            <button
              onClick={() => onNavigate("dataset")}
              className="Dataset-btn">
               <span>Upload Dataset </span>🗁
            </button>

            <button className="close">
              <label htmlFor="check">
                <span>▲</span>
              </label>
            </button>

          </div>

          <p className="upload-instructions" style={{ display: 'relative' }}>
            Click the icon above to open the panel.
          </p>
        </div>
        <header className="topbar">
          <div id="dashboard">
            <div>
              <h1>Dashboard</h1>
              <p>
                Public sentiment analysis on budgetary tax reforms
              </p>
            </div>
          </div>


          <div className="status">
            <span className="status-dot"></span>
            System Online
          </div>

        </header>
        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <span>🧠</span>
            <p>Used Model</p>
            <h2>Twitter-roBERTa
            </h2>
          </div>

          <div className="stat-card">
            <span>💬</span>
            <p>Analyzed Comments</p>
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
          <div className="panel" id="chart-overview">
            <div className="panel-header">
                <h2>Sentiment Overview</h2>
                <p>
                  Distribution of analyzed public reactions
                </p>
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
                      <Cell fill="#34D399" />
                      <Cell fill="#FBBF24" />
                      <Cell fill="#FB1785" />
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
          <div className="panel" id="quick-analysis">
            <div className="panel-header">
                <h2>Quick Analysis</h2>
                <p>Analyze a text</p>
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

          <div className="panel" id="confidence-analysis">
            <div className="panel-header">
                <h2>Confidence Analysis</h2>
                <p>RoBERTa prediction confidence across analyzed comments</p>
              </div>

            {analytics?.results?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart className="line" data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="comment"
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />

                  <Tooltip className="custom-tooltip" contentStyle={{ backgroundColor: "#fff", color: "#3182BD" }}
                    formatter={(value) => [`${value}%`, "Confidence"]}
                  />

                  <Line
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

          <div className="panel report-panel" id="reports">

            <div className="panel-header">

              <div>
                <h2>📄 Generate PDF Report</h2>

                <p>
                  Generate a detailed report from your latest
                  sentiment analysis.
                </p>
              </div>

            </div>


            <div className="report-description">

              <p>
                Your report contains a comprehensive summary of the
                analyzed dataset, sentiment distribution, confidence
                statistics, processing information and detailed
                classification results.
              </p>

            </div>


            <div className="report-summary">

              <div>
                <span>Dataset</span>
                <strong>
                  {analytics?.totalRows ?? 0} rows
                </strong>
              </div>

              <div>
                <span>Analyzed</span>
                <strong>
                  {analytics?.analyzedRows ?? 0} rows
                </strong>
              </div>

              <div>
                <span>Model</span>
                <strong>
                  RoBERTa-Twitter
                </strong>
              </div>

              <div>
                <span>Avg. Confidence</span>
                <strong>
                  {analytics?.averageConfidence
                    ? `${analytics.averageConfidence.toFixed(2)}%`
                    : "0%"}
                </strong>
              </div>

              <div>
                <span>Highest Confidence</span>
                <strong>
                  {highestConfidence
                    ? `${highestConfidence.toFixed(2)}%`
                    : "0%"}
                </strong>
              </div>

              <div>
                <span>Lowest Confidence</span>
                <strong>
                  {lowestConfidence
                    ? `${lowestConfidence.toFixed(2)}%`
                    : "0%"}
                </strong>
              </div>

            </div>


            <div className="report-features">

              <h3>📋 Report Includes</h3>

              <div className="feature-grid">

                <span>✓ Dataset information</span>

                <span>✓ Sentiment distribution</span>

                <span>✓ Positive / Neutral / Negative counts</span>

                <span>✓ Average confidence</span>

                <span>✓ Highest & lowest confidence</span>

                <span>✓ Dataset processing statistics</span>

                <span>✓ Detailed classification results</span>

                <span>✓ Analysis methodology</span>

                <span>✓ Interpretation & conclusion</span>

                <span>✓ Analysis limitations</span>

              </div>

            </div>


            <div className="report-actions">

              <button
                className="report-button"
                onClick={generateReport}
                disabled={reportGenerated || generatingReport}
              >
                {generatingReport
                  ? "⏳ Generating PDF..."
                  : reportGenerated
                    ? "✅ PDF Generated"
                    : "📄 Generate PDF Report"}
              </button>


              {reportGenerated && reportUrl && (

                <button
                  className="download-report-button"
                  onClick={downloadReport}
                >
                  ⬇️ Download PDF
                </button>

              )}

            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;