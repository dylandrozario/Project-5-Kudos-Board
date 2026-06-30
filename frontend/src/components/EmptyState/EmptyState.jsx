import './EmptyState.css';

function EmptyState({ title = 'Nothing to show', message = '' }) {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">{title}</h2>
      {message && <p className="empty-state__message">{message}</p>}
    </div>
  );
}

export default EmptyState;
