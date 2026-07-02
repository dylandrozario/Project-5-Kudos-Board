import { useState } from 'react';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import './DeleteButton.css';

function DeleteButton({
  onClick,
  label = 'Delete',
  confirmTitle = 'Delete?',
  confirmMessage = 'This action cannot be undone.',
  className = '',
  iconOnly = false,
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    onClick?.();
  };

  const classes = ['delete-btn', iconOnly ? 'delete-btn--icon-only' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <button type="button" className={classes} onClick={handleClick} aria-label={label}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        {!iconOnly && <span className="delete-btn__label">{label}</span>}
      </button>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
}

export default DeleteButton;
