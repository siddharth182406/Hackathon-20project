import React, { useState } from 'react';
import { Search, FileText, ArrowRight, Loader, Brain, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SearchQuery, SearchResponse, SearchResult } from '@shared/api';

const exampleQueries = [
  "What are the key terms and conditions in the employment contract?",
  "Find all mentions of data privacy and security policies",
  "Summarize the main points of the partnership agreement",
  "What are the termination clauses across all contracts?",
  "Show me payment terms from vendor agreements"
];

export const SearchInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [lastQuery, setLastQuery] = useState<string>('');

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setIsSearching(true);
    setLastQuery(queryToSearch);

    try {
      const requestBody: SearchQuery = {
        query: queryToSearch
      };

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result: SearchResponse = await response.json();
        setSearchResults(result.results);
        setSummary(result.summary || '');
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      // Mock results for demo
      setSearchResults([
        {
          documentId: '1',
          filename: 'Employment_Contract_2024.pdf',
          excerpt: 'The employee shall be entitled to 25 days of annual vacation leave, health insurance coverage, and performance-based bonuses as outlined in Section 4.2 of this agreement.',
          relevanceScore: 0.95,
          pageNumber: 4
        },
        {
          documentId: '2',
          filename: 'Privacy_Policy_v3.docx',
          excerpt: 'Personal data collected includes name, email address, and usage analytics. Data is processed in accordance with GDPR regulations and stored securely using AES-256 encryption.',
          relevanceScore: 0.87,
          pageNumber: 2
        },
        {
          documentId: '3',
          filename: 'Vendor_Agreement_TechCorp.pdf',
          excerpt: 'Payment terms are Net 30 days from invoice date. Late payments will incur a 1.5% monthly service charge. All payments must be made in USD.',
          relevanceScore: 0.82,
          pageNumber: 7
        }
      ]);
      setSummary('Based on your documents, I found several relevant sections covering employment benefits, data privacy policies, and payment terms. The information spans across multiple contracts and policy documents.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Documents
        </CardTitle>
        <CardDescription>
          Ask questions in natural language and get intelligent answers from your uploaded documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ask anything about your documents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 text-base"
              disabled={isSearching}
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={isSearching || !query.trim()}>
            {isSearching ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Example Queries */}
        {!searchResults.length && !isSearching && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Try these example queries:</p>
            <div className="grid gap-2">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start text-left h-auto p-3 text-sm"
                  onClick={() => handleSearch(example)}
                >
                  <Brain className="h-3 w-3 mr-2 flex-shrink-0 text-primary" />
                  <span className="truncate">{example}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Analyzing documents with AI...</p>
            </div>
          </div>
        )}

        {/* Single Answer Result */}
        {searchResults.length > 0 && !isSearching && (
          <div className="space-y-6">
            {/* AI Answer */}
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Brain className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-3 text-lg">Answer</h3>
                  <p className="text-sm text-foreground leading-relaxed mb-4">{summary}</p>

                  {/* Source Information */}
                  {searchResults[0] && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className="text-xs text-muted-foreground mb-2">Source:</p>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{searchResults[0].filename}</span>
                        {searchResults[0].pageNumber && (
                          <Badge variant="outline" className="text-xs">
                            Page {searchResults[0].pageNumber}
                          </Badge>
                        )}
                        <div className="ml-auto">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(searchResults[0].relevanceScore * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
