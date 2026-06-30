import './UpvoteButton.css';

function UpvoteButton({ count, onClick }) {
  return (
    <button type="button" className="upvote-btn" onClick={onClick} aria-label={`Upvote (${count})`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-6 0v4H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h13.7a2 2 0 0 0 2-1.7l1-7a2 2 0 0 0-2-2.3H14z" />
      </svg>
      <span className="upvote-btn__count">{count}</span>
    </button>
  );
}

export default UpvoteButton;
