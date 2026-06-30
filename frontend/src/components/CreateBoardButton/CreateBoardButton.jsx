import Button from '../Button/Button';
import './CreateBoardButton.css';

function CreateBoardButton({ onClick }) {
  return (
    <Button variant="primary" size="md" onClick={onClick} className="create-board-btn">
      <span aria-hidden="true">+</span>
      <span>Create Board</span>
    </Button>
  );
}

export default CreateBoardButton;
