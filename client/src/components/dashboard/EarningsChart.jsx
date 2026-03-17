const EarningsChart = ({ history = [], totalEarnings = 0, completedCount = 0 }) => {
  // Group earnings by day (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push({ date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), dateStr: d.toDateString(), earnings: 0, count: 0 });
  }

  history.forEach((order) => {
    const orderDate = new Date(order.completedAt || order.updatedAt || order.createdAt).toDateString();
    const dayEntry = last7Days.find((d) => d.dateStr === orderDate);
    if (dayEntry) {
      dayEntry.earnings += (order.deliveryFee || 40);
      dayEntry.count += 1;
    }
  });

  const maxEarnings = Math.max(...last7Days.map((d) => d.earnings), 1);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>📈 Earnings (Last 7 Days)</h3>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Total: <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{Number(totalEarnings).toLocaleString()}</span>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-sm)', height: 160, padding: '0 var(--space-sm)' }}>
        {last7Days.map((day, i) => {
          const barHeight = maxEarnings > 0 ? (day.earnings / maxEarnings) * 140 : 0;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: day.earnings > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                {day.earnings > 0 ? `₹${day.earnings}` : ''}
              </span>
              <div style={{
                width: '100%', maxWidth: 40, height: Math.max(barHeight, 4), borderRadius: '6px 6px 0 0',
                background: day.earnings > 0 ? 'linear-gradient(180deg, var(--primary), var(--primary-dark, #e55500))' : 'var(--border-color)',
                transition: 'height 0.3s ease',
              }} title={`${day.date}: ₹${day.earnings} (${day.count} deliveries)`} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{day.date}</span>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>₹{Number(totalEarnings).toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Earned</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{completedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deliveries</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{completedCount > 0 ? Math.round(totalEarnings / completedCount) : 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg/Delivery</div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;
