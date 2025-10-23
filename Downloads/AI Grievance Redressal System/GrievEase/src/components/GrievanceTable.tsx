import React, { useState } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { CheckCircle, MessageCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface Grievance {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: string;
  status: string;
  userName: string;
  userEmail: string | null;
  createdAt: string;
  comments?: any[];
}

interface GrievanceTableProps {
  grievances: Grievance[];
  isAdmin?: boolean;
  onUpdate?: () => void;
}

export function GrievanceTable({ grievances, isAdmin = false, onUpdate }: GrievanceTableProps) {
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (grievanceId: string, newStatus: string) => {
    setStatusLoading(grievanceId);
    try {
      await api.updateStatus(grievanceId, newStatus);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleAddComment = async () => {
    if (!selectedGrievance || !comment.trim()) return;

    setCommentLoading(true);
    try {
      await api.addComment(selectedGrievance.id, comment);
      setComment('');
      setCommentModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const openCommentModal = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setCommentModalOpen(true);
  };

  if (grievances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No grievances found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grievances.map((grievance) => (
              <TableRow key={grievance.id}>
                <TableCell className="font-mono text-xs">
                  {grievance.id.slice(0, 8)}...
                </TableCell>
                <TableCell className="max-w-xs">
                  <div>
                    <p>{grievance.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {grievance.description}
                    </p>
                  </div>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div>
                      <p>{grievance.userName}</p>
                      {grievance.userEmail && (
                        <p className="text-xs text-muted-foreground">{grievance.userEmail}</p>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{grievance.department}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(grievance.priority)}>
                    {grievance.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Select
                      value={grievance.status}
                      onValueChange={(value) => handleStatusChange(grievance.id, value)}
                      disabled={statusLoading === grievance.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(grievance.status)}>
                      {grievance.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(grievance.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openCommentModal(grievance)}
                    className="relative"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {grievance.comments && grievance.comments.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {grievance.comments.length}
                      </span>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Comment Modal */}
      <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAdmin ? 'Add Comment' : 'View Comments'}
            </DialogTitle>
            <DialogDescription>
              {isAdmin 
                ? 'Add a comment or update to this grievance' 
                : 'View all comments and updates on your grievance'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Grievance</Label>
              <p className="text-sm">{selectedGrievance?.title}</p>
              <p className="text-xs text-muted-foreground">{selectedGrievance?.description}</p>
            </div>
            
            {selectedGrievance?.comments && selectedGrievance.comments.length > 0 && (
              <div className="space-y-2">
                <Label>Comments & Updates</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedGrievance.comments.map((c) => (
                    <div key={c.id} className={`p-3 rounded-lg ${c.isAdmin || c.userRole === 'admin' || c.userRole === 'hod' ? 'bg-blue-50 border border-blue-200' : 'bg-muted'}`}>
                      <p className="text-sm">{c.text}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{c.userName}</span>
                        {(c.isAdmin || c.userRole === 'admin' || c.userRole === 'hod') && (
                          <Badge variant="outline" className="text-xs py-0">
                            {c.userRole === 'hod' ? 'HOD' : 'Admin'}
                          </Badge>
                        )}
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="comment">Add New Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter your comment..."
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentModalOpen(false)}>
              {isAdmin ? 'Cancel' : 'Close'}
            </Button>
            {isAdmin && (
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim() || commentLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {commentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Comment'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
