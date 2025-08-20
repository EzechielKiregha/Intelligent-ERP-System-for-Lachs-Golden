// app/settings/components/UserDocumentManagement.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/generated/prisma';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText as FileTextIcon, Loader2, Download, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserDocumentManagementProps {
  user: User;
}

export default function UserDocumentManagement({ user }: UserDocumentManagementProps) {
  // Fetch documents
  const { data: documents = [], isLoading: isDocumentsLoading } = useQuery({
    queryKey: ['documents', 'user', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/hr/documents?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
    enabled: !!user.id
  });

  const handleDownload = (documentId: string) => {
    // In a real implementation, this would trigger a file download
    toast.success('Document download started');
    console.log(`Downloading document ${documentId}`);
  };

  const handleDelete = (documentId: string, documentName: string) => {
    if (confirm(`Are you sure you want to delete "${documentName}"? This action cannot be undone.`)) {
      // In a real implementation, this would delete the document
      toast.success('Document deleted successfully');
      console.log(`Deleting document ${documentId}`);
    }
  };

  return (
    <div className="space-y-6">
      {isDocumentsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-sidebar-accent" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-6 text-center text-sidebar-foreground/70">
            <FileTextIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No documents uploaded for this user</p>
            <p className="text-sm mt-1">Documents such as contracts, IDs, and certifications will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-sidebar border-[var(--sidebar-border)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sidebar-foreground">Uploaded Documents</CardTitle>
                <Badge variant="secondary" className="px-3 py-1 h-auto">
                  {documents.length} Document{documents.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((document: any) => (
                  <div
                    key={document.id}
                    className="p-3 bg-sidebar-accent/10 rounded border border-sidebar-accent/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <FileTextIcon className="h-4 w-4 text-sidebar-accent mr-2 flex-shrink-0" />
                        <h3 className="font-medium text-sidebar-foreground truncate">
                          {document.title}
                        </h3>
                      </div>
                      {document.description && (
                        <p className="text-sm text-sidebar-foreground/70 mt-1 line-clamp-1">
                          {document.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs px-2 py-0.5 h-auto">
                          {document.documentType || 'General'}
                        </Badge>
                        <span className="text-xs text-sidebar-foreground/50">
                          Uploaded {format(new Date(document.uploadedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownload(document.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          // In a real implementation, this would open a preview
                          toast.info('Document preview coming soon');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(document.id, document.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-sidebar border-[var(--sidebar-border)]">
            <CardHeader>
              <CardTitle className="text-sidebar-foreground">Document Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sidebar-foreground">Required Documents</h4>
                      <ul className="list-disc list-inside text-sm text-sidebar-foreground/70 mt-2 space-y-1">
                        <li>Government-issued ID (Passport, Driver's License)</li>
                        <li>Employment contract</li>
                        <li>Bank account details for payroll</li>
                        <li>Tax identification document</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                  <h4 className="font-medium text-sidebar-foreground mb-2">Document Policy</h4>
                  <ul className="list-disc list-inside text-sm text-sidebar-foreground/70 space-y-1">
                    <li>All documents must be uploaded in PDF format</li>
                    <li>Documents should not exceed 10MB in size</li>
                    <li>Personal information will be encrypted and secured</li>
                    <li>Documents are accessible only to authorized HR personnel</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}