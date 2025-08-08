import React, { useState } from 'react';
import { Upload, Search, Brain, FileText, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentUpload } from '@/components/DocumentUpload';
import { SearchInterface } from '@/components/SearchInterface';

const Index = () => {
  const [activeSection, setActiveSection] = useState<'upload' | 'search' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DocuMind AI</h1>
                <p className="text-xs text-muted-foreground">Intelligent Document Retrieval</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Enterprise
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Powered by Advanced LLM Technology
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Transform Your Documents Into Intelligent Knowledge
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload policy documents, contracts, emails, and more. Ask questions in natural language and get precise, contextual answers instantly.
          </p>
          <div className="text-center pt-6">
            <p className="text-lg text-muted-foreground">
              Upload your documents on the left, then ask questions on the right to get instant answers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Document Upload Column */}
            <div>
              <DocumentUpload />
            </div>

            {/* Question/Search Column */}
            <div>
              <SearchInterface />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful AI-Driven Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to unlock insights from your documents</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multi-Format Support</CardTitle>
                <CardDescription>
                  Upload PDFs, Word documents, emails, and more. Our AI processes any text-based document format.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">DOCX</Badge>
                  <Badge variant="outline">TXT</Badge>
                  <Badge variant="outline">EMAIL</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Search className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Natural Language Queries</CardTitle>
                <CardDescription>
                  Ask questions like you would to a human expert. No complex search syntax required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>"What are the key terms in contract X?"</p>
                  <p>"Find all mentions of data privacy policies"</p>
                  <p>"Summarize the main points of this agreement"</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Intelligent Analysis</CardTitle>
                <CardDescription>
                  Get contextual summaries, extract key insights, and understand complex relationships across documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    Context-aware responses
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                    Relevance scoring
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mr-2"></div>
                    Smart summarization
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-12">Trusted by Organizations Worldwide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary">10M+</div>
                <div className="text-muted-foreground">Documents Processed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">&lt;2s</div>
                <div className="text-muted-foreground">Average Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">DocuMind AI</span>
            </div>
            <p className="text-muted-foreground">
              Transforming document intelligence with cutting-edge AI technology.
            </p>
            <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
              © 2024 DocuMind AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
