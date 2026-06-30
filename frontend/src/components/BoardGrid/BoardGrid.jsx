import BoardCard from '../BoardCard/BoardCard';
import EmptyState from '../EmptyState/EmptyState';
import './BoardGrid.css';

function BoardGrid({ boards, isLoading = false, onBoardClick, onDeleteBoard }) {
  if (isLoading) {
    return <div className="board-grid__loading">Loading boards…</div>;
  }

  if (!boards || boards.length === 0) {
    return (
      <EmptyState
        title="No boards found"
        message="Try a different search or category, or create a new board."
      />
    );
  }

  return (
    <section className="board-grid" aria-label="Boards">
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          onClick={onBoardClick}
          onDelete={onDeleteBoard}
        />
      ))}
    </section>
  );
}

export default BoardGrid;
