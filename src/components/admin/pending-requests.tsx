import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Check, X, FileText, Eye } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import userAvatar1 from "@/assets/user-avatar-1.jpg"
import userAvatar2 from "@/assets/user-avatar-2.jpg"
import documentPreview1 from "@/assets/document-preview-1.jpg"
import documentPreview2 from "@/assets/document-preview-2.jpg"
import axios from 'axios';
import { useEffect } from 'react';

interface PendingRequest {
  id: string;
  userEmail: string;
  userAvatar: string;
  documentTitle: string;
  documentPreview: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'denied';
  participationId: string;
}

export function PendingRequests() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const { toast } = useToast();

  // Fetch participation requests from backend
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/participations`);
      const participations = response.data.participations || [];
      const mapped = participations.map((p: any) => ({
        id: p._id,
        participationId: p._id,
        userEmail: p.user?.email || 'Unknown',
        userAvatar: p.user?.profileImage || '',
        documentTitle: p.prizeTitle,
        documentPreview: p.receiptUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${p.receiptUrl}` : p.receiptUrl,
        submittedAt: p.createdAt,
        status: p.submittedButton === true ? 'approved' : (p.submittedButton === false ? 'denied' : 'pending'),
      }));
      setRequests(mapped);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch participation requests.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/participations/${requestId}/approve`);
      await fetchRequests();
      toast({
        title: 'Request Approved',
        description: 'The user submission has been approved successfully.',
      });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to approve request.', variant: 'destructive' });
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/participations/${requestId}/reject`);
      await fetchRequests();
      toast({
        title: 'Request Denied',
        description: 'The user submission has been denied.',
        variant: 'destructive',
      });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to deny request.', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Pending Requests
        </CardTitle>
        <CardDescription>
          Review and approve user submitted documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.userAvatar} alt={request.userEmail} />
                <AvatarFallback>
                  {request.userEmail.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{request.userEmail}</p>
                  <Badge 
                    variant={
                      request.status === 'pending' ? 'secondary' :
                      request.status === 'approved' ? 'default' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {request.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {request.documentTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDate(request.submittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={request.documentPreview}
                  alt="Document preview"
                  className="w-16 h-12 object-cover rounded border border-border"
                />
              </div>
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Photo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-lg font-semibold">{request.documentTitle}</h3>
                        <img
                          src={request.documentPreview}
                          alt={request.documentTitle}
                          className="max-w-full max-h-[70vh] object-contain rounded-lg border border-border"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(request.id)}
                    className="h-8 px-3"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeny(request.id)}
                    className="h-8 px-3"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Deny
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {requests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests at the moment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}