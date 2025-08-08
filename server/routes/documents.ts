import { RequestHandler } from "express";
import {
  UploadDocumentResponse,
  DocumentMetadata,
  DocumentListResponse,
} from "@shared/api";

// In-memory storage for demo purposes
// In production, this would be a database
const documents: DocumentMetadata[] = [];

export const handleDocumentUpload: RequestHandler = (req, res) => {
  try {
    // In a real implementation, you would:
    // 1. Validate the uploaded file
    // 2. Store the file securely (S3, local storage, etc.)
    // 3. Extract text content using OCR/parsing libraries
    // 4. Process the text with LLM for indexing
    // 5. Store metadata and content in a vector database

    // Mock file processing
    const mockFile = {
      id: Math.random().toString(36).substr(2, 9),
      filename: `document_${Date.now()}.pdf`,
      size: Math.floor(Math.random() * 5000000) + 100000, // Random size between 100KB and 5MB
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
      status: "ready" as const,
    };

    documents.push(mockFile);

    const response: UploadDocumentResponse = {
      success: true,
      document: mockFile,
    };

    res.json(response);
  } catch (error) {
    console.error("Document upload error:", error);
    const response: UploadDocumentResponse = {
      success: false,
      error: "Failed to process document",
    };
    res.status(500).json(response);
  }
};

export const handleGetDocuments: RequestHandler = (req, res) => {
  try {
    const response: DocumentListResponse = {
      success: true,
      documents: documents,
    };

    res.json(response);
  } catch (error) {
    console.error("Get documents error:", error);
    const response: DocumentListResponse = {
      success: false,
      documents: [],
      error: "Failed to retrieve documents",
    };
    res.status(500).json(response);
  }
};

export const handleDeleteDocument: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const documentIndex = documents.findIndex((doc) => doc.id === id);

    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    documents.splice(documentIndex, 1);

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete document",
    });
  }
};
