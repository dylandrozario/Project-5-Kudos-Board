import KudosCard from '../KudosCard/KudosCard';
import EmptyState from '../EmptyState/EmptyState';
import './CardGrid.css';

function CardGrid({ cards, onUpvote, onOpenComments, onPin, onDelete }) {
  if (!cards || cards.length === 0) {
    return (
      <EmptyState
        title="No cards yet"
        message="Be the first to share a kudo on this board."
      />
    );
  }

  return (
    <section className="card-grid" aria-label="Kudos cards">
      {cards.map((card) => (
        <KudosCard
          key={card.id}
          card={card}
          onUpvote={onUpvote}
          onOpenComments={onOpenComments}
          onPin={onPin}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

export default CardGrid;
