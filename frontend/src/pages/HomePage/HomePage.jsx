import { useMemo, useState } from 'react';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import CategoryTabs from '../../components/CategoryTabs/CategoryTabs';
import BoardGrid from '../../components/BoardGrid/BoardGrid';
import CreateBoardModal from '../../components/CreateBoardModal/CreateBoardModal';
import Footer from '../../components/Footer/Footer';
import { MOCK_BOARDS, CATEGORIES } from '../../data/mockBoards';
import './HomePage.css';

function HomePage() {
  const [boards, setBoards] = useState(MOCK_BOARDS);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const handleSearchSubmit = () => setSearchQuery(searchInput);

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleCreateBoard = async ({ title, category, authorName }) => {
    const newBoard = {
      id: Math.max(0, ...boards.map((b) => b.id)) + 1,
      title,
      category,
      imageURL: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
      createdAt: new Date(2026, 5, 30).toISOString(),
      authorName,
    };
    setBoards([newBoard, ...boards]);
  };

  const handleDeleteBoard = (id) => {
    setBoards(boards.filter((b) => b.id !== id));
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
