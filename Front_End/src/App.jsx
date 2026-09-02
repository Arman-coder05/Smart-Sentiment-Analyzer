import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    fetch("http://localhost:3000/api/test")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Backend response:", data);
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Backend connection error:", error);
        setMessage("❌ Could not connect to backend");
      });
  }, []);

  return (
    <div>
      <h1>TaxSentiment AI</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;