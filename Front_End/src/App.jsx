import { useState } from "react";
import DatasetAnalysis from "./pages/DataAnalysis";
import Dashboard from "./pages/Dashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  return (
    <>
      {currentPage === "dashboard" && (
        <Dashboard
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === "dataset" && (
        <DatasetAnalysis
          onNavigate={setCurrentPage}
        />
      )}
    </>
  );
}

export default App;