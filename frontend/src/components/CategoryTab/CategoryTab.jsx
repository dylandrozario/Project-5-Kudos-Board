import './CategoryTab.css';

function CategoryTab({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`category-tab ${isActive ? 'category-tab--active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}

export default CategoryTab;
