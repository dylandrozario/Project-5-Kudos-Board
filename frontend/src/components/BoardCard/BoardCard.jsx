import { Link } from 'react-router-dom';
import CategoryBadge from '../CategoryBadge/CategoryBadge';
import DeleteButton from '../DeleteButton/DeleteButton';
import './BoardCard.css';

function BoardCard({ board, onDelete }) {
  return (
    <article className="board-card">
      <Link
        to={`/boards/${board.id}`}
        className="board-card__link"
        aria-label={`Open board ${board.title}`}
      >
        <div className="board-card__image-wrap">
          <img src={board.imageUrl} alt="" className="board-card__image" />
        </div>
        <div className="board-card__body">
          <div className="board-card__text">
            <h3 className="board-card__title">{board.title}</h3>
            <CategoryBadge category={board.category} />
          </div>
        </div>
      </Link>
      <DeleteButton
        onClick={() => onDelete?.(board.id)}
        className="board-card__delete"
        confirmTitle={`Delete "${board.title}"?`}
        confirmMessage="This will remove the board and all of its cards and comments. This action cannot be undone."
        iconOnly
      />
    </article>
  );
}

export default BoardCard;
