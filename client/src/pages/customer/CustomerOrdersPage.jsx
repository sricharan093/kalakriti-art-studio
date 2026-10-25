import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { ShoppingBag, Ban, CheckCircle, AlertTriangle, MapPin, Phone, User } from 'lucide-react';

export const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirm = window.confirm('Are you sure you want to cancel this painting purchase? The artwork will be restored to the available gallery catalogue.');
    if (!confirm) return;

    try {
      setCancellingId(orderId);
      setFeedback(null);
      await orderApi.cancelOrder(orderId);
      setFeedback({ type: 'success', text: 'Order cancelled successfully. Painting availability has been restored.' });
      await fetchOrders();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your painting orders..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>My Painting Orders</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          Your verified purchases of authentic handcrafted canvases with secured delivery tracking records.
        </p>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: feedback.type === 'success' ? 'var(--color-olive-light)' : 'var(--color-rose-light)',
          color: feedback.type === 'success' ? 'var(--color-olive)' : 'var(--color-rose)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--color-olive-border)' : 'var(--color-rose-border)'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{feedback.text}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No painting orders found"
          description="You have not purchased any paintings yet. Explore our folk art collection to acquire original works."
          actionText="Browse Catalogue"
          actionLink="/catalogue"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Painting Title</th>
                <th>Purchase Price</th>
                <th>Order Date</th>
                <th>Delivery Address</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                const canCancel = ord.status === 'placed';
                const painting = ord.painting;
                const isCancelling = cancellingId === ord._id;
                const addr = ord.deliveryAddress;

                return (
                  <tr key={ord._id}>
                    <td style={{ width: '80px', verticalAlign: 'top' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                        <img
                          src={`/${painting?.imageUrl || 'images/p-001.jpg'}`}
                          alt={painting?.title || 'Artwork'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/favicon.svg';
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'top', minWidth: '180px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                        {painting?.title || ord.paintingId}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                        ID: {ord.paintingId} {painting?.artist && `• Artist: ${painting.artist}`}
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--color-text-main)' }}>
                        ₹{ord.price?.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td style={{ verticalAlign: 'top', color: 'var(--color-text-muted)', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ verticalAlign: 'top', minWidth: '240px' }}>
                      {addr ? (
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.45, color: 'var(--color-text-muted)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                            <User size={13} color="var(--color-terracotta)" />
                            {addr.fullName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '4px', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                            <Phone size={12} />
                            +91 {addr.phone}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                            <MapPin size={13} color="var(--color-terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              {addr.streetAddress}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                              <br />
                              {addr.city}, {addr.state} - <strong style={{ color: 'var(--color-text-main)' }}>{addr.postalCode}</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontStyle: 'italic', backgroundColor: 'var(--color-bg-subtle)', padding: '0.4rem 0.6rem', borderRadius: '4px', display: 'inline-block' }}>
                          Standard dispatch (Studio archive order)
                        </div>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <StatusBadge status={ord.status} />
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {canCancel ? (
                        <button
                          onClick={() => handleCancelOrder(ord._id)}
                          disabled={isCancelling}
                          className="btn btn-danger btn-sm"
                        >
                          <Ban size={14} /> {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
