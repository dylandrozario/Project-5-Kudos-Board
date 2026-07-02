import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Avatar from '../Avatar/Avatar';
import './UserModal.css';

// Shows the current user's info. Signed-in users can log out; guests can
// jump to the sign-in form. Clicking the avatar opens this instead of
// immediately logging the user out.
function UserModal({ isOpen, onClose, user, isAuthenticated, onLogin, onLogout }) {
  const username = user?.username ?? 'Guest';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your account">
      <div className="user-modal">
        <Avatar username={username} size="lg" />
        <div className="user-modal__info">
          <p className="user-modal__name">{username}</p>
          {user?.email && <p className="user-modal__email">{user.email}</p>}
          {!isAuthenticated && (
            <p className="user-modal__hint">
              You're browsing as a guest. Sign in to be credited for your boards.
            </p>
          )}
        </div>

        <div className="user-modal__actions">
          {isAuthenticated ? (
            <Button variant="secondary" onClick={onLogout}>
              Log out
            </Button>
          ) : (
            <Button variant="primary" onClick={onLogin}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default UserModal;
