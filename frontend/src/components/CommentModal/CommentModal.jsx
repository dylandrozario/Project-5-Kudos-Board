import Modal from '../Modal/Modal';
import CommentItem from '../CommentItem/CommentItem';
import CommentForm from '../CommentForm/CommentForm';
import './CommentModal.css';

function CommentModal({ isOpen, card, onClose, onAddComment, onDeleteComment }) {
  if (!card) return null;

  const comments = card.comments ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card details">
      <div className="comment-modal">
        <section className="comment-modal__card">
          <h3 className="comment-modal__title">{card.title}</h3>

          {card.gifUrl && (
            <div className="comment-modal__media">
              <img src={card.gifUrl} alt="" />
            </div>
          )}

          {card.description && <p className="comment-modal__body">{card.description}</p>}
        </section>

        <section className="comment-modal__comments">
          <h4 className="comment-modal__heading">
            Comments {comments.length > 0 && <span>({comments.length})</span>}
          </h4>
          {comments.length === 0 ? (
            <p className="comment-modal__empty">No comments yet — be the first.</p>
          ) : (
            <ul className="comment-modal__list">
              {comments.map((c) => (
                <CommentItem key={c.id} comment={c} onDelete={onDeleteComment} />
              ))}
            </ul>
          )}

          <CommentForm cardId={card.id} onSubmit={onAddComment} />
        </section>
      </div>
    </Modal>
  );
}

export default CommentModal;
