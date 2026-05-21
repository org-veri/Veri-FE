import './LikeUsersList.css';
import { useNavigate } from 'react-router-dom';
import { navigateToMemberProfile } from '../../utils/navigateToMemberProfile';

interface LikeUser {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

interface LikeUsersListProps {
  users: LikeUser[];
}

function LikeUsersList({ users }: LikeUsersListProps) {
  const navigate = useNavigate();

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
          <button
            key={user.id}
            type="button"
            className="like-user-item like-user-item--clickable"
            onClick={() => navigateToMemberProfile(navigate, user.id)}
          >
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
                <div className="like-user-placeholder" />
              )}
            </div>
            <div className="like-user-name">{user.nickname}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LikeUsersList;
