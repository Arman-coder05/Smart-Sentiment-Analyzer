const MODEL = "onnx-community/twitter-roberta-base-sentiment-ONNX";

let classifierPromise = null;

async function getClassifier() {
  if (!classifierPromise) {
    const { pipeline } = await import("@huggingface/transformers");

    classifierPromise = pipeline(
      "text-classification",
      MODEL
    );
  }

  return classifierPromise;
}

async function analyzeWithRoberta(text) {
  const classifier = await getClassifier();

  const result = await classifier(text);

  return result[0];
}

module.exports = analyzeWithRoberta;