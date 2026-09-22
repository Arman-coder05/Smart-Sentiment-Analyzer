import { useState } from "react";
import DatasetAnalysis from "./pages/DataAnalysis";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  return (
    <>
      {currentPage == "landing" && (
        <Landing
          onNavigate={setCurrentPage}/>
      )}

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