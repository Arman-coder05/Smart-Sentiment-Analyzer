const express = require('express'); 
const cors = require('cors');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/sentiment", require("./routes/sentimentRoutes"));

app.get('/', (req, res) => {
  res.send('BackEnd server is running');
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from TaxSentiment AI Backend 🚀"
  });
});

app.post("/api/dataset/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No CSV file uploaded",
      });
    }

    const csvData = req.file.buffer.toString("utf-8");

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const columns = records.length > 0 ? Object.keys(records[0]) : [];

    res.json({
      message: "CSV uploaded successfully",
      fileName: req.file.originalname,
      fileSize: req.file.size,
      rowCount: records.length,
      columns: columns,
      preview: records.slice(0, 5),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to process CSV file",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});