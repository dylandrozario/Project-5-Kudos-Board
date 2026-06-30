import './PinButton.css';

function PinButton({ pinned, onClick }) {
  return (
    <button
      type="button"
      className={`pin-btn ${pinned ? 'pin-btn--active' : ''}`}
      onClick={onClick}
      aria-label={pinned ? 'Unpin card' : 'Pin card'}
      aria-pressed={pinned}
    >
      <svg viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 17v5" />
        <path d="M9 10.76V6h6v4.76l2 4.24H7l2-4.24z" />
      </svg>
    </button>
  );
}

export default PinButton;
