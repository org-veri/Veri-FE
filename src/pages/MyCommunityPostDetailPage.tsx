import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPostDetail,
  deletePost,
  publishPost,
  unpublishPost,
  likePost,
  unlikePost,
} from '../api/community/postApi';
import type { PostDetail, Comment } from '../api/types/community';
import {
  createComment,
  deleteComment,
  updateComment,
  createReply,
} from '../api/community/commentApi';
import { getCurrentUserId } from '../api/auth/authApi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ConfirmationModal from '../components/ConfirmationModal';
import CommentList from '../components/CommunityPostDetailPage/CommentList';
import CommentInput from '../components/CommunityPostDetailPage/CommentInput';
import Toast from '../components/Toast';
import '../styles/components/headers.css';
import './MyCommunityPostDetailPage.css';
import { FullPageErrorState } from '../components/FullPageErrorState';
import { PATH } from '../config/routes';

function MyCommunityPostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  const [isLiking, setIsLiking] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const commentsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addIsMineToComments = (comments: Comment[], currentUserId: number | null): Comment[] => {
    if (!currentUserId) return comments;

    return comments.map(comment => {
      const commentWithIsMine: Comment = {
        ...comment,
        isMine: comment.author?.id === currentUserId
      };

      if (comment.replies && comment.replies.length > 0) {
        commentWithIsMine.replies = addIsMineToComments(comment.replies, currentUserId);
      }

      return commentWithIsMine;
    });
  };

  useEffect(() => {
    const loadPostDetail = async () => {
      if (!postId) {
        setError('게시글 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getPostDetail(parseInt(postId));

        if (response.isSuccess && response.result) {
          const currentUserId = getCurrentUserId();
          const postData = response.result;

          const commentsWithIsMine = addIsMineToComments(postData.comments, currentUserId);

          setPost({
            ...postData,
            comments: commentsWithIsMine
          });
          setIsLiked(postData.isLiked);
          setIsPublic(postData.isPublic !== undefined ? postData.isPublic : true);
        } else {
          throw new Error(response.message || '게시글을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPostDetail();
  }, [postId]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = async () => {
    if (!postId || isLiking || !post) return;

    try {
      setIsLiking(true);

      const response = isLiked ? await unlikePost(parseInt(postId)) : await likePost(parseInt(postId));

      if (response.isSuccess && response.result) {
        setIsLiked(response.result.isLiked);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likeCount: response.result!.likeCount,
              }
            : null
        );
      } else {
        setToast({
          message: response.message || '좋아요 처리에 실패했습니다.',
          type: 'error',
          isVisible: true,
        });
      }
    } catch {
      setToast({
        message: '좋아요 처리 중 오류가 발생했습니다.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const scrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId || submittingComment) return;

    try {
      setSubmittingComment(true);

      const response = await createComment({
        postId: parseInt(postId),
        content: newComment.trim()
      });

      if (response.isSuccess) {
        setNewComment('');
        const updatedPost = await getPostDetail(parseInt(postId));
        if (updatedPost.isSuccess && updatedPost.result) {
          const currentUserId = getCurrentUserId();
          const postData = updatedPost.result;
          const commentsWithIsMine = addIsMineToComments(postData.comments, currentUserId);

          setPost({
            ...postData,
            comments: commentsWithIsMine
          });
        }
      } else {
        setToast({ message: response.message || '댓글 작성에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch {
      setToast({ message: '댓글 작성 중 오류가 발생했습니다.', type: 'error', isVisible: true });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = (commentId: number) => {
    setReplyingToCommentId(commentId);
    setReplyContent('');
  };

  const handleSubmitReply = async (parentCommentId: number) => {
    if (!replyContent.trim() || !postId) return;

    try {
      setSubmittingComment(true);
      const response = await createReply({
        parentCommentId: parentCommentId,
        content: replyContent.trim()
      });

      if (response.isSuccess) {
        setReplyContent('');
        setReplyingToCommentId(null);
        const updatedPost = await getPostDetail(parseInt(postId));
        if (updatedPost.isSuccess && updatedPost.result) {
          const currentUserId = getCurrentUserId();
          const postData = updatedPost.result;
          const commentsWithIsMine = addIsMineToComments(postData.comments, currentUserId);

          setPost({
            ...postData,
            comments: commentsWithIsMine
          });
        }
      } else {
        setToast({ message: response.message || '답글 작성에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch {
      setToast({ message: '답글 작성 중 오류가 발생했습니다.', type: 'error', isVisible: true });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyContent('');
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?') || !postId) return;

    try {
      const response = await deleteComment(commentId);

      if (response.isSuccess) {
        const updatedPost = await getPostDetail(parseInt(postId));
        if (updatedPost.isSuccess && updatedPost.result) {
          const currentUserId = getCurrentUserId();
          const postData = updatedPost.result;
          const commentsWithIsMine = addIsMineToComments(postData.comments, currentUserId);

          setPost({
            ...postData,
            comments: commentsWithIsMine
          });
        }
      } else {
        setToast({ message: response.message || '댓글 삭제에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch {
      setToast({ message: '댓글 삭제 중 오류가 발생했습니다.', type: 'error', isVisible: true });
    }
  };

  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingContent.trim() || !postId) return;

    try {
      const response = await updateComment(commentId, {
        content: editingContent.trim()
      });

      if (response.isSuccess) {
        setEditingCommentId(null);
        setEditingContent('');
        const updatedPost = await getPostDetail(parseInt(postId));
        if (updatedPost.isSuccess && updatedPost.result) {
          const currentUserId = getCurrentUserId();
          const postData = updatedPost.result;
          const commentsWithIsMine = addIsMineToComments(postData.comments, currentUserId);

          setPost({
            ...postData,
            comments: commentsWithIsMine
          });
        }
      } else {
        setToast({ message: response.message || '댓글 수정에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch {
      setToast({ message: '댓글 수정 중 오류가 발생했습니다.', type: 'error', isVisible: true });
    }
  };

  const handleDeletePost = () => {
    if (!post || !post.postId) {
      setToast({ message: '삭제할 게시글 정보가 없습니다.', type: 'error', isVisible: true });
      return;
    }
    setMenuOpen(false);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeletePost = async () => {
    if (!post || !post.postId) {
      setToast({ message: '삭제할 게시글 정보가 없습니다.', type: 'error', isVisible: true });
      setIsDeleteConfirmModalOpen(false);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await deletePost(post.postId);
      if (response.isSuccess) {
        navigate('/community');
      } else {
        setToast({ message: `게시글 삭제에 실패했습니다: ${response.message || '알 수 없는 오류'}`, type: 'error', isVisible: true });
      }
    } catch (err: any) {
      setToast({ message: `게시글 삭제 중 오류가 발생했습니다: ${err.message}`, type: 'error', isVisible: true });
    } finally {
      setIsProcessing(false);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  const handleEditPost = () => {
    if (!post) return;
    setMenuOpen(false);
    navigate(PATH.WRITE_POST, { state: { editPostId: post.postId } });
  };

  const handleSharePost = async () => {
    if (!post) return;
    setMenuOpen(false);
    const url = `${window.location.origin}${PATH.MY_COMMUNITY_POST}/${post.postId}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: post.title,
          text: `${post.author.nickname} 님의 글 — ${post.title}`,
          url,
        });
        setToast({ message: '공유를 완료했습니다.', type: 'success', isVisible: true });
        return;
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setToast({ message: '링크가 클립보드에 복사되었습니다.', type: 'success', isVisible: true });
        return;
      }
    } catch {
      /* fall through */
    }

    setToast({
      message: '클립보드에 복사할 수 없습니다. 링크를 직접 복사해 주세요.',
      type: 'warning',
      isVisible: true,
    });
  };

  const handleToggleVisibility = async () => {
    if (!post || !post.postId || isUpdatingVisibility || isProcessing) {
      return;
    }

    const currentIsPublic = isPublic === true;
    const newVisibility = !currentIsPublic;
    
    setIsUpdatingVisibility(true);

    try {
      const response = newVisibility 
        ? await publishPost(post.postId)
        : await unpublishPost(post.postId);
      
      if (response.isSuccess) {
        setIsPublic(newVisibility);
        setToast({ 
          message: newVisibility ? '게시글이 공개되었습니다.' : '게시글이 비공개되었습니다.', 
          type: 'success', 
          isVisible: true 
        });
      } else {
        let errorMessage = response.message || '게시글 공개 여부 변경에 실패했습니다.';
        if (response.code === 'C1005') {
          errorMessage = '비공개 독서 기록은 공개할 수 없습니다.';
        }
        setToast({ 
          message: errorMessage, 
          type: 'error', 
          isVisible: true 
        });
      }
    } catch (err: any) {
      let errorMessage = err.message || '게시글 공개 여부 변경 중 오류가 발생했습니다.';
      if (err.code === 'C1005') {
        errorMessage = '비공개 독서 기록은 공개할 수 없습니다.';
      }
      
      setToast({ 
        message: errorMessage, 
        type: 'error', 
        isVisible: true 
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${d}`;
  };

  const handleImageSwipe = (direction: 'left' | 'right') => {
    if (!post?.images || post.images.length <= 1) return;

    if (direction === 'left') {
      setCurrentImageIndex((prev) =>
        prev === post.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? post.images.length - 1 : prev - 1
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const endX = touch.clientX;
      const endY = touch.clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          handleImageSwipe('right');
        } else {
          handleImageSwipe('left');
        }
      }

      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };

  if (loading) {
    return (
      <div className="loading-page-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <FullPageErrorState
        title={error ? '게시글을 불러오지 못했습니다' : '게시글을 찾을 수 없습니다'}
        message={error || '게시글을 찾을 수 없습니다.'}
        primaryAction={{ label: '다시 시도', onClick: () => window.location.reload() }}
        secondaryAction={{ label: '돌아가기', onClick: handleBack }}
      />
    );
  }

  const currentUserId = getCurrentUserId();
  const isMyPost = currentUserId !== null && post.author.id === currentUserId;
  const galleryImages = post.images ?? [];

  const commentHasVisibleContent = (c: Comment): boolean => {
    if (!c.isDeleted) return true;
    return (c.replies ?? []).some(commentHasVisibleContent);
  };
  const hasVisibleComments = post.comments.some(commentHasVisibleContent);

  return (
    <div className="page-container mcp-detail">
      <header className="mcp-header">
        <button type="button" className="mcp-header-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <span className="mgc_left_fill" aria-hidden />
        </button>
        <h1 className="mcp-header-title">
          <span className="mcp-header-title-strong">{post.author.nickname}</span>
          <span className="mcp-header-title-suffix"> 님의 글</span>
        </h1>
        <div className="mcp-header-menu-area" ref={menuRef}>
          {isMyPost ? (
            <>
              <button
                type="button"
                className="mcp-header-menu"
                onClick={() => setMenuOpen((prev) => !prev)}
                disabled={isProcessing}
                aria-label="더보기"
              >
                <BsThreeDotsVertical size={22} />
              </button>
              {menuOpen && (
                <div className="header-dropdown-menu mcp-header-dropdown">
                  <div className="menu-item" onClick={handleEditPost}>
                    <span className="mcp-menu-mgc-icon mgc_edit_2_fill" aria-hidden />
                    <span>수정하기</span>
                  </div>
                  <div className="menu-item" onClick={handleDeletePost}>
                    <span className="mcp-menu-mgc-icon mgc_delete_2_fill" aria-hidden />
                    <span>삭제하기</span>
                  </div>
                  <div className="menu-item" onClick={() => void handleSharePost()}>
                    <span className="mcp-menu-mgc-icon mgc_share_forward_fill" aria-hidden />
                    <span>공유하기</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="mcp-header-menu-spacer" aria-hidden />
          )}
        </div>
      </header>

      <div className="mcp-scroll">
        <section className="mcp-hero" aria-label="게시물 이미지">
          <div
            className="mcp-hero-media"
            onTouchStart={galleryImages.length > 0 ? handleTouchStart : undefined}
          >
            {galleryImages.length > 0 ? (
              <img src={galleryImages[currentImageIndex]} alt="" className="mcp-hero-img" />
            ) : (
              <div className="mcp-hero-placeholder">이미지 없음</div>
            )}
            {isMyPost && isPublic !== null && (
              <button
                type="button"
                className={`mcp-visibility-pill ${isPublic ? 'is-public' : 'is-private'}`}
                onClick={handleToggleVisibility}
                disabled={isUpdatingVisibility || isProcessing}
                aria-label={isPublic ? '공개된 게시물' : '비공개된 게시물'}
              >
                <span
                  className={`mcp-visibility-pill-icon ${isPublic === true ? 'mgc_unlock_fill' : 'mgc_lock_fill'}`}
                  aria-hidden
                />
                <span>{isPublic ? '공개된 게시물' : '비공개된 게시물'}</span>
              </button>
            )}
          </div>
          {galleryImages.length > 0 && (
            <div className="mcp-dots" aria-label="이미지 인디케이터">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`mcp-dot ${index === currentImageIndex ? 'is-active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`이미지 ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        <article className="mcp-body">
          <div className="mcp-body-pad">
            <div className="mcp-engagement-row">
              <div className="mcp-engagement-left">
                <div className={`mcp-stat-like-group ${isLiked ? 'is-liked' : ''}`}>
                  <button
                    type="button"
                    className="mcp-stat-btn mcp-stat-btn--like-icon"
                    onClick={handleLike}
                    disabled={isLiking}
                    aria-label="좋아요"
                  >
                    <span className="mgc_heart_fill" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="mcp-stat-btn mcp-stat-btn--like-count"
                    onClick={() => navigate(`${PATH.POST_LIKES}/${post.postId}`)}
                    aria-label="좋아요 목록 보기"
                  >
                    <span className="mcp-stat-count">{post.likeCount}</span>
                  </button>
                </div>
                <button type="button" className="mcp-stat-btn" onClick={scrollToComments} aria-label="댓글 보기">
                  <span className="mgc_chat_3_fill" aria-hidden />
                  <span className="mcp-stat-count">{post.commentCount}</span>
                </button>
              </div>
              <time className="mcp-post-date" dateTime={post.createdAt}>
                {formatPostDate(post.createdAt)}
              </time>
            </div>

            <p className="mcp-lead-title">{post.title}</p>
            <div className="mcp-prose">{post.content}</div>

            {post.book && (
              <div className="mcp-book-row">
                <div className="mcp-book-cover-wrap">
                  <img src={post.book.imageUrl} alt="" className="mcp-book-cover" />
                </div>
                <div className="mcp-book-text">
                  <p className="mcp-book-title">{post.book.title}</p>
                  <p className="mcp-book-author">{post.book.author}</p>
                </div>
              </div>
            )}
          </div>

          <section ref={commentsSectionRef} id="mcp-comments" className="mcp-comments" aria-label="댓글">
            <div className="mcp-comments-head">
              <span className="mcp-comments-head-icon mgc_chat_3_fill" aria-hidden />
              <span className="mcp-comments-label">댓글</span>
              <span className="mcp-comments-count">{post.commentCount}</span>
            </div>
            <div className="mcp-comments-list-wrap">
              {!hasVisibleComments ? (
                <div className="mcp-comments-empty" role="status">
                  <p className="mcp-comments-empty-title">아직 댓글이 없어요</p>
                  <p className="mcp-comments-empty-desc">첫 댓글을 남겨보세요</p>
                </div>
              ) : (
                <CommentList
                  comments={post.comments}
                  editingCommentId={editingCommentId}
                  editingContent={editingContent}
                  onEditContentChange={setEditingContent}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                  onUpdateComment={handleUpdateComment}
                  onCancelEdit={handleCancelEdit}
                  formatDate={formatDate}
                  onReply={handleReply}
                  replyingToCommentId={replyingToCommentId}
                  replyContent={replyContent}
                  onReplyContentChange={setReplyContent}
                  onSubmitReply={handleSubmitReply}
                  onCancelReply={handleCancelReply}
                />
              )}
            </div>
          </section>
        </article>
      </div>

      <div className="app-shell-dock-bottom">
        <CommentInput
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleCommentSubmit}
          isSubmitting={submittingComment}
        />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={confirmDeletePost}
        isLoading={isProcessing}
        question="게시글을 삭제하시겠어요?"
        info="삭제된 게시글은 복구할 수 없어요"
        confirmLabel="삭제하기"
        confirmPendingLabel="삭제 중..."
      />
    </div>
  );
}

export default MyCommunityPostDetailPage; 