import './PostLikeListPanel.css';
import type { LikedMemberInfo } from '../../api/types/community';
import { useNavigate } from 'react-router-dom';
import { navigateToMemberProfile } from '../../utils/navigateToMemberProfile';

export type LikeMemberRelation = 'mutual' | 'request_friend';

export type PostLikeListMemberView = LikedMemberInfo & {
  relation: LikeMemberRelation;
};

export interface PostLikeListPanelProps {
  likeCount: number;
  members: PostLikeListMemberView[];
  currentUserId?: number | null;
  followLoadingId?: number | null;
  emptyMessage?: string;
  onPillPress?: (member: PostLikeListMemberView) => void;
}

const FALLBACK_AVATAR = '/images/profileSample/sample_user.png';

function PostLikeListPanel({
  likeCount,
  members,
  currentUserId,
  followLoadingId,
  emptyMessage,
  onPillPress,
}: PostLikeListPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="post-like-list-panel">
      <div className="post-like-list-panel__summary">
        <div className="post-like-list-panel__count-group">
          <span className="post-like-list-panel__heart-wrap" aria-hidden>
            <span className="post-like-list-panel__heart mgc_heart_fill" />
          </span>
          <span className="post-like-list-panel__count-num">{likeCount}</span>
        </div>
        <span className="post-like-list-panel__count-suffix">개의 좋아요</span>
      </div>

      {members.length === 0 ? (
        <div className="post-like-list-panel__empty" role="status">
          <p>{emptyMessage ?? '아직 좋아요가 없어요'}</p>
        </div>
      ) : (
        <ul className="post-like-list-panel__list">
          {members.map((member) => {
            const isSelf = currentUserId != null && member.id === currentUserId;
            const isLoading = followLoadingId === member.id;

            return (
              <li key={member.id} className="post-like-list-panel__row">
                <button
                  type="button"
                  className="post-like-list-panel__user post-like-list-panel__user--clickable"
                  onClick={() => navigateToMemberProfile(navigate, member.id)}
                >
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
                </button>
                {!isSelf && (
                  <button
                    type="button"
                    className={
                      member.relation === 'mutual'
                        ? 'post-like-list-panel__pill post-like-list-panel__pill--mutual'
                        : 'post-like-list-panel__pill post-like-list-panel__pill--request'
                    }
                    disabled={isLoading || member.relation === 'mutual'}
                    onClick={() => onPillPress?.(member)}
                  >
                    {isLoading ? '처리 중…' : member.relation === 'mutual' ? '서로친구' : '친구신청'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default PostLikeListPanel;
