import CategoryTab from '../CategoryTab/CategoryTab';
import './CategoryTabs.css';

function CategoryTabs({ categories, selected, onSelect }) {
  return (
    <nav className="category-tabs" aria-label="Filter boards by category">
      {categories.map((cat) => (
        <CategoryTab
          key={cat}
          label={cat}
          isActive={cat === selected}
          onClick={() => onSelect?.(cat)}
        />
      ))}
    </nav>
  );
}

export default CategoryTabs;
