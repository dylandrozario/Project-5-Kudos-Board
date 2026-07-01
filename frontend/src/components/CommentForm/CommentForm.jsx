import { useState } from 'react';
import Button from '../Button/Button';
import './CommentForm.css';

function CommentForm({ cardId, onSubmit }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.(cardId, message.trim());
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-form__message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a comment…"
        rows={2}
        required
      />
      <div className="comment-form__row">
        <Button variant="primary" type="submit" disabled={isSubmitting || !message.trim()}>
          {isSubmitting ? 'Posting…' : 'Post'}
        </Button>
      </div>
    </form>
  );
}

export default CommentForm;
