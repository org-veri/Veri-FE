import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail, deletePost, publishPost, unpublishPost } from '../api/communityApi';
import type { PostDetail, Comment } from '../api/communityApi';
import { createComment, deleteComment, updateComment, createReply } from '../api/communityCommentsApi';
import { getCurrentUserId } from '../api/auth';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CommentList from '../components/CommunityPostDetailPage/CommentList';
import CommentInput from '../components/CommunityPostDetailPage/CommentInput';
import PostActionToggle from '../components/CommunityPostDetailPage/PostActionToggle';
import LikeUsersList from '../components/CommunityPostDetailPage/LikeUsersList';
import Toast from '../components/Toast';
import '../styles/components/post-detail.css';
import '../styles/components/headers.css';
import './MyCommunityPostDetailPage.css';

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
  const [isLikeUsersOpen, setIsLikeUsersOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true); // 댓글은 기본적으로 열려있음
  const [likeUsers, setLikeUsers] = useState<Array<{ id: number; nickname: string; profileImageUrl: string }>>([]);
  const [isLoadingLikeUsers, setIsLoadingLikeUsers] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 댓글에 isMine 필드 추가하는 함수
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

  // 게시글 데이터 로드
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

          // 댓글들에 isMine 추가
          const commentsWithIsMine = addIsMineToComments(postData.comments, currentUserId);

          setPost({
            ...postData,
            comments: commentsWithIsMine
          });
          setIsLiked(postData.isLiked);
          // API 응답에서 isPublic 가져오기 (응답에 포함되어 있다면)
          const responseResult = postData as any;
          setIsPublic(responseResult.isPublic !== undefined ? responseResult.isPublic : true);
        } else {
          throw new Error(response.message || '게시글을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('게시글 상세 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPostDetail();
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLikeToggle = () => {
    // 좋아요 사용자 목록만 토글 (실제 좋아요 기능은 제거)
    if (!isLikeUsersOpen) {
      setIsLikeUsersOpen(true);
      setIsCommentsOpen(false); // 댓글 창 닫기
      loadLikeUsers();
    } else {
      setIsLikeUsersOpen(false);
    }
  };

  const loadLikeUsers = async () => {
    if (!postId || isLoadingLikeUsers) return;

    try {
      setIsLoadingLikeUsers(true);
      // TODO: 실제 API가 추가되면 여기에 좋아요 사용자 목록을 가져오는 API 호출
      // const response = await getLikeUsers(parseInt(postId));
      // if (response.isSuccess && response.result) {
      //   setLikeUsers(response.result.users);
      // }

      // 임시 모의 데이터 (실제 API가 추가되면 제거)
      const mockUsers = Array.from({ length: post?.likeCount || 0 }, (_, i) => ({
        id: i + 1,
        nickname: `사용자${i + 1}`,
        profileImageUrl: ''
      }));
      setLikeUsers(mockUsers);
    } catch (err) {
      console.error('좋아요 사용자 목록 로드 실패:', err);
    } finally {
      setIsLoadingLikeUsers(false);
    }
  };

  const handleCommentToggle = () => {
    setIsCommentsOpen(prev => {
      const newValue = !prev;
      if (newValue) {
        setIsLikeUsersOpen(false); // 댓글 창 열 때 좋아요 창 닫기
      }
      return newValue;
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId || submittingComment) return;

    try {
      setSubmittingComment(true);

      // 일반 댓글 작성
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
    } catch (err) {
      console.error('댓글 작성 실패:', err);
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
    } catch (err) {
      console.error('답글 작성 실패:', err);
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
        // 댓글 삭제 성공 후 게시글 다시 로드
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
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
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
        // 댓글 수정 성공 후 게시글 다시 로드
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
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      setToast({ message: '댓글 수정 중 오류가 발생했습니다.', type: 'error', isVisible: true });
    }
  };

  // 게시글 삭제 핸들러
  const handleDeletePost = () => {
    if (!post || !post.postId) {
      setToast({ message: '삭제할 게시글 정보가 없습니다.', type: 'error', isVisible: true });
      return;
    }
    setMenuOpen(false);
    setIsDeleteConfirmModalOpen(true);
  };

  // 게시글 삭제 확인 핸들러
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
      console.error('게시글 삭제 중 오류 발생:', err);
      setToast({ message: `게시글 삭제 중 오류가 발생했습니다: ${err.message}`, type: 'error', isVisible: true });
    } finally {
      setIsProcessing(false);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  // 게시글 수정 핸들러 (미구현)
  const handleEditPost = () => {
    if (!post) return;
    setMenuOpen(false);
    setToast({ message: '게시글 수정 기능은 준비 중입니다.', type: 'info', isVisible: true });
  };

  // 게시글 공개/비공개 토글 핸들러
  const handleToggleVisibility = async () => {
    if (!post || !post.postId || isUpdatingVisibility || isProcessing) {
      return;
    }

    // 현재 공개 상태를 명확히 확인하고 반대로 토글
    const currentIsPublic = isPublic === true;
    const newVisibility = !currentIsPublic;
    
    setIsUpdatingVisibility(true);

    try {
      const response = newVisibility 
        ? await publishPost(post.postId)
        : await unpublishPost(post.postId);
      
      if (response.isSuccess) {
        // 공개/비공개 성공 후 상태 업데이트
        setIsPublic(newVisibility);
        setToast({ 
          message: newVisibility ? '게시글이 공개되었습니다.' : '게시글이 비공개되었습니다.', 
          type: 'success', 
          isVisible: true 
        });
      } else {
        // 에러 코드에 따른 메시지 처리
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
      console.error('게시글 공개 여부 변경 중 오류 발생:', err);
      
      // 에러 코드에 따른 메시지 처리
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

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  // 이미지 스와이프 핸들러
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

  // 터치 이벤트 핸들러
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

      // 수직 스크롤과 구분하기 위해 수평 이동이 더 클 때만 스와이프 처리
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          handleImageSwipe('right'); // 오른쪽으로 스와이프 (이전 이미지)
        } else {
          handleImageSwipe('left'); // 왼쪽으로 스와이프 (다음 이미지)
        }
      }

      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };

  if (loading || isProcessing) {
    return (
      <div className="loading-page-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="community-post-detail">
        <div className="detail-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="header-title">오류</h1>
        </div>
        <div className="error-content">
          <p>{error || '게시글을 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate(-1)} className="retry-button">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 헤더 */}
      <header className="detail-header">
        <button className="header-left-arrow" onClick={() => navigate(-1)}>
          <span
            className="mgc_left_fill"
          ></span>
        </button>
        <h3>{post.author.nickname} 님의 글</h3>
        <div className="header-right-wrapper">
          {(() => {
            const currentUserId = getCurrentUserId();
            const isMyPost = currentUserId !== null && post.author.id === currentUserId;
            return isMyPost ? (
              <>
                <button
                  className="header-menu-button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  disabled={isProcessing}
                >
                  <BsThreeDotsVertical size={20} color="#333" />
                </button>

                {menuOpen && (
                  <div className="header-dropdown-menu" ref={menuRef}>
                    <div className="menu-item disabled" onClick={handleEditPost}>
                      <FiEdit2 size={16} />
                      <span>수정하기</span>
                    </div>
                    <div className="menu-item" onClick={handleDeletePost}>
                      <FiTrash2 size={16} />
                      <span>삭제하기</span>
                    </div>
                  </div>
                )}
              </>
            ) : null;
          })()}
        </div>
      </header>

      <div className="header-margin"></div>

      <div className="detail-content">
        {/* 메인 이미지 */}
        <div className="main-image-container">
          {post.images && post.images.length > 0 ? (
            <>
              <img
                src={post.images[currentImageIndex]}
                alt="게시물 이미지"
                className="main-image"
                onTouchStart={handleTouchStart}
              />
              {(() => {
                const currentUserId = getCurrentUserId();
                const isMyPost = currentUserId !== null && post.author.id === currentUserId;
                return isMyPost && isPublic !== null ? (
                  <button 
                    className={`post-visibility-toggle ${isPublic === true ? 'public' : 'private'}`}
                    onClick={handleToggleVisibility}
                    disabled={isUpdatingVisibility || isProcessing}
                    aria-label={isPublic === true ? '공개된 게시글' : '비공개된 게시글'}
                  >
                    <span className={isPublic === true ? 'mgc_unlock_fill' : 'mgc_lock_fill'}></span>
                    <span className="visibility-text">
                      {isPublic === true ? '공개된 게시글' : '비공개된 게시글'}
                    </span>
                  </button>
                ) : null;
              })()}
            </>
          ) : (
            <div className="no-image-placeholder-detail">
              <span>이미지 없음</span>
            </div>
          )}
        </div>

        {/* 이미지 개수 표시 점들 */}
        {post.images && post.images.length > 1 && (
          <div className="image-dots">
            {post.images.map((_, index) => (
              <span
                key={index}
                className={`post-detail-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              ></span>
            ))}
          </div>
        )}

        {/* 프로필 및 액션 */}
        <div className="detail-post-info">
          <div className="detail-author-section">
            <div className="detail-author-avatar">
              <img src={post.author.profileImageUrl} alt="프로필" />
            </div>
            <div className="detail-author-details">
              <div className="author-name-detail">{post.author.nickname}</div>
            </div>
          </div>

          {/* 게시물 내용 */}
          <div className="detail-post-content">
            <p className="detail-post-summary">{post.content}</p>
          </div>

          {/* 책 정보 */}
          {post.book && (
            <div className="detail-book-info">
              <img src={post.book.imageUrl} alt="책 표지" className="detail-book-cover" />
              <div className="detail-book-details">
                <div className="community-detail-book-title">{post.book.title}</div>
                <div className="community-detail-book-author">{post.book.author}</div>
              </div>
            </div>
          )}

          <div className="detail-post-footer">
            <div className="detail-post-actions">
              <PostActionToggle
                type="like"
                count={post.likeCount}
                isActive={isLiked}
                isOpen={isLikeUsersOpen}
                onClick={handleLikeToggle}
                disabled={false}
              />
              <PostActionToggle
                type="comment"
                count={post.commentCount}
                isOpen={isCommentsOpen}
                onClick={handleCommentToggle}
              />
            </div>
            <div className="detail-post-date">{formatDate(post.createdAt)}</div>
          </div>
        </div>

        {/* 좋아요 사용자 목록 */}
        {isLikeUsersOpen && (
          <LikeUsersList users={likeUsers} />
        )}

        {/* 댓글 섹션 */}
        {isCommentsOpen && (
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

        {/* 댓글 입력 */}
        {isCommentsOpen && (
          <CommentInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleCommentSubmit}
            isSubmitting={submittingComment}
          />
        )}
      </div>

      {/* Toast 알림 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* 게시글 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={confirmDeletePost}
        isLoading={isProcessing}
        question="게시글을 삭제하시겠어요?"
        info="삭제된 게시글은 복구할 수 없어요"
      />
    </div>
  );
}

export default MyCommunityPostDetailPage; 