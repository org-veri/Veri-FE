import type { Comment } from '../../api/communityApi';
import './CommentItem.css';

interface CommentItemProps {
  comment: Comment;
  index: number;
  editingCommentId: number | null;
  editingContent: string;
  onEditContentChange: (content: string) => void;
  onEditComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
  onUpdateComment: (commentId: number) => void;
  onCancelEdit: () => void;
  formatDate: (dateString: string) => string;
  onReply?: (commentId: number) => void;
  isReply?: boolean;
  replyingToCommentId?: number | null;
  replyContent?: string;
  onReplyContentChange?: (content: string) => void;
  onSubmitReply?: (parentCommentId: number) => void;
  onCancelReply?: () => void;
}

function CommentItem({
  comment,
  index,
  editingCommentId,
  editingContent,
  onEditContentChange,
  onEditComment,
  onDeleteComment,
  onUpdateComment,
  onCancelEdit,
  formatDate,
  onReply,
  isReply = false,
  replyingToCommentId,
  replyContent = '',
  onReplyContentChange,
  onSubmitReply,
  onCancelReply
}: CommentItemProps) {
  return (
    <div className="comment-item-container">
      {isReply && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 10H0.75V10.25H1V10ZM11.1768 10.1768C11.2744 10.0791 11.2744 9.92085 11.1768 9.82322L9.58579 8.23223C9.48816 8.1346 9.32986 8.1346 9.23223 8.23223C9.1346 8.32986 9.1346 8.48816 9.23223 8.58579L10.6464 10L9.23223 11.4142C9.1346 11.5118 9.1346 11.6701 9.23223 11.7678C9.32986 11.8654 9.48816 11.8654 9.58579 11.7678L11.1768 10.1768ZM1 0H0.75V10H1H1.25V0H1ZM1 10V10.25H11V10V9.75H1V10Z" fill="#6A717B" />
        </svg>

      )}
      <div className={`comment-item ${isReply ? 'is-reply' : ''}`}>
        <div key={comment.commentId || `deleted-${index}`}>
          <div className="comment-header">
            <div className="comment-author-info">
              {comment.author && (
                <>
                  <div className="comment-author-avatar">
                    <img
                      src={comment.author.profileImageUrl}
                      alt={comment.author.nickname}
                      onError={(e) => {
                        e.currentTarget.src = '/images/profileSample/sample_user.png';
                      }}
                    />
                  </div>
                  <div className="comment-author">{comment.author.nickname}</div>
                </>
              )}
              {comment.isDeleted && (
                <>
                  <div className="comment-author-avatar deleted">
                  </div>
                  <div className="comment-author deleted">삭제된 사용자</div>
                </>
              )}
            </div>
            <div className="comment-actions">
              {!comment.isDeleted && comment.commentId && comment.isMine && (
                <>
                  <button
                    className="comment-action-btn"
                    onClick={() => onEditComment(comment.commentId!, comment.content)}
                  >
                    수정
                  </button>
                  <button
                    className="comment-action-btn delete"
                    onClick={() => onDeleteComment(comment.commentId!)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>

          {!comment.isDeleted && editingCommentId === comment.commentId ? (
            <div className="comment-edit-form">
              <input
                type="text"
                value={editingContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className="comment-edit-input"
                autoFocus
              />
              <div className="comment-edit-buttons">
                <button
                  className="comment-edit-btn cancel"
                  onClick={onCancelEdit}
                >
                  취소
                </button>
                <button
                  className="comment-edit-btn save"
                  onClick={() => onUpdateComment(comment.commentId!)}
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`comment-content ${comment.isDeleted ? 'deleted' : ''}`}>
                {comment.isDeleted ? '삭제된 댓글입니다.' : comment.content}
              </div>
              <div className="comment-footer">
                <div className={`comment-date ${comment.isDeleted ? 'deleted' : ''}`}>
                  {formatDate(comment.createdAt)}
                </div>
                {!comment.isDeleted && !isReply && onReply && comment.commentId && (
                  <button
                    className="reply-btn"
                    onClick={() => onReply(comment.commentId!)}
                  >
                    답글 달기
                  </button>
                )}
              </div>
            </>
          )}

          {!isReply && !comment.isDeleted && replyingToCommentId === comment.commentId && (
            <div className="reply-input-form">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => onReplyContentChange?.(e.target.value)}
                placeholder="답글을 입력해 주세요"
                className="reply-input"
                autoFocus
              />
              <div className="reply-input-buttons">
                <button
                  className="reply-input-btn cancel"
                  onClick={onCancelReply}
                >
                  취소
                </button>
                <button
                  className="reply-input-btn submit"
                  onClick={() => onSubmitReply?.(comment.commentId!)}
                  disabled={!replyContent.trim()}
                >
                  등록
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="replies-container">
              {comment.replies.map((reply, replyIndex) => (
                <CommentItem
                  key={reply.commentId || `reply-${replyIndex}`}
                  comment={reply}
                  index={replyIndex}
                  editingCommentId={editingCommentId}
                  editingContent={editingContent}
                  onEditContentChange={onEditContentChange}
                  onEditComment={onEditComment}
                  onDeleteComment={onDeleteComment}
                  onUpdateComment={onUpdateComment}
                  onCancelEdit={onCancelEdit}
                  formatDate={formatDate}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentItem;

