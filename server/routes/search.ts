import { RequestHandler } from "express";
import { SearchQuery, SearchResponse, SearchResult } from "@shared/api";

// Mock document content for demonstration
const mockDocumentContent = [
  {
    id: "1",
    filename: "Employment_Contract_2024.pdf",
    content: [
      "The employee shall be entitled to 25 days of annual vacation leave, health insurance coverage including dental and vision, and performance-based bonuses as outlined in Section 4.2 of this agreement.",
      "Termination of employment may occur with 30 days written notice from either party. Severance pay will be calculated based on years of service at 2 weeks per year worked.",
      "Confidentiality obligations continue for 2 years post-employment. Trade secrets and proprietary information must not be disclosed to competitors.",
      "Medical insurance covers 100% of preventive care, 80% of specialist visits, and 70% of hospital stays. Dental coverage includes cleanings, fillings, and major procedures.",
      "Annual salary is $85,000 with quarterly performance reviews. Cost of living adjustments are made annually based on market rates.",
      "Remote work is permitted up to 3 days per week with manager approval. Office attendance required on Mondays and Fridays.",
    ],
  },
  {
    id: "2",
    filename: "Privacy_Policy_v3.docx",
    content: [
      "Personal data collected includes name, email address, phone number, and usage analytics. Data is processed in accordance with GDPR regulations and stored securely using AES-256 encryption.",
      "Users have the right to access, modify, or delete their personal information within 30 days of request. Data retention period is 7 years for compliance purposes.",
      "Third-party integrations are limited to essential services only. No personal data is sold or shared for marketing purposes without explicit consent.",
      "Cookies are used for authentication and user preferences. Analytics cookies can be disabled in browser settings without affecting functionality.",
      "Data breaches will be reported to authorities within 72 hours and users notified within 5 business days of discovery.",
    ],
  },
  {
    id: "3",
    filename: "Vendor_Agreement_TechCorp.pdf",
    content: [
      "Payment terms are Net 30 days from invoice date. Late payments will incur a 1.5% monthly service charge. All payments must be made in USD via wire transfer or ACH.",
      "Service level agreement guarantees 99.9% uptime during business hours (9 AM - 6 PM EST). Downtime compensation is prorated at $500 per hour of interruption.",
      "Either party may terminate this agreement with 90 days written notice. Outstanding payments must be settled within 15 days of termination.",
      "Software licensing fees are $2,500 per month for up to 100 users. Additional users charged at $25 per user per month.",
      "Technical support is available 24/7 via phone and email. Priority support response time is 4 hours for critical issues.",
    ],
  },
  {
    id: "4",
    filename: "Partnership_Agreement_2024.pdf",
    content: [
      "Revenue sharing is split 60/40 between partners based on contribution levels. Quarterly reviews will assess performance metrics and adjust if needed.",
      "Intellectual property developed jointly belongs to both parties equally. Individual IP contributions remain with the originating party.",
      "Dispute resolution follows arbitration procedures outlined in Section 12. Legal costs are shared equally between parties unless gross negligence is proven.",
      "Initial investment required is $50,000 from each partner. Additional capital calls require unanimous agreement.",
      "Partnership may be dissolved with 6 months notice. Asset distribution follows the 60/40 revenue sharing model.",
    ],
  },
  {
    id: "5",
    filename: "Benefits_Handbook_2024.pdf",
    content: [
      "Dental insurance covers 100% of preventive care including cleanings and X-rays. Basic procedures like fillings covered at 80%, major work at 50%.",
      "Vision coverage includes annual eye exams and $300 allowance for frames or contacts. Prescription lenses covered up to $150 per year.",
      "Flexible spending accounts allow pre-tax savings up to $3,050 for medical expenses and $5,000 for dependent care.",
      "401(k) matching is 100% of first 3% and 50% of next 2%. Vesting is immediate for employee contributions, 3 years for company match.",
      "Paid time off accrues at 15 days per year for first 3 years, 20 days for years 4-10, and 25 days after 10 years of service.",
    ],
  },
];

// Enhanced keyword matching function with semantic understanding
function calculateRelevanceScore(query: string, content: string): number {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();

  // Define semantic keyword groups for better matching
  const semanticGroups = {
    dental: [
      "dental",
      "teeth",
      "tooth",
      "dentist",
      "oral",
      "cavity",
      "filling",
    ],
    medical: [
      "medical",
      "health",
      "insurance",
      "coverage",
      "treatment",
      "doctor",
      "hospital",
    ],
    payment: [
      "payment",
      "pay",
      "cost",
      "fee",
      "price",
      "invoice",
      "billing",
      "charge",
    ],
    vacation: ["vacation", "leave", "holiday", "time off", "pto", "absence"],
    termination: [
      "termination",
      "terminate",
      "end",
      "cancel",
      "quit",
      "fire",
      "dismiss",
    ],
    privacy: [
      "privacy",
      "data",
      "confidential",
      "gdpr",
      "personal",
      "information",
    ],
    benefits: ["benefits", "insurance", "coverage", "bonus", "compensation"],
  };

  let score = 0;
  let queryWords = queryLower.split(" ").filter((word) => word.length > 2);

  // Direct keyword matching
  queryWords.forEach((word) => {
    if (contentLower.includes(word)) {
      score += 0.3;
    }
  });

  // Semantic matching
  Object.entries(semanticGroups).forEach(([category, keywords]) => {
    const queryHasCategory = keywords.some((keyword) =>
      queryLower.includes(keyword),
    );
    const contentHasCategory = keywords.some((keyword) =>
      contentLower.includes(keyword),
    );

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
    const queryPhrase = queryWords.join(" ");
    if (contentLower.includes(queryPhrase)) {
      score += 0.6;
    }
  }

  return Math.min(1.0, score);
}

function generateComprehensiveAnswer(
  query: string,
  topResult: SearchResult,
): string {
  const queryLower = query.toLowerCase();

  // More sophisticated answer generation based on query intent
  if (queryLower.includes("dental") || queryLower.includes("teeth")) {
    return `According to the ${topResult.filename}, ${topResult.excerpt} This covers your dental care needs comprehensively.`;
  }

  if (
    queryLower.includes("vacation") ||
    queryLower.includes("time off") ||
    queryLower.includes("pto")
  ) {
    return `Based on the policy outlined in ${topResult.filename}: ${topResult.excerpt} This policy applies to all eligible employees.`;
  }

  if (
    queryLower.includes("salary") ||
    queryLower.includes("pay") ||
    queryLower.includes("compensation")
  ) {
    return `Regarding compensation as specified in ${topResult.filename}: ${topResult.excerpt} This represents the current compensation structure.`;
  }

  if (
    queryLower.includes("remote") ||
    queryLower.includes("work from home") ||
    queryLower.includes("wfh")
  ) {
    return `The remote work policy in ${topResult.filename} states: ${topResult.excerpt} Please coordinate with your manager for implementation.`;
  }

  if (
    queryLower.includes("payment") ||
    queryLower.includes("invoice") ||
    queryLower.includes("billing")
  ) {
    return `Payment terms according to ${topResult.filename}: ${topResult.excerpt} These terms are standard for all transactions.`;
  }

  if (
    queryLower.includes("terminate") ||
    queryLower.includes("end") ||
    queryLower.includes("quit")
  ) {
    return `Termination procedures per ${topResult.filename}: ${topResult.excerpt} Please ensure all requirements are met.`;
  }

  if (
    queryLower.includes("privacy") ||
    queryLower.includes("data") ||
    queryLower.includes("personal information")
  ) {
    return `Privacy policy as detailed in ${topResult.filename}: ${topResult.excerpt} This ensures compliance with data protection regulations.`;
  }

  if (
    queryLower.includes("insurance") ||
    queryLower.includes("medical") ||
    queryLower.includes("health")
  ) {
    return `Health insurance coverage per ${topResult.filename}: ${topResult.excerpt} Contact HR for enrollment details.`;
  }

  if (
    queryLower.includes("401k") ||
    queryLower.includes("retirement") ||
    queryLower.includes("pension")
  ) {
    return `Retirement benefits outlined in ${topResult.filename}: ${topResult.excerpt} Speak with a financial advisor for optimization strategies.`;
  }

  // Default response for other queries
  return `Based on the information found in ${topResult.filename}: ${topResult.excerpt} Please refer to the complete document for additional details.`;
}

export const handleSearch: RequestHandler = (req, res) => {
  try {
    const { query, documents: documentIds }: SearchQuery = req.body;

    if (!query || query.trim().length === 0) {
      const response: SearchResponse = {
        success: false,
        query: query || "",
        results: [],
        error: "Query cannot be empty",
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
    const documentsToSearch =
      documentIds && documentIds.length > 0
        ? mockDocumentContent.filter((doc) => documentIds.includes(doc.id))
        : mockDocumentContent;

    documentsToSearch.forEach((document) => {
      document.content.forEach((excerpt, index) => {
        const score = calculateRelevanceScore(query, excerpt);

        // Only include results with meaningful relevance (higher threshold)
        if (score > 0.3) {
          results.push({
            documentId: document.id,
            filename: document.filename,
            excerpt: excerpt,
            relevanceScore: score,
            pageNumber: index + 1,
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
        summary:
          "I couldn't find any relevant information in your uploaded documents for this query. Please try rephrasing your question or upload more relevant documents.",
      };
      return res.json(response);
    }

    const response: SearchResponse = {
      success: true,
      query: query,
      results: [bestResult], // Return only the single best result
      summary: generateComprehensiveAnswer(query, bestResult),
    };

    // Simulate processing delay for realistic feel
    setTimeout(() => {
      res.json(response);
    }, 1000);
  } catch (error) {
    console.error("Search error:", error);
    const response: SearchResponse = {
      success: false,
      query: req.body.query || "",
      results: [],
      error: "Search processing failed",
    };
    res.status(500).json(response);
  }
};
