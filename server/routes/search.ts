import { RequestHandler } from "express";
import { SearchQuery, SearchResponse, SearchResult } from "@shared/api";

// Mock document content for demonstration
const mockDocumentContent = [
  {
    id: "1",
    filename: "Employment_Contract_2024.pdf",
    content: [
      "The employee shall be entitled to 25 days of annual vacation leave, health insurance coverage, and performance-based bonuses as outlined in Section 4.2 of this agreement.",
      "Termination of employment may occur with 30 days written notice from either party. Severance pay will be calculated based on years of service.",
      "Confidentiality obligations continue for 2 years post-employment. Trade secrets and proprietary information must not be disclosed."
    ]
  },
  {
    id: "2", 
    filename: "Privacy_Policy_v3.docx",
    content: [
      "Personal data collected includes name, email address, and usage analytics. Data is processed in accordance with GDPR regulations and stored securely using AES-256 encryption.",
      "Users have the right to access, modify, or delete their personal information. Data retention period is 7 years for compliance purposes.",
      "Third-party integrations are limited to essential services only. No data is sold or shared for marketing purposes."
    ]
  },
  {
    id: "3",
    filename: "Vendor_Agreement_TechCorp.pdf", 
    content: [
      "Payment terms are Net 30 days from invoice date. Late payments will incur a 1.5% monthly service charge. All payments must be made in USD.",
      "Service level agreement guarantees 99.9% uptime. Downtime compensation is prorated based on actual service interruption.",
      "Either party may terminate this agreement with 90 days written notice. Outstanding payments must be settled within 15 days of termination."
    ]
  },
  {
    id: "4",
    filename: "Partnership_Agreement_2024.pdf",
    content: [
      "Revenue sharing is split 60/40 between partners based on contribution levels. Quarterly reviews will assess performance metrics.",
      "Intellectual property developed jointly belongs to both parties. Individual IP contributions remain with the originating party.",
      "Dispute resolution follows arbitration procedures outlined in Section 12. Legal costs are shared equally between parties."
    ]
  }
];

// Simple keyword matching function (in production, this would use vector similarity)
function calculateRelevanceScore(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
  const contentLower = content.toLowerCase();
  
  let matches = 0;
  let totalWords = queryWords.length;
  
  queryWords.forEach(word => {
    if (contentLower.includes(word)) {
      matches++;
    }
  });
  
  const baseScore = matches / totalWords;
  
  // Add bonus for exact phrase matches
  if (contentLower.includes(query.toLowerCase())) {
    return Math.min(0.95, baseScore + 0.3);
  }
  
  return Math.min(0.9, baseScore);
}

function generateSummary(query: string, results: SearchResult[]): string {
  const topics = [
    { keywords: ['payment', 'invoice', 'cost', 'fee', 'price'], topic: 'payment terms' },
    { keywords: ['terminate', 'end', 'cancel', 'notice'], topic: 'termination clauses' },
    { keywords: ['data', 'privacy', 'gdpr', 'information'], topic: 'data privacy policies' },
    { keywords: ['vacation', 'leave', 'benefits', 'insurance'], topic: 'employee benefits' },
    { keywords: ['confidential', 'proprietary', 'trade secret'], topic: 'confidentiality agreements' },
    { keywords: ['revenue', 'profit', 'sharing', 'partnership'], topic: 'revenue sharing arrangements' }
  ];

  const queryLower = query.toLowerCase();
  const relevantTopics = topics.filter(topic => 
    topic.keywords.some(keyword => queryLower.includes(keyword))
  );

  const documentsFound = results.length;
  const topicMentions = relevantTopics.map(t => t.topic).join(', ');

  if (relevantTopics.length > 0) {
    return `Based on your query about ${topicMentions}, I found ${documentsFound} relevant section${documentsFound > 1 ? 's' : ''} across your documents. The information covers key provisions and requirements related to your search.`;
  } else {
    return `I found ${documentsFound} relevant section${documentsFound > 1 ? 's' : ''} related to your query. The search results include excerpts from multiple documents that contain pertinent information.`;
  }
}

export const handleSearch: RequestHandler = (req, res) => {
  try {
    const { query, documents: documentIds }: SearchQuery = req.body;

    if (!query || query.trim().length === 0) {
      const response: SearchResponse = {
        success: false,
        query: query || '',
        results: [],
        error: 'Query cannot be empty'
      };
      return res.status(400).json(response);
    }

    // In a real implementation, this would:
    // 1. Convert the query to embeddings using an LLM
    // 2. Perform vector similarity search in a vector database
    // 3. Rank results by relevance
    // 4. Generate contextual summary using LLM

    const results: SearchResult[] = [];

    // Search through all documents or specified ones
    const documentsToSearch = documentIds && documentIds.length > 0 
      ? mockDocumentContent.filter(doc => documentIds.includes(doc.id))
      : mockDocumentContent;

    documentsToSearch.forEach(document => {
      document.content.forEach((excerpt, index) => {
        const score = calculateRelevanceScore(query, excerpt);
        
        // Only include results with reasonable relevance
        if (score > 0.1) {
          results.push({
            documentId: document.id,
            filename: document.filename,
            excerpt: excerpt,
            relevanceScore: score,
            pageNumber: index + 1
          });
        }
      });
    });

    // Sort by relevance score (highest first)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit to top 10 results
    const topResults = results.slice(0, 10);

    const response: SearchResponse = {
      success: true,
      query: query,
      results: topResults,
      summary: generateSummary(query, topResults)
    };

    // Simulate processing delay for realistic feel
    setTimeout(() => {
      res.json(response);
    }, 1000);

  } catch (error) {
    console.error('Search error:', error);
    const response: SearchResponse = {
      success: false,
      query: req.body.query || '',
      results: [],
      error: 'Search processing failed'
    };
    res.status(500).json(response);
  }
};
