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

// Enhanced keyword matching function with semantic understanding
function calculateRelevanceScore(query: string, content: string): number {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();

  // Define semantic keyword groups for better matching
  const semanticGroups = {
    dental: ['dental', 'teeth', 'tooth', 'dentist', 'oral', 'cavity', 'filling'],
    medical: ['medical', 'health', 'insurance', 'coverage', 'treatment', 'doctor', 'hospital'],
    payment: ['payment', 'pay', 'cost', 'fee', 'price', 'invoice', 'billing', 'charge'],
    vacation: ['vacation', 'leave', 'holiday', 'time off', 'pto', 'absence'],
    termination: ['termination', 'terminate', 'end', 'cancel', 'quit', 'fire', 'dismiss'],
    privacy: ['privacy', 'data', 'confidential', 'gdpr', 'personal', 'information'],
    benefits: ['benefits', 'insurance', 'coverage', 'bonus', 'compensation']
  };

  let score = 0;
  let queryWords = queryLower.split(' ').filter(word => word.length > 2);

  // Direct keyword matching
  queryWords.forEach(word => {
    if (contentLower.includes(word)) {
      score += 0.3;
    }
  });

  // Semantic matching
  Object.entries(semanticGroups).forEach(([category, keywords]) => {
    const queryHasCategory = keywords.some(keyword => queryLower.includes(keyword));
    const contentHasCategory = keywords.some(keyword => contentLower.includes(keyword));

    if (queryHasCategory && contentHasCategory) {
      score += 0.5;
    }
  });

  // Exact phrase matching gets highest score
  if (contentLower.includes(queryLower)) {
    score += 0.8;
  }

  // Partial phrase matching
  if (queryWords.length > 1) {
    const queryPhrase = queryWords.join(' ');
    if (contentLower.includes(queryPhrase)) {
      score += 0.6;
    }
  }

  return Math.min(1.0, score);
}

function generateComprehensiveAnswer(query: string, topResult: SearchResult): string {
  const queryLower = query.toLowerCase();

  // Generate a comprehensive answer based on the top result
  const answers = {
    payment: `Based on the document "${topResult.filename}", ${topResult.excerpt}`,
    termination: `According to the policy in "${topResult.filename}", ${topResult.excerpt}`,
    privacy: `The privacy policy states in "${topResult.filename}": ${topResult.excerpt}`,
    benefits: `Regarding benefits, the document "${topResult.filename}" specifies: ${topResult.excerpt}`,
    confidential: `The confidentiality terms in "${topResult.filename}" indicate: ${topResult.excerpt}`,
    default: `Based on the most relevant information found in "${topResult.filename}": ${topResult.excerpt}`
  };

  if (queryLower.includes('payment') || queryLower.includes('cost') || queryLower.includes('fee')) {
    return answers.payment;
  } else if (queryLower.includes('terminate') || queryLower.includes('end') || queryLower.includes('cancel')) {
    return answers.termination;
  } else if (queryLower.includes('privacy') || queryLower.includes('data') || queryLower.includes('gdpr')) {
    return answers.privacy;
  } else if (queryLower.includes('benefit') || queryLower.includes('vacation') || queryLower.includes('insurance')) {
    return answers.benefits;
  } else if (queryLower.includes('confidential') || queryLower.includes('proprietary')) {
    return answers.confidential;
  } else {
    return answers.default;
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

    // Get only the best result
    const bestResult = results[0];

    if (!bestResult) {
      const response: SearchResponse = {
        success: true,
        query: query,
        results: [],
        summary: "I couldn't find any relevant information in your uploaded documents for this query. Please try rephrasing your question or upload more relevant documents."
      };
      return res.json(response);
    }

    const response: SearchResponse = {
      success: true,
      query: query,
      results: [bestResult], // Return only the single best result
      summary: generateComprehensiveAnswer(query, bestResult)
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
