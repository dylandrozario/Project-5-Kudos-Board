import Logo from '../Logo/Logo';
import BackButton from '../BackButton/BackButton';
import SearchBar from '../SearchBar/SearchBar';
import CreateBoardButton from '../CreateBoardButton/CreateBoardButton';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import UserAvatar from '../UserAvatar/UserAvatar';
import './Header.css';

function Header({
  showBackButton = false,
  onBack,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onSearchClear,
  onCreateBoard,
  user,
  onUserClick,
}) {
  return (
    <header className="header">
      {showBackButton && <BackButton onClick={onBack} />}
      <Logo />
      <SearchBar
        value={searchInput}
        onChange={onSearchInputChange}
        onSubmit={onSearchSubmit}
        onClear={onSearchClear}
      />
      <div className="header__actions">
        <CreateBoardButton onClick={onCreateBoard} />
        <ThemeToggle />
        <UserAvatar user={user} onClick={onUserClick} />
      </div>
    </header>
  );
}

export default Header;
