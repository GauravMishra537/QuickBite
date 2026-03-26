import { FiStar, FiTrash2 } from 'react-icons/fi';

const ReviewList = ({ reviews = [], averageRating = 0, count = 0, currentUserId, onDelete }) => {
  const stars = (n) => (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => <FiStar key={s} size={14} fill={s <= n ? '#f39c12' : 'none'} color={s <= n ? '#f39c12' : 'var(--text-muted)'} />)}
    </span>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Reviews ({count})</h3>
        {count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <FiStar size={16} fill="#f39c12" color="#f39c12" />
            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{averageRating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>avg</span>
          </div>
        )}
      </div>
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>No reviews yet. Be the first! 🌟</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {reviews.map((r) => (
            <div key={r._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8125rem' }}>
                    {(r.user?.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{r.user?.name || 'User'}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {stars(r.rating)}
                  {currentUserId && (r.user?._id === currentUserId || r.user === currentUserId) && onDelete && (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: 4 }} onClick={() => onDelete(r._id)} title="Delete">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
