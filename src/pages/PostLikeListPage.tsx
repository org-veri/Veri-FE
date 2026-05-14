import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail } from '../api/communityApi';
import type { AuthorInfo } from '../api/communityApi';
import PostLikeListPanel, {
  type PostLikeListMemberView,
  type LikeMemberRelation,
} from '../components/CommunityPostDetailPage/PostLikeListPanel';
import Toast from '../components/Toast';
import { FullPageErrorState } from '../components/FullPageErrorState';
import '../styles/layout.css';
import '../styles/components/headers.css';
import './PostLikeListPage.css';

function mapMembersToView(members: AuthorInfo[] | undefined): PostLikeListMemberView[] {
  if (!members?.length) return [];
  return members.map((m, i) => ({
    ...m,
    relation: (i % 2 === 0 ? 'request_friend' : 'mutual') satisfies LikeMemberRelation,
  }));
}

function PostLikeListPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [likeCount, setLikeCount] = useState(0);
  const [members, setMembers] = useState<PostLikeListMemberView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  const load = useCallback(async () => {
    if (!postId) {
      setError('게시글 ID가 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getPostDetail(parseInt(postId, 10));
      if (res.isSuccess && res.result) {
        const p = res.result;
        setLikeCount(p.likeCount);
        const raw = p.likedMembers;
        setMembers(mapMembersToView(raw));
      } else {
        setError(res.message || '게시글을 불러오지 못했습니다.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBack = () => navigate(-1);

  const handlePillPress = (_member: PostLikeListMemberView) => {
    setToast({
      message: '친구 기능은 준비 중입니다.',
      type: 'info',
      isVisible: true,
    });
  };

  if (loading) {
    return (
      <div className="page-container post-like-list-page">
        <div className="loading-page-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <FullPageErrorState
        title="불러오기 실패"
        message={error}
        primaryAction={{ label: '다시 시도', onClick: () => void load() }}
        secondaryAction={{ label: '돌아가기', onClick: handleBack }}
      />
    );
  }

  return (
    <div className="page-container post-like-list-page">
      <header className="post-like-list-page__header">
        <button type="button" className="post-like-list-page__back" onClick={handleBack} aria-label="뒤로">
          <span className="mgc_left_fill" aria-hidden />
        </button>
        <h1 className="post-like-list-page__title">좋아요 목록</h1>
        <span className="post-like-list-page__header-trail" aria-hidden />
      </header>

      <main className="post-like-list-page__main">
        <PostLikeListPanel
          likeCount={likeCount}
          members={members}
          emptyMessage={
            likeCount > 0 && members.length === 0
              ? '좋아요한 멤버 목록을 불러오지 못했습니다.'
              : undefined
          }
          onPillPress={handlePillPress}
        />
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default PostLikeListPage;
