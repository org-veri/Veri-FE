import './PostLikeListPanel.css';
import type { AuthorInfo } from '../../api/communityApi';

export type LikeMemberRelation = 'mutual' | 'request_friend';

export type PostLikeListMemberView = AuthorInfo & {
  relation: LikeMemberRelation;
};

export interface PostLikeListPanelProps {
  likeCount: number;
  members: PostLikeListMemberView[];
  /** 목록이 비었을 때 표시 (예: 좋아요 수는 있는데 likedMembers 미제공) */
  emptyMessage?: string;
  onPillPress?: (member: PostLikeListMemberView) => void;
}

const FALLBACK_AVATAR = '/images/profileSample/sample_user.png';

function PostLikeListPanel({ likeCount, members, emptyMessage, onPillPress }: PostLikeListPanelProps) {
  return (
    <div className="post-like-list-panel">
      <div className="post-like-list-panel__summary">
        <span className="post-like-list-panel__heart-wrap" aria-hidden>
          <span className="post-like-list-panel__heart mgc_heart_fill" />
        </span>
        <span className="post-like-list-panel__count-num">{likeCount}</span>
        <span className="post-like-list-panel__count-suffix">개의 좋아요</span>
      </div>

      {members.length === 0 ? (
        <div className="post-like-list-panel__empty" role="status">
          <p>{emptyMessage ?? '아직 좋아요가 없어요'}</p>
        </div>
      ) : (
        <ul className="post-like-list-panel__list">
          {members.map((member) => (
            <li key={member.id} className="post-like-list-panel__row">
              <div className="post-like-list-panel__user">
                <div className="post-like-list-panel__avatar">
                  {member.profileImageUrl ? (
                    <img
                      src={member.profileImageUrl}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />
                  ) : (
                    <div className="post-like-list-panel__avatar-placeholder" aria-hidden />
                  )}
                </div>
                <span className="post-like-list-panel__nickname">{member.nickname}</span>
              </div>
              <button
                type="button"
                className={
                  member.relation === 'mutual'
                    ? 'post-like-list-panel__pill post-like-list-panel__pill--mutual'
                    : 'post-like-list-panel__pill post-like-list-panel__pill--request'
                }
                onClick={() => onPillPress?.(member)}
              >
                {member.relation === 'mutual' ? '서로친구' : '친구신청'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PostLikeListPanel;
