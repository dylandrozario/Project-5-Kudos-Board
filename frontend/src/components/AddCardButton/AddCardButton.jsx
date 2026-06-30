import Button from '../Button/Button';
import './AddCardButton.css';

function AddCardButton({ onClick }) {
  return (
    <Button variant="secondary" size="md" onClick={onClick} className="add-card-btn">
      <span aria-hidden="true">+</span>
      <span>Add card</span>
    </Button>
  );
}

export default AddCardButton;
