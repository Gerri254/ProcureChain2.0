'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

interface Comment {
  _id: string;
  user?: {
    full_name: string;
    role: string;
  };
  user_name?: string;
  content: string;
  created_at: string;
  updated_at: string;
  edited: boolean;
  anonymous?: boolean;
}

interface CommentsSectionProps {
  procurementId: string;
}

export function CommentsSection({ procurementId }: CommentsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [postAsAnonymous, setPostAsAnonymous] = useState(false);

  useEffect(() => {
    loadComments();
  }, [procurementId]);

  const loadComments = async () => {
    try {
      const response = await api.getProcurementComments(procurementId);
      if (response.success && response.data) {
        setComments(response.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // If not authenticated and no name provided, show error
    if (!isAuthenticated && !anonymousName.trim()) {
      alert('Please provide your name or log in to comment');
      return;
    }

    setSubmitting(true);
    try {
      const commentData: any = {
        procurement_id: procurementId,
        content: newComment.trim()
      };

      // Add name if posting anonymously or not authenticated
      if (!isAuthenticated || postAsAnonymous) {
        commentData.name = isAuthenticated ? 'Anonymous' : anonymousName.trim();
        commentData.anonymous = true;
      }

      const response = await api.createComment(commentData);

      if (response.success) {
        setNewComment('');
        setAnonymousName('');
        setPostAsAnonymous(false);
        loadComments(); // Reload to get the new comment with user info
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await api.updateComment(commentId, editContent.trim());
      if (response.success) {
        setEditingId(null);
        setEditContent('');
        loadComments();
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await api.deleteComment(commentId);
      if (response.success) {
        loadComments();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          {/* Name field for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mb-3">
              <input
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                placeholder="Your name (required)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            rows={3}
            className="w-full mb-2"
          />

          {/* Anonymous checkbox for authenticated users */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="postAnonymous"
                checked={postAsAnonymous}
                onChange={(e) => setPostAsAnonymous(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="postAnonymous" className="text-sm text-gray-700">
                Post anonymously
              </label>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !newComment.trim()}
            size="sm"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">
                      {comment.user_name || comment.user?.full_name || 'Anonymous'}
                    </span>
                    {comment.user?.role && (
                      <span className="ml-2 text-sm text-gray-500">
                        {comment.user.role}
                      </span>
                    )}
                    {comment.anonymous && (
                      <span className="ml-2 text-xs text-gray-400 italic">
                        (Anonymous)
                      </span>
                    )}
                    <span className="ml-2 text-sm text-gray-400">
                      {formatDate(comment.created_at)}
                      {comment.edited && ' (edited)'}
                    </span>
                  </div>

                  {/* Edit/Delete buttons for comment owner or admin */}
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {editingId === comment._id ? (
                  <div className="mt-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full mb-2"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(comment._id)}
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
