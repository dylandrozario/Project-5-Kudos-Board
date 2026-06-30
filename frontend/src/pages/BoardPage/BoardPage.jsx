import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BoardBanner from '../../components/BoardBanner/BoardBanner';
import CardGrid from '../../components/CardGrid/CardGrid';
import AddCardModal from '../../components/AddCardModal/AddCardModal';
import CommentModal from '../../components/CommentModal/CommentModal';
import Footer from '../../components/Footer/Footer';
import { MOCK_BOARDS } from '../../data/mockBoards';
import { MOCK_CARDS_BY_BOARD } from '../../data/mockCards';
import './BoardPage.css';

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.pinned && b.pinned) {
      const ap = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
      const bp = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
      return bp - ap;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function BoardPage() {
  const navigate = useNavigate();
  const params = useParams();
  const boardId = Number(params.boardId);
  const goHome = () => navigate('/');

  const initialBoard = useMemo(() => {
    const meta = MOCK_BOARDS.find((b) => b.id === boardId);
    if (!meta) return null;
    return {
      ...meta,
      author: { id: 1, username: 'Guest' },
      cards: MOCK_CARDS_BY_BOARD[boardId] ?? [],
    };
  }, [boardId]);

  const [board, setBoard] = useState(initialBoard);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [commentsModalCardId, setCommentsModalCardId] = useState(null);

  const currentUser = { id: 1, email: 'guest@kudos.local', username: 'Guest' };

  const sortedCards = useMemo(() => sortCards(board?.cards ?? []), [board]);
  const commentsCard = sortedCards.find((c) => c.id === commentsModalCardId) ?? null;

  if (!board) {
    return (
      <div className="board-page board-page--missing">
        <Header
          showBackButton
          onBack={goHome}
          searchInput=""
          onSearchInputChange={() => {}}
          onSearchSubmit={() => {}}
          onSearchClear={() => {}}
          onCreateBoard={() => {}}
          user={currentUser}
        />
        <main className="board-page__missing">
          <h2>Board not found</h2>
          <button type="button" onClick={goHome}>← Back to all boards</button>
        </main>
        <Footer />
      </div>
    );
  }

  const updateCards = (mutator) => {
    setBoard((prev) => (prev ? { ...prev, cards: mutator(prev.cards) } : prev));
  };

  const handleAddCard = async ({ title, description, gifUrl, authorName }) => {
    const newCard = {
      id: Date.now(),
      title,
      description,
      gifUrl,
      upvotes: 0,
      pinned: false,
      pinnedAt: null,
      boardId: board.id,
      createdAt: new Date(2026, 5, 30).toISOString(),
      author: { id: 1, username: authorName || 'Guest' },
      comments: [],
    };
    updateCards((cards) => [newCard, ...cards]);
  };

  const handleUpvote = (cardId) => {
    updateCards((cards) =>
      cards.map((c) => (c.id === cardId ? { ...c, upvotes: c.upvotes + 1 } : c)),
    );
  };

  const handlePin = (cardId, pinned) => {
    updateCards((cards) =>
      cards.map((c) =>
        c.id === cardId
          ? { ...c, pinned, pinnedAt: pinned ? new Date(2026, 5, 30).toISOString() : null }
          : c,
      ),
    );
  };

  const handleDelete = (cardId) => {
    updateCards((cards) => cards.filter((c) => c.id !== cardId));
  };

  const handleAddComment = (cardId, message, authorName) => {
    updateCards((cards) =>
      cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              comments: [
                ...c.comments,
                {
                  id: Date.now(),
                  message,
                  cardId,
                  author: { id: 1, username: authorName || 'Guest' },
                  createdAt: new Date(2026, 5, 30).toISOString(),
                },
              ],
            }
          : c,
      ),
    );
  };

  const handleDeleteComment = (commentId) => {
    updateCards((cards) =>
      cards.map((c) => ({
        ...c,
        comments: c.comments.filter((cm) => cm.id !== commentId),
      })),
    );
  };

  return (
    <div className="board-page">
      <Header
        showBackButton
        onBack={goHome}
        searchInput=""
        onSearchInputChange={() => {}}
        onSearchSubmit={() => {}}
        onSearchClear={() => {}}
        onCreateBoard={() => {}}
        user={currentUser}
      />

      <BoardBanner
        board={board}
        cardCount={board.cards.length}
        onAddCard={() => setIsAddCardOpen(true)}
      />

      <CardGrid
        cards={sortedCards}
        onUpvote={handleUpvote}
        onOpenComments={setCommentsModalCardId}
        onPin={handlePin}
        onDelete={handleDelete}
      />

      <AddCardModal
        isOpen={isAddCardOpen}
        boardId={board.id}
        onClose={() => setIsAddCardOpen(false)}
        onCreate={handleAddCard}
      />

      <CommentModal
        isOpen={!!commentsModalCardId}
        card={commentsCard}
        onClose={() => setCommentsModalCardId(null)}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      <Footer />
    </div>
  );
}

export default BoardPage;
