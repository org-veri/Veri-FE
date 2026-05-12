import type { Comment } from '../../api/communityApi';
import CommentItem from './CommentItem';
import './CommentList.css';

interface CommentListProps {
  comments: Comment[];
  editingCommentId: number | null;
  editingContent: string;
  onEditContentChange: (content: string) => void;
  onEditComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
  onUpdateComment: (commentId: number) => void;
  onCancelEdit: () => void;
  formatDate: (dateString: string) => string;
  onReply?: (commentId: number) => void;
  replyingToCommentId?: number | null;
  replyContent?: string;
  onReplyContentChange?: (content: string) => void;
  onSubmitReply?: (parentCommentId: number) => void;
  onCancelReply?: () => void;
}

function CommentList({
  comments,
  editingCommentId,
  editingContent,
  onEditContentChange,
  onEditComment,
  onDeleteComment,
  onUpdateComment,
  onCancelEdit,
  formatDate,
  onReply,
  replyingToCommentId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply
}: CommentListProps) {
  return (
    <div className="comments-section">
      <div className="comments-list">
        {comments.map((comment, index) => (
          <CommentItem
            key={comment.commentId || `deleted-${index}`}
            comment={comment}
            index={index}
            editingCommentId={editingCommentId}
            editingContent={editingContent}
            onEditContentChange={onEditContentChange}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            onUpdateComment={onUpdateComment}
            onCancelEdit={onCancelEdit}
            formatDate={formatDate}
            {...(onReply && { onReply })}
            {...(replyingToCommentId !== undefined && { replyingToCommentId })}
            {...(replyContent !== undefined && { replyContent })}
            {...(onReplyContentChange && { onReplyContentChange })}
            {...(onSubmitReply && { onSubmitReply })}
            {...(onCancelReply && { onCancelReply })}
          />
        ))}
      </div>
    </div>
  );
}

export default CommentList;

