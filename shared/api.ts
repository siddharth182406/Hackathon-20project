export interface DemoResponse {
  message: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
}

export interface UploadDocumentResponse {
  success: boolean;
  document?: DocumentMetadata;
  error?: string;
}

export interface SearchQuery {
  query: string;
  documents?: string[]; // Document IDs to search in, or all if empty
}

export interface SearchResult {
  documentId: string;
  filename: string;
  excerpt: string;
  relevanceScore: number;
  pageNumber?: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  summary?: string;
  error?: string;
}

export interface DocumentListResponse {
  success: boolean;
  documents: DocumentMetadata[];
  error?: string;
}
