import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BoardBanner from '../../components/BoardBanner/BoardBanner';
import CardGrid from '../../components/CardGrid/CardGrid';
import AddCardModal from '../../components/AddCardModal/AddCardModal';
import CommentModal from '../../components/CommentModal/CommentModal';
import Footer from '../../components/Footer/Footer';
import { getStoredAuth, getCurrentUser } from '../../auth';
import './BoardPage.css';

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

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

  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [commentsModalCardId, setCommentsModalCardId] = useState(null);

  // Owner is the signed-in user; falls back to the shared Guest account.
  const isAuthenticated = !!getStoredAuth();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchBoard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // GET /boards/:id — expected to include nested cards (each with author + comments).
        // If the backend doesn't include them yet, GET /boards/:id/cards is fetched as fallback.
        const boardRes = await axios.get(`${API_BASE_URL}/boards/${boardId}`);
        let payload = boardRes.data;

        if (!Array.isArray(payload.cards)) {
          const cardsRes = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards`);
          payload = { ...payload, cards: cardsRes.data };
        }

        // Ensure every card has a comments array so the UI never crashes on `.comments.length`.
        payload.cards = payload.cards.map((c) => ({
          ...c,
          comments: c.comments ?? [],
        }));

        setBoard(payload);
      } catch (err) {
        console.error('Failed to load board:', err);
        setError('Could not load this board.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);

  const sortedCards = useMemo(() => sortCards(board?.cards ?? []), [board]);
  const commentsCard = sortedCards.find((c) => c.id === commentsModalCardId) ?? null;

  const updateCards = (mutator) => {
    setBoard((prev) => (prev ? { ...prev, cards: mutator(prev.cards) } : prev));
  };

  // Given an authorId, fetch and return the User row so `author.username`
  // is available on newly-created cards/comments (backend create responses
  // return only `authorId`, not the nested author object).
  const fetchAuthor = async (authorId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${authorId}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch author:', err);
      return { id: authorId, username: 'Guest' };
    }
  };

  const handleAddCard = async ({ title, description, gifUrl, authorName }) => {
    // Signed-in users are attributed automatically; a guest who supplies a
    // display name gets a User upserted by the backend. Send exactly one
    // identifier — resolveAuthorId ignores authorName when authorId is present.
    const payload = { title, description, gifUrl, boardId };
    if (isAuthenticated || !authorName) payload.authorId = currentUser.id;
    else payload.authorName = authorName;

    const response = await axios.post(`${API_BASE_URL}/cards`, payload);

    // Backend includes { author: true } on create; fallback fetch only if missing.
    const author =
      response.data.author ?? (await fetchAuthor(response.data.authorId));
    const created = {
      ...response.data,
      author,
      comments: response.data.comments ?? [],
    };
    updateCards((cards) => [created, ...cards]);
  };

  const handleUpvote = async (cardId) => {
    const target = board.cards.find((c) => c.id === cardId);
    if (!target) return;
    const nextUpvotes = target.upvotes + 1;

    updateCards((cards) =>
      cards.map((c) => (c.id === cardId ? { ...c, upvotes: nextUpvotes } : c)),
    );

    try {
      await axios.put(`${API_BASE_URL}/cards/${cardId}`, { upvotes: nextUpvotes });
    } catch (err) {
      console.error('Failed to upvote:', err);
      updateCards((cards) =>
        cards.map((c) => (c.id === cardId ? { ...c, upvotes: target.upvotes } : c)),
      );
    }
  };

  const handlePin = async (cardId, pinned) => {
    const target = board.cards.find((c) => c.id === cardId);
    if (!target) return;

    updateCards((cards) =>
      cards.map((c) =>
        c.id === cardId
          ? { ...c, pinned, pinnedAt: pinned ? new Date().toISOString() : null }
          : c,
      ),
    );

    try {
      await axios.put(`${API_BASE_URL}/cards/${cardId}`, { pinned });
    } catch (err) {
      console.error('Failed to pin/unpin:', err);
      updateCards((cards) =>
        cards.map((c) =>
          c.id === cardId
            ? { ...c, pinned: target.pinned, pinnedAt: target.pinnedAt }
            : c,
        ),
      );
    }
  };

  const handleDelete = async (cardId) => {
    try {
      await axios.delete(`${API_BASE_URL}/cards/${cardId}`);
      updateCards((cards) => cards.filter((c) => c.id !== cardId));
      if (commentsModalCardId === cardId) setCommentsModalCardId(null);
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const handleAddComment = async (cardId, message, authorName) => {
    const payload = { message };
    if (isAuthenticated || !authorName) payload.authorId = currentUser.id;
    else payload.authorName = authorName;

    const response = await axios.post(`${API_BASE_URL}/cards/${cardId}/comments`, payload);

    // Backend includes { author: true } on create; fallback fetch only if missing.
    const author =
      response.data.author ?? (await fetchAuthor(response.data.authorId));
    const newComment = { ...response.data, author };
    updateCards((cards) =>
      cards.map((c) =>
        c.id === cardId ? { ...c, comments: [...c.comments, newComment] } : c,
      ),
    );
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
      updateCards((cards) =>
        cards.map((c) => ({
          ...c,
          comments: c.comments.filter((cm) => cm.id !== commentId),
        })),
      );
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (isLoading) {
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
        <main className="board-page__loading">Loading board…</main>
        <Footer />
      </div>
    );
  }

  if (error || !board) {
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
          <h2>{error ?? 'Board not found'}</h2>
          <button type="button" onClick={goHome}>← Back to all boards</button>
        </main>
        <Footer />
      </div>
    );
  }

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
        requireAuthorName={!isAuthenticated}
      />

      <CommentModal
        isOpen={!!commentsModalCardId}
        card={commentsCard}
        onClose={() => setCommentsModalCardId(null)}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        requireAuthorName={!isAuthenticated}
      />

      <Footer />
    </div>
  );
}

export default BoardPage;
