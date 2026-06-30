import './IconButton.css';

function IconButton({ children, onClick, ariaLabel, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      className={`icon-btn ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default IconButton;
