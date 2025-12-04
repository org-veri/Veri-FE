// src/components/CommunityPostDetailPage/LikeUsersList.tsx
import './LikeUsersList.css';

interface LikeUser {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

interface LikeUsersListProps {
  users: LikeUser[];
  onClose?: () => void;
}

function LikeUsersList({ users, onClose }: LikeUsersListProps) {
  if (users.length === 0) {
    return (
      <div className="like-users-list">
        <div className="like-users-empty">
          <p>아직 좋아요가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="like-users-list">
      <div className="like-users-grid">
        {users.map((user) => (
          <div key={user.id} className="like-user-item">
            <div className="like-user-avatar">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={user.nickname}
                  onError={(e) => {
                    e.currentTarget.src = '/images/profileSample/sample_user.png';
                  }}
                />
              ) : (
                <div className="like-user-placeholder"></div>
              )}
            </div>
            <div className="like-user-name">{user.nickname}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LikeUsersList;

