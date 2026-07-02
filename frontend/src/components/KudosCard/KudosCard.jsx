import UpvoteButton from '../UpvoteButton/UpvoteButton';
import CommentButton from '../CommentButton/CommentButton';
import PinButton from '../PinButton/PinButton';
import DeleteButton from '../DeleteButton/DeleteButton';
import './KudosCard.css';

function KudosCard({ card, onUpvote, onOpenComments, onPin, onDelete }) {
  return (
    <article className={`kudos-card ${card.pinned ? 'kudos-card--pinned' : ''}`}>
      <header className="kudos-card__head">
        <h3 className="kudos-card__title">{card.title}</h3>
        <PinButton pinned={card.pinned} onClick={() => onPin?.(card.id, !card.pinned)} />
      </header>

      {card.gifUrl && (
        <div className="kudos-card__media">
          <img src={card.gifUrl} alt="" className="kudos-card__image" />
        </div>
      )}

      {card.description && <p className="kudos-card__body">{card.description}</p>}

      <footer className="kudos-card__actions">
        <UpvoteButton count={card.upvotes} onClick={() => onUpvote?.(card.id)} />
        <CommentButton
          count={card.comments?.length ?? 0}
          onClick={() => onOpenComments?.(card.id)}
        />
        <DeleteButton
          onClick={() => onDelete?.(card.id)}
          className="kudos-card__delete"
          confirmTitle="Delete this card?"
          confirmMessage="The card and all of its comments will be removed. This action cannot be undone."
          iconOnly
        />
      </footer>
    </article>
  );
}

export default KudosCard;
