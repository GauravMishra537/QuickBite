const OrderTable = ({ orders = [], onStatusChange, statusActions = {} }) => {
  if (orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📋</div><p>No orders found</p>
    </div>
  );

  const defaultActions = {
    pending: [{ label: 'Accept', status: 'confirmed', variant: 'btn-primary' }],
    confirmed: [{ label: 'Prepare', status: 'preparing', variant: 'btn-secondary' }],
    preparing: [{ label: 'Ready', status: 'ready', variant: 'btn-primary' }],
  };
  const actions = { ...defaultActions, ...statusActions };

  return (
    <table className="orders-table">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order._id}>
            <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order._id?.slice(-6).toUpperCase()}</td>
            <td>{order.customer?.name || 'Customer'}</td>
            <td>{order.items?.length || 0} items</td>
            <td style={{ fontWeight: 600 }}>₹{order.totalAmount || 0}</td>
            <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
            <td>
              <div style={{ display: 'flex', gap: 4 }}>
                {(actions[order.status] || []).map((act) => (
                  <button key={act.status} className={`btn ${act.variant} btn-sm`} onClick={() => onStatusChange(order._id, act.status)}>
                    {act.label}
                  </button>
                ))}
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onStatusChange(order._id, 'cancelled')}>Reject</button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
