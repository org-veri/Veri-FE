import type { Post } from '../../api/communityApi';

export interface CommunityPostItemProps {
  post: Post;
  imageUrl: string | null;
  formattedDate: string;
  onClick: () => void;
  innerRef?: React.Ref<HTMLDivElement | null>;
}

function CommunityPostItem({
  post,
  imageUrl,
  formattedDate,
  onClick,
  innerRef,
}: CommunityPostItemProps) {
  return (
    <div
      ref={innerRef}
      className="community-post-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="community-post-header">
        <div className="community-post-avatar">
          <img src={post.author.profileImageUrl} alt="" />
        </div>
        <div className="community-post-author">
          <span className="community-post-author-name">{post.author.nickname}</span>
          <div className="community-post-book">
            <span className="mgc_book_6_fill" aria-hidden />
            <span className="community-post-book-title">
              {post.book?.title || '책 정보 없음'}
            </span>
          </div>
        </div>
      </div>

      <div className="community-post-image">
        {imageUrl ? (
          <img src={imageUrl} alt="" />
        ) : (
          <div className="community-post-image-placeholder" aria-hidden />
        )}
      </div>

      <div className="community-post-footer">
        <div className="community-post-stats">
          <div className="community-post-stat">
            <span
              className={post.isLiked ? 'mgc_heart_fill' : 'mgc_heart_line'}
              aria-hidden
            />
            <span>{post.likeCount}</span>
          </div>
          <div className="community-post-stat">
            <span className="mgc_chat_3_line" aria-hidden />
            <span>{post.commentCount}</span>
          </div>
        </div>
        <div className="community-post-text">
          <p className="community-post-content">{post.content}</p>
          <time className="community-post-date" dateTime={post.createdAt}>
            {formattedDate}
          </time>
        </div>
      </div>
    </div>
  );
}

export default CommunityPostItem;
