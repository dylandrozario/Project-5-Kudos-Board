import CategoryBadge from '../CategoryBadge/CategoryBadge';
import DeleteButton from '../DeleteButton/DeleteButton';
import './BoardCard.css';

function BoardCard({ board, onClick, onDelete }) {
  const handleNavigate = (e) => {
    e.preventDefault();
    onClick?.(board.id);
  };

  return (
    <article className="board-card">
      <a
        href={`/boards/${board.id}`}
        className="board-card__link"
        onClick={handleNavigate}
        aria-label={`Open board ${board.title}`}
      >
        <div className="board-card__image-wrap">
          <img src={board.imageURL} alt="" className="board-card__image" />
        </div>
        <div className="board-card__body">
          <div className="board-card__text">
            <h3 className="board-card__title">{board.title}</h3>
            <CategoryBadge category={board.category} />
          </div>
        </div>
      </a>
      <DeleteButton
        onClick={() => onDelete?.(board.id)}
        className="board-card__delete"
        confirmMessage={`Delete board "${board.title}"?`}
        iconOnly
      />
    </article>
  );
}

export default BoardCard;
