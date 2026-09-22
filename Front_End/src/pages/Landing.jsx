import "./Landing.css";

function Landing({ onNavigate }) {
  return (
    <div className="landing-page">

      <div className="landing-glow glow-one"></div>
      <div className="landing-glow glow-two"></div>

      <div className="landing-content">

        <div className="landing-icon">
          🧠
        </div>

        <h1>
          Smart Sentiment Analyzer
        </h1>

        <p className="landing-tagline">
          Understand emotions. Discover insights.
        </p>

        <div className="landing-question">

          <h2>
            Do you have a document?
          </h2>

          <p>
            Choose how you would like to begin your analysis.
          </p>

          <div className="landing-options">

            <button
              className="landing-option proceed"
              onClick={() => onNavigate("dashboard")}
            >
              <span className="option-icon">📄</span>

              <span className="option-content">
                <strong>Yes, Proceed</strong>
                <small>
                  I already have a CSV document
                </small>
              </span>

              <span className="option-arrow">→</span>
            </button>

            <button
              className="landing-option create"
              onClick={() => onNavigate("create")}
            >
              <span className="option-icon">✨</span>

              <span className="option-content">
                <strong>No, Create</strong>
                <small>
                  Create a dataset for analysis
                </small>
              </span>

              <span className="option-arrow">→</span>
            </button>

          </div>

        </div>

        <div className="landing-footer">
          Powered by RoBERTa • MERN Stack
        </div>

      </div>

    </div>
  );
}

export default Landing;