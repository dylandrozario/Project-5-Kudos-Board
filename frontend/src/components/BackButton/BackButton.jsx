import IconButton from '../IconButton/IconButton';
import './BackButton.css';

function BackButton({ onClick }) {
  const handleClick = onClick || (() => window.history.back());

  return (
    <IconButton onClick={handleClick} ariaLabel="Go back" className="back-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </IconButton>
  );
}

export default BackButton;
