import { FiCheck, FiTruck, FiPackage, FiX } from 'react-icons/fi';

const STATUS_ACTIONS = {
    placed:         [{ label: '✅ Accept', status: 'confirmed', variant: 'btn-primary' }],
    confirmed:      [{ label: '🍳 Start Preparing', status: 'preparing', variant: 'btn-secondary' }],
    preparing:      [{ label: '📦 Mark Ready', status: 'ready', variant: 'btn-primary' }],
    ready:          [{ label: '🚚 Out for Delivery', status: 'outForDelivery', variant: 'btn-primary' }],
    outForDelivery: [{ label: '🎉 Delivered', status: 'delivered', variant: 'btn-primary' }],
};

const CANCEL_ALLOWED = ['placed', 'confirmed'];

const statusColors = {
    placed: '#3498db', confirmed: '#2ecc71', preparing: '#e67e22',
    ready: '#9b59b6', outForDelivery: '#e74c3c', delivered: '#27ae60', cancelled: '#7f8c8d',
};

const OrderTable = ({ orders = [], onStatusChange, statusActions = {} }) => {
    if (orders.length === 0) return (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📋</div><p>No orders found</p>
        </div>
    );

    const actions = { ...STATUS_ACTIONS, ...statusActions };

    return (
        <table className="orders-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => {
                    const actionList = actions[order.status] || [];
                    const canCancel = CANCEL_ALLOWED.includes(order.status);
                    const isDone = order.status === 'delivered' || order.status === 'cancelled';

                    return (
                        <tr key={order._id}>
                            <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                #{order._id?.slice(-6).toUpperCase()}
                            </td>
                            <td>{order.user?.name || order.customer?.name || 'Customer'}</td>
                            <td>{order.items?.length || 0} items</td>
                            <td style={{ fontWeight: 600 }}>₹{order.totalAmount || 0}</td>
                            <td>
                                <span style={{
                                    display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                                    fontSize: '0.75rem', fontWeight: 700,
                                    background: `${statusColors[order.status] || '#666'}22`,
                                    color: statusColors[order.status] || '#666',
                                    border: `1px solid ${statusColors[order.status] || '#666'}44`,
                                }}>
                                    {order.status}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {actionList.map((act) => (
                                        <button
                                            key={act.status}
                                            className={`btn ${act.variant} btn-sm`}
                                            onClick={() => onStatusChange(order._id, act.status)}
                                            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                                        >
                                            {act.label}
                                        </button>
                                    ))}
                                    {canCancel && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                                            onClick={() => onStatusChange(order._id, 'cancelled')}
                                        >
                                            ✕ Cancel
                                        </button>
                                    )}
                                    {isDone && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 0' }}>
                                            {order.status === 'delivered' ? '✅ Complete' : '❌ Cancelled'}
                                        </span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default OrderTable;
