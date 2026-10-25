import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { ShoppingBag, MapPin, Phone, User, X, Eye } from 'lucide-react';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectingOrder, setInspectingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAllOrdersAdmin();
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

  if (loading) return <LoadingSpinner message="Fetching all client orders..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>All Client Painting Orders</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          Complete ledger of original artwork purchases, collector addresses, and active fulfillment statuses.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No customer orders recorded"
          description="When clients purchase artwork from the catalogue, orders will appear here."
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Client Account</th>
                <th>Painting Details</th>
                <th>Delivery Destination</th>
                <th>Price Snapshot</th>
                <th>Date Placed</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                const customer = ord.customer;
                const painting = ord.painting;
                const addr = ord.deliveryAddress;

                return (
                  <tr key={ord._id}>
                    <td style={{ width: '60px', verticalAlign: 'top' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
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
                    <td style={{ verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600 }}>{customer?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        {customer?.email}
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600 }}>{painting?.title || ord.paintingId}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        Art ID: {ord.paintingId}
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'top', minWidth: '220px' }}>
                      {addr ? (
                        <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                            {addr.fullName}
                          </div>
                          <div style={{ color: 'var(--color-text-muted)' }}>
                            {addr.city}, {addr.state} ({addr.postalCode})
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                            +91 {addr.phone}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                          Legacy order (no address)
                        </span>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '1rem' }}>₹{ord.price?.toLocaleString('en-IN')}</strong>
                    </td>
                    <td style={{ verticalAlign: 'top', color: 'var(--color-text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <StatusBadge status={ord.status} />
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setInspectingOrder(ord)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Inspect full delivery and order snapshot"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Delivery Details Inspection Modal */}
      {inspectingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-order-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 25, 23, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.25rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectingOrder(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '560px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-subtle)'
            }}>
              <div>
                <h2 id="admin-order-modal-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
                  Order & Delivery Inspection
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                  Order Ref: {inspectingOrder._id}
                </div>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '0.35rem',
                  display: 'flex',
                  borderRadius: '50%'
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Artwork Summary */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                alignItems: 'center'
              }}>
                <img
                  src={`/${inspectingOrder.painting?.imageUrl || 'images/p-001.jpg'}`}
                  alt={inspectingOrder.painting?.title || 'Painting'}
                  style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/favicon.svg';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                    {inspectingOrder.painting?.title || inspectingOrder.paintingId}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                    Catalog Ref: {inspectingOrder.paintingId} • Artist: {inspectingOrder.painting?.artist || 'Artisan'}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-terracotta)', marginTop: '2px' }}>
                    ₹{inspectingOrder.price?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <StatusBadge status={inspectingOrder.status} />
                </div>
              </div>

              {/* Delivery Address Section */}
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                backgroundColor: 'var(--color-bg-subtle)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-terracotta)',
                  marginBottom: '1rem'
                }}>
                  <MapPin size={16} />
                  Delivery Destination Details
                </div>

                {inspectingOrder.deliveryAddress ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.92rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={15} color="var(--color-text-light)" />
                      <span>Recipient: <strong style={{ color: 'var(--color-text-main)' }}>{inspectingOrder.deliveryAddress.fullName}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={15} color="var(--color-text-light)" />
                      <span>Contact Phone: <strong style={{ color: 'var(--color-text-main)' }}>+91 {inspectingOrder.deliveryAddress.phone}</strong></span>
                    </div>

                    <div style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)' }}>
                      <div style={{ color: 'var(--color-text-light)', fontSize: '0.8rem', marginBottom: '2px' }}>Street & Premises:</div>
                      <div style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>
                        {inspectingOrder.deliveryAddress.streetAddress}
                      </div>
                      {inspectingOrder.deliveryAddress.addressLine2 && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                          {inspectingOrder.deliveryAddress.addressLine2}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <div>
                        <div style={{ color: 'var(--color-text-light)', fontSize: '0.78rem' }}>City</div>
                        <div style={{ fontWeight: 600 }}>{inspectingOrder.deliveryAddress.city}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--color-text-light)', fontSize: '0.78rem' }}>State</div>
                        <div style={{ fontWeight: 600 }}>{inspectingOrder.deliveryAddress.state}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--color-text-light)', fontSize: '0.78rem' }}>PIN Code</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-terracotta)' }}>{inspectingOrder.deliveryAddress.postalCode}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                    No delivery address was recorded for this legacy order. Customer acquired the artwork under direct gallery pickup protocol.
                  </div>
                )}
              </div>

              {/* Customer Account Details */}
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-bg-subtle)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <div><strong>Account Holder:</strong> {inspectingOrder.customer?.name || 'Customer'}</div>
                <div><strong>Email:</strong> {inspectingOrder.customer?.email || 'N/A'}</div>
                <div><strong>Purchased On:</strong> {new Date(inspectingOrder.createdAt).toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--color-bg-subtle)'
            }}>
              <button
                onClick={() => setInspectingOrder(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
