import { useMemo, useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import CategoryTabs from '../../components/CategoryTabs/CategoryTabs';
import BoardGrid from '../../components/BoardGrid/BoardGrid';
import CreateBoardModal from '../../components/CreateBoardModal/CreateBoardModal';
import Footer from '../../components/Footer/Footer';
import axios from "axios";
import './HomePage.css';

function HomePage() {
  const [boards, setBoards] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const CATEGORIES = ['All', 'Recent', 'Celebration', 'Thank you', 'Inspiration'];
  
  const currentUser = { id: 1, email: 'guest@kudos.local', username: 'Guest' };

  const filteredBoards = useMemo(() => {
    let list = [...boards];

    if (selectedCategory === 'Recent') {
      list = [...list]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    } else if (selectedCategory !== 'All') {
      list = list.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q));
    }

    return list;
  }, [boards, selectedCategory, searchQuery]);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  const handleSearchSubmit = () => setSearchQuery(searchInput);

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleCreateBoard = async ({ title, category, imageUrl, authorName }) => {
    try {
      // Send authorName when provided so the backend can upsert a User for them;
      // otherwise fall back to the current (Guest) user's id.
      const payload = { title, category, imageUrl };
      if (authorName) payload.authorName = authorName;
      else payload.authorId = currentUser.id;

      const response = await axios.post(`${API_BASE_URL}/boards`, payload);
      setBoards((prev) => [response.data, ...prev]);
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  const handleDeleteBoard = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete board:", err);
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
      />
      <Banner />
      <CategoryTabs
        categories={CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <BoardGrid boards={filteredBoards} onDeleteBoard={handleDeleteBoard} />
      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateBoard}
      />
      <Footer />
    </div>
  );
}

export default HomePage;
