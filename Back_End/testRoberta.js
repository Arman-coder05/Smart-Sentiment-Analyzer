const analyzeWithRoberta = require("./services/robertaService");

async function test() {
  try {
    const result = await analyzeWithRoberta(
      "The new tax reform is beneficial and will improve the economy."
    );

    console.log(result);
  } catch (error) {
    console.error("RoBERTa error:", error);
  }
}

test();