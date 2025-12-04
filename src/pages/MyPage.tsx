// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';
import { getMemberProfile, type GetMemberProfileResponse, type MemberProfile } from '../api/memberApi';
import { getMyPosts, type Post } from '../api/communityApi';

// 아이콘 import
// import rightLineIcon from '../assets/icons/right_line.svg';
// import scheduleFillIcon from '../assets/icons/schedule_fill.svg';
// import saleFillIcon from '../assets/icons/sale_fill.svg';
import TopBar from '../components/TopBar';

// 이미지 import
import sampleUser from '../assets/images/profileSample/sample_user.png';

interface UserData {
  email: string;
  nickname: string;
  numOfReadBook: number;
  numOfCard: number;
  profileImageUrl: string | null;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
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
            profileImageUrl: apiResult.image &&
              apiResult.image.trim() !== '' &&
              apiResult.image !== 'https://example.com/image.jpg'
              ? apiResult.image
              : null,
          });
        } else {
          setError(response.message || '사용자 데이터를 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
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
          setMyPosts(response.result.posts);
        } else {
          setPostsError(response.message || '게시글을 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        console.error('Error fetching my posts:', err);
        setPostsError('게시글을 불러오는 중 네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleProfileClick = () => {
    console.log('프로필 상세 페이지로 이동');
  };

  // const handleNoticeClick = () => {
  //   console.log('공지사항 페이지로 이동');
  // };

  // const handleEventClick = () => {
  //   console.log('이벤트 페이지로 이동');
  // };

  const goToEditMyName = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/edit-my-name');
  };

  const handleWritePost = () => {
    navigate('/write-post');
  };

  const handlePostClick = (postId: number) => {
    navigate(`/community/post/${postId}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const truncateContent = (content: string, maxLength: number = 100): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 로딩 상태 처리
  if (isLoading) {
    return <div className="loading-page-container">
      <div className="loading-spinner"></div>
    </div>;
  }

  // 에러 상태 처리
  if (error) {
    return <div className="loading-page-container" style={{ color: 'red' }}>{error}</div>;
  }

  // 데이터 없음 상태 처리
  if (!userData) {
    return <div className="loading-page-container">사용자 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="page-container">
      <TopBar/>

      <div className="header-margin" />

      <div className="my-page-profile-section" onClick={handleProfileClick}>
        <div className="profile-left">
          <div className="profile-avatar">
            {userData.profileImageUrl ? (
              <img src={userData.profileImageUrl} className="avatar-image" alt="프로필" />
            ) : (
              <div
                className="avatar-placeholder"
                style={{ backgroundImage: `url(${sampleUser})` }}
              />
            )}
          </div>
          <div className="profile-info">
            <p className="profile-name">{userData.nickname}</p>
            <button type="button" className="icon-button" aria-label="닉네임 수정" onClick={goToEditMyName}>
              <span className="mgc_edit_2_fill"></span>
            </button>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-badge">
            <p className="stat-badge-value">{userData.numOfReadBook}</p>
            <p className="stat-badge-label">읽은 책</p>
          </div>
          <div className="stat-badge">
            <p className="stat-badge-value">{userData.numOfCard}</p>
            <p className="stat-badge-label">독서카드</p>
          </div>
        </div>
      </div>

      <div className="line-divider"> </div>

      {/* 내 게시글 목록 섹션 */}
      <div className="my-posts-section">
        <div className="my-posts-header">
          <div className="my-posts-title-container">
          <h3 className="my-posts-title">
            전체 독서기록
          </h3>
          <span className="my-posts-count">{myPosts.length}</span>
          </div>
          <button className="new-record-button" onClick={handleWritePost}>
            <span className="mgc_add_fill"></span>
            <span>새로 기록하기</span>
          </button>
        </div>

        {isLoadingPosts ? (
          <div className="posts-loading">게시글을 불러오는 중...</div>
        ) : postsError ? (
          <div className="posts-error">{postsError}</div>
        ) : myPosts.length === 0 ? (
          <div className="no-posts-message">
            <p>아직 작성한 게시글이 없습니다.</p>
            <p>새로운 독서 기록을 남겨보세요!</p>
          </div>
        ) : (
          <div className="my-posts-list">
            {myPosts.map((post) => (
              <div
                key={post.postId}
                className="my-post-item"
                onClick={() => handlePostClick(post.postId)}
              >
                {/* 게시글 이미지 */}
                {post.thumbnail && (
                  <div className="my-post-image">
                    <img src={post.thumbnail} alt="게시글 이미지" />
                  </div>
                )}

                {/* 게시글 제목과 공개/비공개 태그 */}
                <div className="my-post-header">
                  <h4 className="my-post-title">{post.title}</h4>
                  <span className={`my-post-visibility ${post.isPublic ? 'public' : 'private'}`}>
                    {post.isPublic ? '공개' : '비공개'}
                  </span>
                </div>

                {/* 게시글 내용 */}
                <div className="my-post-content">
                  <p>{truncateContent(post.content)}</p>
                </div>

                {/* 날짜와 책 정보 */}
                <div className="my-post-meta">
                  <span className="my-post-date">{formatDate(post.createdAt)}</span>
                  {post.book && (
                    <div className="my-post-book">
                      <span className="mgc_book_6_fill"></span>
                      <span className="my-post-book-title">{post.book.title}</span>
                    </div>
                  )}
                </div>

                {/* 좋아요/댓글 수 (공개인 경우만) */}
                {post.isPublic && (
                  <div className="my-post-actions">
                    <div className="my-post-action-item">
                      <span className="mgc_heart_line"></span>
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="my-post-action-item">
                      <span className="mgc_chat_3_line"></span>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='main-page-margin'></div>
    </div>
  );
};

export default MyPage;