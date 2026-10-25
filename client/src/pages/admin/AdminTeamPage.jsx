import React, { useEffect, useState } from 'react';
import { authApi } from '../../api/authApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Mail,
  Lock,
  Phone,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminTeamPage = () => {
  const { user: currentUser } = useAuth();
  const [administrators, setAdministrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Provisioning Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.getAdministrators();
      setAdministrators(res.administrators || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve administrator accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenModal = () => {
    setForm({ name: '', email: '', password: '', phone: '' });
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleProvision = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || form.name.trim().length < 2) {
      setFormError('Please provide a valid full name (at least 2 characters).');
      return;
    }

    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setFormError('Please provide a valid email address.');
      return;
    }

    if (!form.password || form.password.length < 8) {
      setFormError('Password must be at least 8 characters long for studio security.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authApi.createAdministrator({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim()
      });

      setFeedback({
        type: 'success',
        text: res.message || `Administrator account for "${form.email}" provisioned successfully.`
      });

      setIsModalOpen(false);
      await fetchAdmins();
    } catch (err) {
      setFormError(err.message || 'Failed to provision administrator account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading studio administrator accounts..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAdmins} />;

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Editorial Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={13} /> Studio Access & RBAC
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>
            Studio Administrator Accounts
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
            Authorized administrator personnel who manage studio paintings, client orders, wall bookings, and pottery requests.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={16} /> Add Administrator
        </button>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          style={{
            padding: '0.9rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: feedback.type === 'success' ? 'var(--color-olive-light)' : 'var(--color-rose-light)',
            color: feedback.type === 'success' ? 'var(--color-olive)' : 'var(--color-rose)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--color-olive-border)' : 'var(--color-rose-border)'}`
          }}
        >
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-terracotta-light)',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Administrators
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {administrators.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Independent accounts with full studio rights
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-olive-light)',
              color: 'var(--color-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <KeyRound size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Security Architecture
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-olive)' }}>
              Bcrypt & HttpOnly JWT
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Strict role-based backend authorization
            </div>
          </div>
        </div>
      </div>

      {/* Administrators Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Active Studio Administrators</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Shared Management: All changes to paintings and orders synchronize across administrators
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Date Added</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {administrators.map((admin) => {
                const isCurrent = currentUser && (currentUser.email === admin.email || currentUser.id === admin.id || currentUser._id === admin._id);

                return (
                  <tr key={admin.id || admin._id || admin.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-bg-subtle)',
                            color: 'var(--color-terracotta)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                            {admin.name} {isCurrent && <span style={{ fontSize: '0.72rem', color: 'var(--color-terracotta)', fontWeight: 700, marginLeft: '0.35rem' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>
                            ID: {admin.id || admin._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{admin.email}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {admin.phone || '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-terracotta-light)',
                          color: 'var(--color-terracotta)',
                          border: '1px solid var(--color-terracotta-border)',
                          letterSpacing: '0.04em'
                        }}
                      >
                        ADMIN
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Initial Seed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.78rem',
                          color: 'var(--color-olive)',
                          fontWeight: 600
                        }}
                      >
                        <CheckCircle size={13} /> Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => !submitting && setIsModalOpen(false)}
          title="Provision New Studio Administrator"
        >
          <form onSubmit={handleProvision}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Create an independent administrator account. The new administrator can log in using their own email and password to manage paintings, client orders, and studio bookings.
            </p>

            {formError && (
              <div
                role="alert"
                style={{
                  padding: '0.8rem 1rem',
                  backgroundColor: 'var(--color-rose-light)',
                  border: '1px solid var(--color-rose-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-rose)',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="admin-name">Administrator Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                <input
                  id="admin-name"
                  type="text"
                  required
                  placeholder="e.g. Curator Ananya Sharma"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Administrator Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="e.g. ananya@artstudio.in"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <span className="form-hint">Must be a unique email address used for independent login.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Administrator Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-light)'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="form-hint">Minimum 8 characters. Will be hashed with bcrypt (10 rounds).</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-phone">Contact Phone (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                <input
                  id="admin-phone"
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <UserPlus size={16} />
                {submitting ? 'Provisioning Account...' : 'Provision Administrator'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
