import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentMetadata, UploadDocumentResponse } from '@shared/api';

interface UploadedFile extends File {
  id: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  error?: string;
}

export const DocumentUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    const uploadFiles: UploadedFile[] = validFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...uploadFiles]);

    // Simulate upload progress for each file
    uploadFiles.forEach(file => {
      uploadFile(file);
    });
  };

  const uploadFile = async (file: UploadedFile) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      }

      // Change to processing status
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing', progress: 100 } : f
      ));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock API call
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result: UploadDocumentResponse = await response.json();
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'ready' } : f
        ));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.status === 'uploading') return <Loader className="h-4 w-4 animate-spin" />;
    if (file.status === 'processing') return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
    if (file.status === 'ready') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (file.status === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <File className="h-4 w-4" />;
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload policy documents, contracts, emails, or any text-based files. Supported formats: PDF, DOC, DOCX, TXT (Max 10MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={cn("h-12 w-12 mx-auto mb-4", isDragOver ? "text-primary" : "text-muted-foreground")} />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-muted-foreground">
              or click to browse files
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Uploaded Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          file.status === 'ready' ? 'default' :
                          file.status === 'error' ? 'destructive' :
                          'secondary'
                        }>
                          {file.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{getFileSize(file.size)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1" />
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {files.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">{files.filter(f => f.status === 'ready').length}</span> of{' '}
              <span className="font-medium">{files.length}</span> files processed successfully
            </div>
            {files.filter(f => f.status === 'ready').length > 0 && (
              <Button variant="outline" size="sm">
                View All Documents
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
