import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  followMember,
  getMemberPublicPosts,
  getMemberPublicProfile,
  unfollowMember,
  type MemberPublicProfile,
} from '../api/social/socialApi';
import type { Post } from '../api/types/community';
import { getCurrentUserId } from '../api/auth/authApi';
import { PATH } from '../config/routes';
import sampleUser from '../assets/images/profileSample/sample_user.png';
import { FullPageErrorState } from '../components/FullPageErrorState';
import Toast from '../components/Toast';
import '../styles/layout.css';
import '../styles/components/headers.css';
import './MemberProfilePage.css';

function MemberProfilePage() {
  const navigate = useNavigate();
  const { memberId: memberIdParam } = useParams<{ memberId: string }>();
  const memberId = memberIdParam ? parseInt(memberIdParam, 10) : NaN;

  const [profile, setProfile] = useState<MemberPublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  const loadProfile = useCallback(async () => {
    if (!memberIdParam || Number.isNaN(memberId)) {
      setError('유효하지 않은 프로필입니다.');
      setLoading(false);
      return;
    }

    const myId = getCurrentUserId();
    if (myId !== null && myId === memberId) {
      navigate(PATH.MY_PAGE, { replace: true });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getMemberPublicProfile(memberId);
      if (res.isSuccess && res.result) {
        setProfile(res.result);
        setPostCount(res.result.postCount);
      } else {
        setError(res.message || '프로필을 불러오지 못했습니다.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [memberId, memberIdParam, navigate]);

  const loadPosts = useCallback(async () => {
    if (!memberIdParam || Number.isNaN(memberId)) return;

    setPostsLoading(true);
    try {
      const res = await getMemberPublicPosts(memberId, { page: 1, size: 20, sort: 'newest' });
      if (res.isSuccess && res.result) {
        setPosts(res.result.posts);
        if (typeof res.result.totalElements === 'number') {
          setPostCount(res.result.totalElements);
        }
      }
    } catch {
      // posts section shows empty
    } finally {
      setPostsLoading(false);
    }
  }, [memberId, memberIdParam]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleBack = () => navigate(-1);

  const handleFollowToggle = async () => {
    if (!profile || followLoading) return;

    if (profile.following && profile.followedBy) {
      setToast({ message: '이미 서로 친구예요.', type: 'info', isVisible: true });
      return;
    }

    setFollowLoading(true);
    try {
      if (profile.following) {
        const res = await unfollowMember(memberId);
        if (res.isSuccess) {
          setProfile({
            ...profile,
            following: false,
            followerCount: Math.max(0, profile.followerCount - 1),
          });
          setToast({ message: '팔로우를 취소했어요.', type: 'info', isVisible: true });
        } else {
          setToast({ message: res.message || '팔로우 취소에 실패했습니다.', type: 'error', isVisible: true });
        }
      } else {
        const res = await followMember(memberId);
        if (res.isSuccess) {
          setProfile({
            ...profile,
            following: true,
            followerCount: profile.followerCount + 1,
          });
          setToast({ message: '팔로우했어요.', type: 'success', isVisible: true });
        } else {
          setToast({ message: res.message || '팔로우에 실패했습니다.', type: 'error', isVisible: true });
        }
      }
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : '요청 중 오류가 발생했습니다.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostClick = (postId: number) => {
    navigate(`${PATH.COMMUNITY_POST}/${postId}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}`;
  };

  const truncateContent = (content: string, maxLength = 80): string => {
    if (content.length <= maxLength) return content;
    return `${content.slice(0, maxLength)}...`;
  };

  const getPostImageUrl = (post: Post): string | null => {
    const p = post as Post & { imageUrl?: string; images?: string[] };
    if (p.images?.[0]?.trim()) return p.images[0];
    if (post.thumbnail?.trim()) return post.thumbnail;
    if (p.imageUrl?.trim()) return p.imageUrl;
    return null;
  };

  const getFollowLabel = (): string => {
    if (!profile) return '팔로우';
    if (profile.following && profile.followedBy) return '서로친구';
    if (profile.following) return '팔로잉';
    return '팔로우';
  };

  const getFollowBtnClass = (): string => {
    if (!profile) return 'member-profile-page__follow-btn';
    if (profile.following && profile.followedBy) {
      return 'member-profile-page__follow-btn member-profile-page__follow-btn--mutual';
    }
    if (profile.following) {
      return 'member-profile-page__follow-btn member-profile-page__follow-btn--following';
    }
    return 'member-profile-page__follow-btn';
  };

  const profileImage =
    profile?.image &&
    profile.image.trim() !== '' &&
    profile.image !== 'https://example.com/image.jpg'
      ? profile.image
      : null;

  if (loading) {
    return (
      <div className="page-container member-profile-page">
        <div className="loading-page-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <FullPageErrorState
        title="프로필을 불러오지 못했습니다"
        message={error || '프로필 정보가 없습니다.'}
        primaryAction={{ label: '다시 시도', onClick: () => void loadProfile() }}
        secondaryAction={{ label: '돌아가기', onClick: handleBack }}
      />
    );
  }

  return (
    <div className="page-container member-profile-page">
      <header className="detail-header">
        <button
          type="button"
          className="header-left-arrow"
          onClick={handleBack}
          aria-label="뒤로"
        >
          <span className="mgc_left_fill" aria-hidden />
        </button>
        <h3>
          <span className="member-profile-page__title-strong">{profile.nickname} </span>
          <span className="member-profile-page__title-suffix">님의 프로필</span>
        </h3>
        <div className="header-right-wrapper" />
      </header>

      <div className="header-margin" />

      <div className="member-profile-page__content">
        <section className="member-profile-page__profile">
          <div className="member-profile-page__profile-row">
            <div className="member-profile-page__profile-main">
              <div className="member-profile-page__avatar-wrap">
                {profileImage ? (
                  <img src={profileImage} alt="" className="member-profile-page__avatar-img" />
                ) : (
                  <div
                    className="member-profile-page__avatar-placeholder"
                    style={{ backgroundImage: `url(${sampleUser})` }}
                  />
                )}
              </div>
              <div className="member-profile-page__profile-col">
                <p className="member-profile-page__nickname">{profile.nickname}</p>
                <div className="member-profile-page__social-row">
                  <div className="member-profile-page__social-item">
                    <span className="member-profile-page__social-icon mgc_user_3_line" aria-hidden />
                    <span className="member-profile-page__social-label">친구</span>
                    <span className="member-profile-page__social-value">
                      {profile.followerCount}명
                    </span>
                  </div>
                  <div className="member-profile-page__social-item">
                    <span className="member-profile-page__social-icon mgc_document_line" aria-hidden />
                    <span className="member-profile-page__social-label">글</span>
                    <span className="member-profile-page__social-value">{postCount}개</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={getFollowBtnClass()}
              onClick={() => void handleFollowToggle()}
              disabled={followLoading || (profile.following && profile.followedBy)}
            >
              {followLoading ? '처리 중…' : getFollowLabel()}
            </button>
          </div>
          <div className="member-profile-page__profile-rule" />
        </section>

        <section className="member-profile-page__posts">
          <div className="member-profile-page__posts-head">
            <h2 className="member-profile-page__posts-title">{profile.nickname} 님의 글</h2>
            <span className="member-profile-page__posts-count">{postCount}</span>
          </div>

          {postsLoading ? (
            <div className="member-profile-page__posts-status">게시글을 불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="member-profile-page__posts-empty">
              <p>아직 공개된 글이 없어요.</p>
            </div>
          ) : (
            <ul className="member-profile-page__post-list">
              {posts.map((post) => {
                const imageUrl = getPostImageUrl(post);
                return (
                  <li key={post.postId}>
                    <button
                      type="button"
                      className="member-profile-page__post-card"
                      onClick={() => handlePostClick(post.postId)}
                    >
                      <div className="member-profile-page__post-cover">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" />
                        ) : (
                          <div className="member-profile-page__post-cover-empty">이미지 없음</div>
                        )}
                      </div>
                      <div className="member-profile-page__post-body">
                        <div className="member-profile-page__post-title">{post.title}</div>
                        <p className="member-profile-page__post-excerpt">
                          {truncateContent(post.content)}
                        </p>
                        <div className="member-profile-page__post-meta-row">
                          <div className="member-profile-page__post-book">
                            <span className="mgc_book_6_fill" aria-hidden />
                            <span className="member-profile-page__post-book-title">
                              {post.book?.title ?? '연결된 도서 없음'}
                            </span>
                          </div>
                          <time className="member-profile-page__post-date" dateTime={post.createdAt}>
                            {formatDate(post.createdAt)}
                          </time>
                        </div>
                        <div className="member-profile-page__post-stats">
                          <span className="member-profile-page__post-stat">
                            <span className="mgc_heart_line" aria-hidden />
                            {post.likeCount}
                          </span>
                          <span className="member-profile-page__post-stat">
                            <span className="mgc_chat_3_line" aria-hidden />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="main-page-margin" />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default MemberProfilePage;
