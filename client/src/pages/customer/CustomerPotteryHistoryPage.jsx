import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { potteryApi } from '../../api/potteryApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { Modal } from '../../components/Modal.jsx';
import { Coffee, Edit2, Ban, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

export const CustomerPotteryHistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [options, setOptions] = useState({ items: [], glazes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Edit Modal State
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm, setEditForm] = useState({ itemId: '', glazeId: '', quantity: 1, neededByDate: '', notes: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqData, optData] = await Promise.all([
        potteryApi.getMyRequests(),
        potteryApi.getOptions()
      ]);
      setRequests(reqData.requests || []);
      setOptions(optData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openEditModal = (req) => {
    setEditingRequest(req);
    setEditForm({
      itemId: req.item?.id || '',
      glazeId: req.glaze?.id || '',
      quantity: req.quantity,
      neededByDate: req.neededByDate,
      notes: req.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      setSavingEdit(true);
      await potteryApi.updateRequest(editingRequest._id, {
        itemId: editForm.itemId,
        glazeId: editForm.glazeId,
        quantity: Number(editForm.quantity),
        neededByDate: editForm.neededByDate,
        notes: editForm.notes
      });
      setFeedback({ type: 'success', text: 'Pottery request updated successfully!' });
      setEditingRequest(null);
      await fetchRequests();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancel = async (id) => {
    const confirm = window.confirm('Are you sure you want to cancel this pottery request?');
    if (!confirm) return;

    try {
      setFeedback(null);
      await potteryApi.cancelRequest(id);
      setFeedback({ type: 'success', text: 'Pottery request cancelled successfully.' });
      await fetchRequests();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  if (loading) return <LoadingSpinner message="Loading your pottery requests..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRequests} />;

  // Earliest date constraint for edit modal (14 days ahead)
  const today = new Date();
  const minD = new Date(today);
  minD.setDate(today.getDate() + 14);
  const minDateStr = minD.toISOString().split('T')[0];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>My Custom Pottery Requests</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
            Track the artisan crafting progress of your glazed ceramic commissions.
          </p>
        </div>
        <Link to="/customer/pottery-request" className="btn btn-primary">
          <Coffee size={16} /> Commission New Item
        </Link>
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
          title="No pottery commissions yet"
          description="You haven't requested any custom glazed pottery items. Choose from our authentic artisan clay forms."
          actionText="Request Custom Pottery"
          actionLink="/customer/pottery-request"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pottery Item</th>
                <th>Selected Glaze</th>
                <th>Quantity</th>
                <th>Needed By</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const canModify = req.status === 'requested';

                return (
                  <tr key={req._id}>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{req.item?.name}</strong>
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
                      <strong>{req.quantity}</strong> {req.quantity === 1 ? 'unit' : 'units'}
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
                      {canModify ? (
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditModal(req)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleCancel(req._id)}
                            className="btn btn-danger btn-sm"
                          >
                            <Ban size={13} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                          Locked ({req.status})
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

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingRequest}
        onClose={() => setEditingRequest(null)}
        title="Modify Pottery Request"
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label className="form-label">Pottery Form</label>
            <select
              value={editForm.itemId}
              onChange={(e) => setEditForm({ ...editForm, itemId: e.target.value })}
              className="form-select"
              required
            >
              {options.items.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Glaze</label>
            <select
              value={editForm.glazeId}
              onChange={(e) => setEditForm({ ...editForm, glazeId: e.target.value })}
              className="form-select"
              required
            >
              {options.glazes.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity (1 to 12)</label>
            <input
              type="number"
              min={1}
              max={12}
              value={editForm.quantity}
              onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Needed-by Date</label>
            <input
              type="date"
              min={minDateStr}
              value={editForm.neededByDate}
              onChange={(e) => setEditForm({ ...editForm, neededByDate: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              rows={2}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setEditingRequest(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="btn btn-primary"
            >
              {savingEdit ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
