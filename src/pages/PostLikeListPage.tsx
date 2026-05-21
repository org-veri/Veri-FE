import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LikedMemberInfo } from '../api/types/community';
import { getPostDetail } from '../api/community/postApi';
import { followMember, getFollowStatus } from '../api/social/socialApi';
import { getCurrentUserId } from '../api/auth/authApi';
import PostLikeListPanel, {
  type PostLikeListMemberView,
  type LikeMemberRelation,
} from '../components/CommunityPostDetailPage/PostLikeListPanel';
import Toast from '../components/Toast';
import { FullPageErrorState } from '../components/FullPageErrorState';
import '../styles/layout.css';
import '../styles/components/headers.css';
import './PostLikeListPage.css';

function resolveRelation(member: LikedMemberInfo): LikeMemberRelation {
  if (member.mutualFollow) return 'mutual';
  return 'request_friend';
}

async function enrichMembersWithFollowStatus(
  members: LikedMemberInfo[]
): Promise<PostLikeListMemberView[]> {
  const myId = getCurrentUserId();
  const enriched = await Promise.all(
    members.map(async (m) => {
      let mutualFollow = m.mutualFollow;
      let following = m.following;

      if (myId !== null && m.id !== myId && (mutualFollow === undefined || following === undefined)) {
        try {
          const status = await getFollowStatus(m.id);
          if (status.isSuccess && status.result) {
            following = status.result.following;
          }
        } catch {
          // likedMembers 필드만 사용
        }
      }

      const merged: LikedMemberInfo = {
        ...m,
        ...(following !== undefined ? { following } : {}),
        ...(mutualFollow !== undefined ? { mutualFollow } : {}),
      };

      return {
        ...merged,
        relation: resolveRelation(merged),
      };
    })
  );

  return enriched;
}

function PostLikeListPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const currentUserId = getCurrentUserId();
  const [likeCount, setLikeCount] = useState(0);
  const [members, setMembers] = useState<PostLikeListMemberView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoadingId, setFollowLoadingId] = useState<number | null>(null);
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
        const rawMembers = p.likedMembers ?? [];
        const views = rawMembers.length ? await enrichMembersWithFollowStatus(rawMembers) : [];
        setMembers(views);
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

  const handlePillPress = async (member: PostLikeListMemberView) => {
    if (currentUserId !== null && currentUserId === member.id) return;

    if (member.relation === 'mutual' || member.mutualFollow) {
      setToast({ message: '이미 서로 친구예요.', type: 'info', isVisible: true });
      return;
    }

    if (member.following) {
      setToast({ message: '이미 친구 신청을 보냈어요.', type: 'info', isVisible: true });
      return;
    }

    if (followLoadingId === member.id) return;
    setFollowLoadingId(member.id);

    try {
      const res = await followMember(member.id);
      if (res.isSuccess) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id
              ? { ...m, following: true, relation: 'request_friend' as LikeMemberRelation }
              : m
          )
        );
        setToast({ message: '친구 신청을 보냈어요.', type: 'success', isVisible: true });
      } else {
        setToast({ message: res.message || '팔로우에 실패했습니다.', type: 'error', isVisible: true });
      }
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : '팔로우 중 오류가 발생했습니다.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setFollowLoadingId(null);
    }
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
      <header className="detail-header">
        <button
          type="button"
          className="header-left-arrow"
          onClick={handleBack}
          aria-label="뒤로"
        >
          <span className="mgc_left_fill" aria-hidden />
        </button>
        <h3>좋아요 목록</h3>
        <div className="header-right-wrapper" />
      </header>

      <div className="header-margin" />

      <main className="post-like-list-page__main">
        <PostLikeListPanel
          likeCount={likeCount}
          members={members}
          currentUserId={currentUserId}
          followLoadingId={followLoadingId}
          {...(likeCount > 0 && members.length === 0
            ? { emptyMessage: '좋아요한 멤버 목록을 불러오지 못했습니다.' }
            : {})}
          onPillPress={(m) => void handlePillPress(m)}
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
