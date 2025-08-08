import path from "path";
import express from "express";
import multer from "multer";
import cors from "cors";
import { extractTextFromFile, chunkText, embedTextChunks, searchSimilarChunks, generateAnswerFromChunks } from "./documentProcessing"; // You implement these helpers
import { createServer } from "./index";
import * as express from "express";
const app = createServer();
const port = process.env.PORT || 3000;

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const distPath = path.join(__dirname, "../spa");

// Middleware
app.use(cors()); // enable CORS for frontend requests
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static SPA files
app.use(express.static(distPath));

// ---- API endpoints ----

// 1. Upload document API - accepts a single file upload, extracts and indexes
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Document file required" });

    // 1. Extract text from the uploaded file buffer
    const rawText = await extractTextFromFile(req.file.buffer, req.file.originalname);

    // 2. Chunk the extracted text
    const textChunks = chunkText(rawText, 1000); // chunk size in tokens or characters

    // 3. Generate embeddings for chunks & store in your vector DB with a docId
    const docId = await embedTextChunks(textChunks);

    res.status(200).json({ docId, message: "Document uploaded and processed successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process document" });
  }
});

// 2. Query document API - accepts docId and query, returns a grounded answer from the document
app.post("/api/query", async (req, res) => {
  try {
    const { docId, query } = req.body;
    if (!docId || !query) return res.status(400).json({ error: "docId and query are required" });

    // 1. Embed the query
    // 2. Retrieve top relevant chunks from vector store
    const relevantChunks = await searchSimilarChunks(docId, query);

    if (!relevantChunks || relevantChunks.length === 0) {
      return res.status(404).json({ answer: "Sorry, no relevant information found in the document." });
    }

    // 3. Generate answer using LLM with retrieved chunks + user query
    const answer = await generateAnswerFromChunks(relevantChunks, query);

    res.status(200).json({ answer });
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Failed to fetch answer" });
  }
});

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
