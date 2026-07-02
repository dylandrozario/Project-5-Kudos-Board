import AddCardButton from '../AddCardButton/AddCardButton';
import './BoardBanner.css';

function BoardBanner({ board, cardCount, onAddCard }) {
  if (!board) return null;

  const authorName = board.author?.username;

  return (
    <header className="board-banner">
      {board.imageUrl && (
        <img src={board.imageUrl} alt="" className="board-banner__image" />
      )}
      <div className="board-banner__scrim" />
      <div className="board-banner__content">
        <div className="board-banner__text">
          <div className="board-banner__meta">
            <span className="board-banner__category">{board.category.toUpperCase()}</span>
            {authorName && (
              <span className="board-banner__author">by {authorName}</span>
            )}
          </div>
          <h1 className="board-banner__title">{board.title}</h1>
          <span className="board-banner__count">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
        </div>
        <AddCardButton onClick={onAddCard} />
      </div>
    </header>
  );
}

export default BoardBanner;
