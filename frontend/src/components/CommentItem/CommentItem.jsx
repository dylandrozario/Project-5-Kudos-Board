import Avatar from '../Avatar/Avatar';
import DeleteButton from '../DeleteButton/DeleteButton';
import './CommentItem.css';

function CommentItem({ comment, onDelete }) {
  const username = comment.author?.username ?? 'Guest';

  return (
    <li className="comment-item">
      <Avatar username={username} size="sm" />
      <div className="comment-item__body">
        <span className="comment-item__author">{username}</span>
        <p className="comment-item__message">{comment.message}</p>
      </div>
      <DeleteButton
        onClick={() => onDelete?.(comment.id)}
        className="comment-item__delete"
        confirmMessage="Delete this comment?"
        iconOnly
      />
    </li>
  );
}

export default CommentItem;
