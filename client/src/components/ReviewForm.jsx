import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const ReviewForm = ({ onSubmit, loading }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>⭐ Write a Review</h3>
      <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-md)' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}>
            <FiStar size={28} fill={star <= (hover || rating) ? '#f39c12' : 'none'} color={star <= (hover || rating) ? '#f39c12' : 'var(--text-muted)'} />
          </button>
        ))}
        {rating > 0 && <span style={{ marginLeft: 8, fontWeight: 600, color: '#f39c12', alignSelf: 'center' }}>{rating}/5</span>}
      </div>
      <textarea className="form-input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..." style={{ marginBottom: 'var(--space-md)', resize: 'vertical' }} />
      <button type="submit" className="btn btn-primary btn-sm" disabled={rating === 0 || loading}>
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
