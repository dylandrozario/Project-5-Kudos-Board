import './Avatar.css';

const COLORS = ['#4f8cff', '#ff6a3d', '#a259ff', '#22a559', '#e8a93c', '#e8589c', '#3dc3c8'];

function pickColor(username) {
  if (!username) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash + username.charCodeAt(i)) % COLORS.length;
  }
  return COLORS[hash];
}

function Avatar({ username, color, size = 'md' }) {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  const bg = color || pickColor(username);

  return (
    <div className={`avatar avatar--${size}`} style={{ backgroundColor: bg }}>
      {initial}
    </div>
  );
}

export default Avatar;
