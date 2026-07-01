import { useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import './CreateBoardModal.css';

const CATEGORY_OPTIONS = ['Celebration', 'Thank you', 'Inspiration'];

function CreateBoardModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setTitle('');
    setCategory(CATEGORY_OPTIONS[0]);
    setImageUrl('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category) {
      setError('Title and category are required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate?.({
        title: title.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
      });
      reset();
      onClose?.();
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a new board">
      <form className="create-board-form" onSubmit={handleSubmit}>
        <label className="create-board-form__field">
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="create-board-form__field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="create-board-form__field">
          <span>Image URL (optional)</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>

        {error && <p className="create-board-form__error">{error}</p>}

        <div className="create-board-form__actions">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateBoardModal;
