import { useState } from 'react';
import Button from '../Button/Button';
import './CommentForm.css';

function CommentForm({ cardId, onSubmit, requireAuthorName = false }) {
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.(cardId, message.trim(), authorName.trim() || undefined);
      setMessage('');
      setAuthorName('');
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
      {requireAuthorName && (
        <input
          className="comment-form__author"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
        />
      )}
      <div className="comment-form__row">
        <input
          type="text"
          className="comment-form__author"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Author (optional)"
        />
        <Button variant="primary" type="submit" disabled={isSubmitting || !message.trim()}>
          {isSubmitting ? 'Posting…' : 'Post'}
        </Button>
      </div>
    </form>
  );
}

export default CommentForm;
