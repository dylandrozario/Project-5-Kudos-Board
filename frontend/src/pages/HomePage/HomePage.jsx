import { useMemo, useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import CategoryTabs from '../../components/CategoryTabs/CategoryTabs';
import BoardGrid from '../../components/BoardGrid/BoardGrid';
import CreateBoardModal from '../../components/CreateBoardModal/CreateBoardModal';
import AuthModal from '../../components/AuthModal/AuthModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import UserModal from '../../components/UserModal/UserModal';
import Footer from '../../components/Footer/Footer';
import axios from "axios";
import { getStoredAuth, getCurrentUser, login, register, logout } from '../../auth';
import './HomePage.css';

function HomePage() {
  const [boards, setBoards] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [auth, setAuth] = useState(getStoredAuth); // { token, user } | null
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [boardPendingDelete, setBoardPendingDelete] = useState(null);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const isAuthenticated = !!auth;
  const currentUser = getCurrentUser();

  // "My Boards" only makes sense for a signed-in user, so it's added conditionally.
  const CATEGORIES = [
    'All',
    'Recent',
    ...(isAuthenticated ? ['My Boards'] : []),
    'Celebration',
    'Thank you',
    'Inspiration',
  ];

  const filteredBoards = useMemo(() => {
    let list = [...boards];

    if (selectedCategory === 'Recent') {
      list = [...list]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    } else if (selectedCategory === 'My Boards') {
      // Only the signed-in user's own boards. Guests never reach here (no tab).
      list = isAuthenticated ? list.filter((b) => b.authorId === currentUser.id) : list;
    } else if (selectedCategory !== 'All') {
      list = list.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q));
    }

    return list;
  }, [boards, selectedCategory, searchQuery, isAuthenticated, currentUser.id]);

  const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/boards`);
        setBoards(response.data)
      } catch(err) {
        console.error("Failed to load boards:", err);
      }
    };
    fetchBoards();
  }, []);

  // These wrap the auth helpers so local state updates and the page re-renders.
  const handleLogin = async (credentials) => setAuth(await login(credentials));
  const handleRegister = async (fields) => setAuth(await register(fields));

  // The avatar opens an account modal for everyone; log out / sign in are
  // deliberate actions taken from inside that modal.
  const handleUserClick = () => setIsUserOpen(true);

  const handleLogout = () => {
    logout();
    setAuth(null);
    setIsUserOpen(false);
    // The "My Boards" tab disappears for guests — fall back to All so the
    // grid doesn't get stuck filtering on a category that's no longer shown.
    if (selectedCategory === 'My Boards') setSelectedCategory('All');
  };

  // From the account modal, a guest jumps to the sign-in form.
  const handleOpenAuth = () => {
    setIsUserOpen(false);
    setIsAuthOpen(true);
  };

  const handleSearchSubmit = () => setSearchQuery(searchInput);

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleCreateBoard = async ({ title, category, imageUrl }) => {
    try {
      // Content is always attributed to the current account: the signed-in
      // user, or the shared Guest account (id 1) for anonymous visitors. This
      // keeps ownership intact so "My Boards" and owner-only delete work.
      const payload = { title, category, imageUrl, authorId: currentUser.id };

      const response = await axios.post(`${API_BASE_URL}/boards`, payload);
      setBoards((prev) => [response.data, ...prev]);
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  // The trash icon on each BoardCard just asks HomePage to open its shared
  // ConfirmModal — no per-card modal, so hovering off the card doesn't flicker.
  const handleRequestDeleteBoard = (board) => setBoardPendingDelete(board);

  const handleConfirmDeleteBoard = async () => {
    if (!boardPendingDelete) return;
    const id = boardPendingDelete.id;
    try {
      // Send the requester so the backend can enforce owner-only deletion.
      await axios.delete(`${API_BASE_URL}/boards/${id}`, {
        data: { userId: currentUser.id },
      });
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete board:", err);
    } finally {
      setBoardPendingDelete(null);
    }
  };

  return (
    <div className="home-page">
      <Header
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onSearchClear={handleSearchClear}
        onCreateBoard={() => setIsCreateOpen(true)}
        user={currentUser}
        onUserClick={handleUserClick}
      />
      <Banner />
      <CategoryTabs
        categories={CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <BoardGrid
        boards={filteredBoards}
        onDeleteBoard={handleRequestDeleteBoard}
        canDeleteBoard={(board) => board.authorId === currentUser.id}
      />
      <ConfirmModal
        isOpen={!!boardPendingDelete}
        title={boardPendingDelete ? `Delete "${boardPendingDelete.title}"?` : ''}
        message="This will remove the board and all of its cards and comments. This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteBoard}
        onClose={() => setBoardPendingDelete(null)}
      />
      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateBoard}
      />
      <UserModal
        isOpen={isUserOpen}
        onClose={() => setIsUserOpen(false)}
        user={currentUser}
        isAuthenticated={isAuthenticated}
        onLogin={handleOpenAuth}
        onLogout={handleLogout}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      <Footer />
    </div>
  );
}

export default HomePage;
