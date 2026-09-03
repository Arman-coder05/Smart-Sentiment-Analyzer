import "../index.css";

function Dashboard() {
  return (
    <div className="app">
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
            📁 <span>Dataset Analysis</span>
          </button>

          <button className="nav-item">
            📈 <span>Model Comparison</span>
          </button>

          <button className="nav-item">
            📄 <span>Reports</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Public sentiment analysis on budgetary tax reforms</p>
          </div>

          <div className="status">
            <span className="status-dot"></span>
            System Online
          </div>
        </header>

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

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Sentiment Overview</h2>
                <p>Distribution of analyzed public reactions</p>
              </div>
            </div>

            <div className="chart-placeholder">
              <span>📊</span>
              <p>Chart will appear here</p>
            </div>
          </div>

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
            />

            <button className="analyze-btn">
              🧠 Analyze Sentiment
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;