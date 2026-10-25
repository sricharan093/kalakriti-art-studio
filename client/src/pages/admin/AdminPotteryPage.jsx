import React, { useEffect, useState } from 'react';
import { potteryApi } from '../../api/potteryApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { Coffee, Calendar, Check, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminPotteryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await potteryApi.getAllRequestsAdmin();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      setProcessingId(id);
      setFeedback(null);
      if (decision === 'accept') {
        await potteryApi.acceptRequestAdmin(id);
        setFeedback({ type: 'success', text: 'Custom pottery commission accepted and queued for kiln studio.' });
      } else {
        await potteryApi.declineRequestAdmin(id);
        setFeedback({ type: 'success', text: 'Custom pottery commission declined.' });
      }
      await fetchRequests();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching all client pottery requests..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRequests} />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>All Custom Pottery Requests</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          Review artisan pottery commissions, verify clay form and mineral glaze requests, and accept or decline.
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

      {requests.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title="No pottery commissions submitted"
          description="Client requests for custom glazed pottery will appear here for review."
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Pottery Item</th>
                <th>Selected Glaze</th>
                <th>Quantity</th>
                <th>Needed By</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Admin Decision</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const isPending = req.status === 'requested';
                const isProcessing = processingId === req._id;

                return (
                  <tr key={req._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.customer?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        {req.customer?.email}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.92rem' }}>{req.item?.name}</strong>
                      {req.notes && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.2rem' }}>
                          Note: "{req.notes}"
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '0.25rem 0.6rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {req.glaze?.name}
                      </span>
                    </td>
                    <td>
                      <strong>{req.quantity}</strong> units
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-main)' }}>
                        <Calendar size={14} color="var(--color-ochre)" />
                        <span>{req.neededByDate}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isPending ? (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleDecision(req._id, 'accept')}
                            disabled={isProcessing}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--color-sage)' }}
                            title="Accept Commission"
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            onClick={() => handleDecision(req._id, 'decline')}
                            disabled={isProcessing}
                            className="btn btn-danger btn-sm"
                            title="Decline Commission"
                          >
                            <X size={14} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                          Decision recorded
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
