import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';
import { getMemberProfile, type GetMemberProfileResponse, type MemberProfile } from '../api/memberApi';
import { getMyPosts, type Post } from '../api/communityApi';
import sampleUser from '../assets/images/profileSample/sample_user.png';
import { FullPageErrorState } from '../components/FullPageErrorState';

interface UserData {
  email: string;
  nickname: string;
  numOfReadBook: number;
  numOfCard: number;
  profileImageUrl: string | null;
  followerCount: number;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myPostsTotalCount, setMyPostsTotalCount] = useState<number | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response: GetMemberProfileResponse = await getMemberProfile();

        if (response.isSuccess && response.result) {
          const apiResult: MemberProfile = response.result;
          setUserData({
            email: apiResult.email,
            nickname: apiResult.nickname,
            numOfReadBook: apiResult.numOfReadBook,
            numOfCard: apiResult.numOfCard,
            profileImageUrl:
              apiResult.image &&
              apiResult.image.trim() !== '' &&
              apiResult.image !== 'https://example.com/image.jpg'
                ? apiResult.image
                : null,
            followerCount: apiResult.followerCount ?? 0,
          });
        } else {
          setError(response.message || '사용자 데이터를 불러오는 데 실패했습니다.');
        }
      } catch {
        setError('사용자 데이터를 불러오는 중 네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchMyPosts = async () => {
      setIsLoadingPosts(true);
      setPostsError(null);

      try {
        const response = await getMyPosts();

        if (response.isSuccess && response.result) {
          const { posts, count } = response.result;
          setMyPosts(posts);
          setMyPostsTotalCount(typeof count === 'number' ? count : posts.length);
        } else {
          setPostsError(response.message || '게시글을 불러오는 데 실패했습니다.');
        }
      } catch {
        setPostsError('게시글을 불러오는 중 네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchMyPosts();
  }, []);

  const goToEditMyName = () => {
    navigate('/edit-my-name');
  };

  const handleWritePost = () => {
    navigate('/write-post');
  };

  const handlePostClick = (postId: number) => {
    navigate(`/my-community/post/${postId}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}`;
  };

  const truncateContent = (content: string, maxLength: number = 80): string => {
    if (content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)}...`;
  };

  const getPostImageUrl = (post: Post): string | null => {
    const p = post as Post & { imageUrl?: string; cardImage?: string; images?: string[] };
    const firstImage = p.images?.[0];
    if (firstImage && firstImage.trim() !== '') return firstImage;
    if (post.thumbnail && post.thumbnail.trim() !== '') return post.thumbnail;
    if (p.imageUrl && p.imageUrl.trim() !== '') return p.imageUrl;
    if (p.cardImage && p.cardImage.trim() !== '') return p.cardImage;
    return null;
  };

  if (isLoading) {
    return (
      <div className="loading-page-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <FullPageErrorState
        title="프로필을 불러오지 못했습니다"
        message={error}
        primaryAction={{
          label: '다시 시도',
          onClick: () => window.location.reload(),
        }}
        secondaryAction={{
          label: '홈으로',
          onClick: () => navigate('/'),
        }}
      />
    );
  }

  if (!userData) {
    return (
      <FullPageErrorState
        title="표시할 정보가 없습니다"
        message="사용자 데이터를 찾을 수 없습니다."
        secondaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
      />
    );
  }

  const postCount = myPostsTotalCount ?? myPosts.length;

  return (
    <div className="page-container my-page">
      <header className="my-page-top-bar">
        <button type="button" className="my-page-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <span className="mgc_left_fill" aria-hidden />
        </button>
        <h1 className="my-page-top-title">마이페이지</h1>
        <span className="my-page-top-spacer" aria-hidden />
      </header>

      <div className="my-page-content">
        <section className="my-page-profile">
          <div className="my-page-profile-row">
            <div className="my-page-profile-main">
              <div className="my-page-avatar-wrap">
                {userData.profileImageUrl ? (
                  <img src={userData.profileImageUrl} className="my-page-avatar-img" alt="" />
                ) : (
                  <div
                    className="my-page-avatar-placeholder"
                    style={{ backgroundImage: `url(${sampleUser})` }}
                  />
                )}
              </div>
              <div className="my-page-profile-col">
                <div className="my-page-profile-info">
                  <p className="my-page-nickname">{userData.nickname}</p>
                  <div className="my-page-social-row">
                  <div className="my-page-social-item">
                    <span className="my-page-social-icon mgc_user_3_line" aria-hidden />
                    <span className="my-page-social-label">친구</span>
                    <span className="my-page-social-value">{userData.followerCount}명</span>
                  </div>
                  <div className="my-page-social-item">
                    <span className="my-page-social-icon mgc_document_line" aria-hidden />
                    <span className="my-page-social-label">글</span>
                    <span className="my-page-social-value">{postCount}개</span>
                  </div>
                </div>
                </div>
                <div className="my-page-stat-chip">
                  <div className="my-page-stat-chip-part">
                    <span className="my-page-stat-icon mgc_book_3_fill" aria-hidden />
                    <span className="my-page-stat-num">{userData.numOfReadBook}</span>
                    <span className="my-page-stat-unit">권</span>
                  </div>
                  <span className="my-page-stat-divider" />
                  <div className="my-page-stat-chip-part">
                    <span className="my-page-stat-icon mgc_notebook_2_fill" aria-hidden />
                    <span className="my-page-stat-num">{userData.numOfCard}</span>
                    <span className="my-page-stat-unit">장</span>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" className="my-page-profile-edit" onClick={goToEditMyName}>
              프로필 수정
            </button>
          </div>
          <div className="my-page-profile-rule" />
        </section>

        <section className="my-page-posts">
          <div className="my-page-posts-head">
            <div className="my-page-posts-head-left">
              <h2 className="my-page-posts-title">{userData.nickname} 님의 글</h2>
              <span className="my-page-posts-count">{postCount}</span>
            </div>
            <button type="button" className="my-page-record-btn" onClick={handleWritePost}>
              <span className="mgc_add_fill my-page-record-icon" aria-hidden />
              <span>기록하기</span>
            </button>
          </div>

          {isLoadingPosts ? (
            <div className="my-page-posts-status">게시글을 불러오는 중...</div>
          ) : postsError ? (
            <div className="my-page-posts-status my-page-posts-status--error">{postsError}</div>
          ) : myPosts.length === 0 ? (
            <div className="my-page-posts-empty">
              <p>아직 작성한 게시글이 없습니다.</p>
              <p>새로운 독서 기록을 남겨보세요!</p>
            </div>
          ) : (
            <ul className="my-page-post-list">
              {myPosts.map((post) => {
                const imageUrl = getPostImageUrl(post);
                return (
                  <li key={post.postId}>
                    <button
                      type="button"
                      className="my-page-post-card"
                      onClick={() => handlePostClick(post.postId)}
                    >
                      <div className="my-page-post-cover">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="my-page-post-cover-img" />
                        ) : (
                          <div className="my-page-post-cover-empty">이미지 없음</div>
                        )}
                      </div>
                      <div className="my-page-post-body">
                        <div className="my-page-post-title-row">
                          <span className="my-page-post-title">{post.title}</span>
                          <span
                            className={`my-page-post-badge ${post.isPublic ? 'is-public' : 'is-private'}`}
                          >
                            {post.isPublic ? '공개' : '비공개'}
                          </span>
                        </div>
                        <p className="my-page-post-excerpt">{truncateContent(post.content)}</p>
                        <div className="my-page-post-meta-row">
                          <div className="my-page-post-book">
                            <span className="mgc_book_6_fill my-page-post-book-icon" aria-hidden />
                            <span className="my-page-post-book-title">
                              {post.book?.title ?? '연결된 도서 없음'}
                            </span>
                          </div>
                          <time className="my-page-post-date" dateTime={post.createdAt}>
                            {formatDate(post.createdAt)}
                          </time>
                        </div>
                        {post.isPublic && (
                          <div className="my-page-post-stats">
                            <span className="my-page-post-stat">
                              <span className="mgc_heart_line" aria-hidden />
                              {post.likeCount}
                            </span>
                            <span className="my-page-post-stat">
                              <span className="mgc_chat_3_line" aria-hidden />
                              {post.commentCount}
                            </span>
                          </div>
                        )}
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
    </div>
  );
};

export default MyPage;
