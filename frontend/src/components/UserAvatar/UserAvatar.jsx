import Avatar from '../Avatar/Avatar';
import './UserAvatar.css';

function UserAvatar({ user, onClick }) {
  const username = user?.username ?? 'Guest';

  return (
    <button
      type="button"
      className="user-avatar"
      onClick={onClick}
      aria-label={`User menu for ${username}`}
    >
      <Avatar username={username} size="md" />
    </button>
  );
}

export default UserAvatar;
