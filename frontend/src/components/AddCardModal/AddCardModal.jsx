import { useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import GiphyPicker from '../GiphyPicker/GiphyPicker';
import './AddCardModal.css';

// `boardId` is accepted to match the planning spec; the backend infers it from the route.
function AddCardModal({ isOpen, boardId: _boardId, onClose, onCreate, requireAuthorName = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setTitle('');
    setDescription('');
    setGifUrl('');
    setAuthorName('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !gifUrl) {
      setError('Title, message, and a gif are all required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate?.({
        title: title.trim(),
        description: description.trim(),
        gifUrl,
        authorName: authorName.trim() || undefined,
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Add a new card">
      <form className="add-card-form" onSubmit={handleSubmit}>
        <label className="add-card-form__field">
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short header (e.g. Jamie L.)"
            required
            autoFocus
          />
        </label>

        <label className="add-card-form__field">
          <span>Message</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Share your kudos…"
            required
          />
        </label>

        <div className="add-card-form__field">
          <span>Gif</span>
          <GiphyPicker value={gifUrl} onChange={setGifUrl} />
        </div>

        {requireAuthorName && (
          <label className="add-card-form__field">
            <span>Your name (optional)</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonymous"
            />
          </label>
        )}

        {error && <p className="add-card-form__error">{error}</p>}

        <div className="add-card-form__actions">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Add Card'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddCardModal;
