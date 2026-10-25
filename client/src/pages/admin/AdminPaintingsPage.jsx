import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { paintingApi } from '../../api/paintingApi.js';
import { getArtworkUrl, handleImageError } from '../../utils/imageUrl.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Palette,
  PlusCircle,
  Edit3,
  Trash2,
  Lock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  FileImage,
  RefreshCw,
  ExternalLink,
  Layers,
  LayoutGrid,
  List,
  RotateCcw,
  Archive,
  Tag,
  Maximize2
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ART_STYLES = [
  'Madhubani',
  'Warli',
  'Tanjore',
  'Pattachitra',
  'Kalamkari',
  'Gond',
  'Cheriyal',
  'Rajasthani Miniature',
  'Pichwai',
  'Nirmal',
  'Kerala Mural',
  'Contemporary Indian Folk',
  'Bespoke Canvas'
];

export const AdminPaintingsPage = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Edit Modal State
  const [editingPainting, setEditingPainting] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    artist: '',
    price: '',
    description: '',
    category: '',
    dimensions: '',
    medium: '',
    status: 'available',
    imageUrl: ''
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef(null);

  // Delete / Remove Modal State
  const [deletingPainting, setDeletingPainting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Inspect / Detail Modal
  const [inspectingPainting, setInspectingPainting] = useState(null);

  // Restore State
  const [restoringId, setRestoringId] = useState(null);

  const fetchPaintings = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all paintings including archived for administrator management
      const data = await paintingApi.getPaintings({ includeArchived: 'true' });
      setPaintings(data.paintings || []);
    } catch (err) {
      setError(err.message || 'Failed to load paintings inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaintings();
  }, []);

  // Cleanup edit image preview on close
  useEffect(() => {
    return () => {
      if (editImagePreview && editImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

  const openEditModal = (p) => {
    setEditingPainting(p);
    setEditForm({
      title: p.title || '',
      artist: p.artist || '',
      price: p.price || '',
      description: p.description || '',
      category: p.category || '',
      dimensions: p.dimensions || '',
      medium: p.medium || '',
      status: p.status || 'available',
      imageUrl: p.imageUrl || ''
    });
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert('File size exceeds 5MB limit. Please choose an image smaller than 5 MB.');
      return;
    }

    if (editImagePreview && editImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(editImagePreview);
    }

    const localUrl = URL.createObjectURL(file);
    setEditImageFile(file);
    setEditImagePreview(localUrl);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPainting) return;

    try {
      setSavingEdit(true);

      const targetId = editingPainting.id || editingPainting._id;

      if (editImageFile) {
        // Multipart payload when image is replaced
        const formData = new FormData();
        formData.append('title', editForm.title.trim());
        formData.append('artist', editForm.artist.trim());
        formData.append('price', Number(editForm.price));
        formData.append('description', editForm.description.trim());
        if (editForm.category) formData.append('category', editForm.category.trim());
        if (editForm.dimensions) formData.append('dimensions', editForm.dimensions.trim());
        if (editForm.medium) formData.append('medium', editForm.medium.trim());
        formData.append('status', editForm.status);
        formData.append('image', editImageFile);

        await paintingApi.updatePainting(targetId, formData);
      } else {
        // Standard JSON payload
        await paintingApi.updatePainting(targetId, {
          title: editForm.title.trim(),
          artist: editForm.artist.trim(),
          price: Number(editForm.price),
          description: editForm.description.trim(),
          category: editForm.category?.trim(),
          dimensions: editForm.dimensions?.trim(),
          medium: editForm.medium?.trim(),
          status: editForm.status,
          imageUrl: editForm.imageUrl
        });
      }

      setFeedback({ type: 'success', text: `Painting "${editForm.title}" updated successfully.` });
      setEditingPainting(null);
      await fetchPaintings();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update painting.' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPainting) return;

    try {
      setDeletingLoading(true);
      const targetId = deletingPainting.id || deletingPainting._id;
      const res = await paintingApi.deletePainting(targetId);

      setFeedback({
        type: 'success',
        text: res.message || `Painting "${deletingPainting.title}" removed from active catalogue.`
      });

      setDeletingPainting(null);
      await fetchPaintings();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to delete painting.'
      });
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleRestore = async (p) => {
    try {
      const targetId = p.id || p._id;
      setRestoringId(targetId);
      const res = await paintingApi.restorePainting(targetId);

      setFeedback({
        type: 'success',
        text: res.message || `Painting "${p.title}" restored to the active catalogue.`
      });

      await fetchPaintings();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to restore painting.'
      });
    } finally {
      setRestoringId(null);
    }
  };

  // Filter and search calculations
  const filteredPaintings = useMemo(() => {
    return paintings.filter((p) => {
      let matchesStatus = true;
      if (statusFilter === 'archived') {
        matchesStatus = p.status === 'archived' || p.isArchived === true;
      } else if (statusFilter !== 'all') {
        matchesStatus = p.status === statusFilter && !p.isArchived;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.artist?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [paintings, searchQuery, statusFilter]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      all: paintings.length,
      available: paintings.filter((p) => p.status === 'available' && !p.isArchived).length,
      sold: paintings.filter((p) => p.status === 'sold' && !p.isArchived).length,
      archived: paintings.filter((p) => p.status === 'archived' || p.isArchived === true).length
    };
  }, [paintings]);

  if (loading) return <LoadingSpinner message="Loading studio painting inventory from database..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPaintings} />;

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '0.5rem' }}>
            <Palette size={13} /> Studio Artwork Inventory
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>
            Paintings Catalogue Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
            Authoritative studio inventory: view, edit, upload, and safely remove or archive paintings from the collectors catalogue.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 0, border: 'none', padding: '0.45rem 0.75rem' }}
              title="Table view"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 0, border: 'none', padding: '0.45rem 0.75rem' }}
              title="Gallery grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <Link to="/admin/add-painting" className="btn btn-primary">
            <PlusCircle size={16} /> Add New Painting
          </Link>
        </div>
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

      {/* Controls Bar: Search & Status Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--color-bg-card)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem', height: '40px', fontSize: '0.88rem' }}
            placeholder="Search by title, artist, style, or identifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter size={15} color="var(--color-text-light)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Filter:</span>
          {['all', 'available', 'sold', 'archived'].map((status) => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--color-terracotta)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-terracotta-light)' : 'transparent',
                  color: isSelected ? 'var(--color-terracotta)' : 'var(--color-text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status} ({counts[status] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {paintings.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No paintings in studio database"
          description="The catalogue is empty. Upload paintings from your computer or phone camera."
          actionText="Add First Painting"
          actionLink="/admin/add-painting"
        />
      ) : filteredPaintings.length === 0 ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Palette size={36} color="var(--color-text-light)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No matching artworks found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            No paintings matched your search query "{searchQuery}" and status filter "{statusFilter}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="btn btn-secondary btn-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Identifier & Title</th>
                <th>Artist & Style</th>
                <th>Dimensions</th>
                <th>Price (INR)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaintings.map((p) => {
                const isArchived = p.status === 'archived' || p.isArchived === true;

                return (
                  <tr key={p.id || p._id} style={{ opacity: isArchived ? 0.75 : 1 }}>
                    <td style={{ width: '70px' }}>
                      <div
                        onClick={() => setInspectingPainting(p)}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: 'var(--color-bg-subtle)',
                          cursor: 'pointer',
                          border: '1px solid var(--color-border)',
                          transition: 'transform 0.15s ease'
                        }}
                        title="Click to preview artwork photo"
                      >
                        <img
                          src={getArtworkUrl(p.imageUrl)}
                          alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={handleImageError}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>
                        ID: {p.id}
                      </div>
                    </td>
                    <td>
                      <div>{p.artist}</div>
                      {p.category && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-terracotta)', fontWeight: 600 }}>
                          {p.category}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {p.dimensions || 'Standard Canvas'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem' }}>₹{p.price?.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      {isArchived ? (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            backgroundColor: 'var(--color-bg-subtle)',
                            color: 'var(--color-text-muted)',
                            border: '1px solid var(--color-border)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Archive size={12} /> Archived
                        </span>
                      ) : (
                        <StatusBadge status={p.status} />
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                        <button
                          type="button"
                          onClick={() => setInspectingPainting(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Preview details"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Edit painting details"
                        >
                          <Edit3 size={14} /> Edit
                        </button>

                        {isArchived ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(p)}
                            disabled={restoringId === (p.id || p._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-olive)' }}
                            title="Restore painting to active catalogue"
                          >
                            <RotateCcw size={14} /> {restoringId === (p.id || p._id) ? 'Restoring...' : 'Restore'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingPainting(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-rose)' }}
                            title="Remove or archive painting from catalogue"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Gallery Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
          {filteredPaintings.map((p) => {
            const isArchived = p.status === 'archived' || p.isArchived === true;

            return (
              <div
                key={p.id || p._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: 0,
                  opacity: isArchived ? 0.75 : 1
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '210px',
                    backgroundColor: 'var(--color-bg-subtle)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setInspectingPainting(p)}
                >
                  <img
                    src={getArtworkUrl(p.imageUrl)}
                    alt={p.title}
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    {isArchived ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#FFFFFF'
                        }}
                      >
                        Archived
                      </span>
                    ) : (
                      <StatusBadge status={p.status} />
                    )}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
                    {p.id}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem', lineHeight: 1.3 }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                    By {p.artist} {p.category ? `• ${p.category}` : ''}
                  </div>
                  {p.dimensions && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      Dimensions: {p.dimensions}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      ₹{p.price?.toLocaleString('en-IN')}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem' }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>

                      {isArchived ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(p)}
                          disabled={restoringId === (p.id || p._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem', color: 'var(--color-olive)' }}
                          title="Restore painting"
                        >
                          <RotateCcw size={13} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingPainting(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem', color: 'var(--color-rose)' }}
                          title="Remove painting"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete / Remove Confirmation Modal */}
      {deletingPainting && (
        <Modal
          isOpen={!!deletingPainting}
          onClose={() => !deletingLoading && setDeletingPainting(null)}
          title="Confirm Painting Removal"
        >
          <div>
            <div
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                border: '1px solid var(--color-border)'
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <img
                  src={getArtworkUrl(deletingPainting.imageUrl)}
                  alt={deletingPainting.title}
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{deletingPainting.title}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  By <strong>{deletingPainting.artist}</strong> • Price: <strong>₹{deletingPainting.price?.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                  ID: {deletingPainting.id}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-ochre-light)',
                border: '1px solid var(--color-ochre)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              <AlertTriangle size={20} color="var(--color-ochre)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                <strong>Customer Catalogue Impact:</strong>
                <p style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  This painting will immediately disappear from the active customer catalogue, search results, and category filters. Customers will no longer be able to purchase it.
                </p>
                <strong>Studio Order Preservation Rule:</strong>
                <p style={{ marginTop: '0.25rem', margin: 0 }}>
                  If this painting has existing customer orders, it will be safely <em>archived</em> to preserve order and invoice records. If it has no orders, it will be permanently deleted from the database and storage.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeletingPainting(null)}
                disabled={deletingLoading}
                className="btn btn-secondary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingLoading}
                className="btn btn-sm"
                style={{
                  backgroundColor: 'var(--color-rose)',
                  color: '#FFFFFF',
                  borderColor: 'var(--color-rose)',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Trash2 size={16} />
                {deletingLoading ? 'Removing Painting...' : 'Confirm Remove Painting'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Painting Modal */}
      {editingPainting && (
        <Modal
          isOpen={!!editingPainting}
          onClose={() => !savingEdit && setEditingPainting(null)}
          title={`Edit Artwork: ${editingPainting.title} (${editingPainting.id})`}
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Artist *</label>
                <input
                  type="text"
                  required
                  value={editForm.artist}
                  onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (INR ₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Style / School</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select Style</option>
                  {ART_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Availability Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="form-select"
                >
                  <option value="available">Available (Public Catalogue)</option>
                  <option value="sold">Sold</option>
                  <option value="archived">Archived (Hidden from Public)</option>
                </select>
              </div>
            </div>

            {/* Image Replacement Section */}
            <div className="form-group">
              <label className="form-label">Artwork Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--color-border)' }}>
                  <img
                    src={editImagePreview || getArtworkUrl(editForm.imageUrl)}
                    alt="Artwork preview"
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                    {editImageFile ? `New file chosen: ${editImageFile.name}` : `Current: ${editForm.imageUrl}`}
                  </div>

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp"
                    onChange={handleEditFileChange}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                  >
                    <FileImage size={14} /> Choose New Image / Photo
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Dimensions</label>
                <input
                  type="text"
                  placeholder="e.g. 50 x 70 cm"
                  value={editForm.dimensions}
                  onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medium / Material</label>
                <input
                  type="text"
                  placeholder="e.g. Natural vegetable dyes on paper"
                  value={editForm.medium}
                  onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description & Curatorial Notes</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button
                type="button"
                onClick={() => setEditingPainting(null)}
                className="btn btn-secondary"
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="btn btn-primary"
              >
                {savingEdit ? 'Saving Updates...' : 'Save Painting Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Inspect Painting Modal */}
      {inspectingPainting && (
        <Modal
          isOpen={!!inspectingPainting}
          onClose={() => setInspectingPainting(null)}
          title={`Artwork Details: ${inspectingPainting.title}`}
        >
          <div>
            <div
              style={{
                width: '100%',
                maxHeight: '340px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '1.25rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)'
              }}
            >
              <img
                src={getArtworkUrl(inspectingPainting.imageUrl)}
                alt={inspectingPainting.title}
                onError={handleImageError}
                style={{ width: '100%', height: '100%', maxHeight: '340px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{inspectingPainting.title}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  By <strong>{inspectingPainting.artist}</strong> • Identifier: <code>{inspectingPainting.id}</code>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  ₹{inspectingPainting.price?.toLocaleString('en-IN')}
                </div>
                {inspectingPainting.status === 'archived' || inspectingPainting.isArchived ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                    ARCHIVED
                  </span>
                ) : (
                  <StatusBadge status={inspectingPainting.status} />
                )}
              </div>
            </div>

            {inspectingPainting.description && (
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {inspectingPainting.description}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              {inspectingPainting.category && (
                <div>
                  <span style={{ color: 'var(--color-text-light)' }}>Style:</span> <strong>{inspectingPainting.category}</strong>
                </div>
              )}
              {inspectingPainting.dimensions && (
                <div>
                  <span style={{ color: 'var(--color-text-light)' }}>Dimensions:</span> <strong>{inspectingPainting.dimensions}</strong>
                </div>
              )}
              {inspectingPainting.medium && (
                <div>
                  <span style={{ color: 'var(--color-text-light)' }}>Medium:</span> <strong>{inspectingPainting.medium}</strong>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--color-text-light)' }}>Image Path:</span> <code style={{ fontSize: '0.75rem' }}>{inspectingPainting.imageUrl}</code>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Link
                to={`/paintings/${inspectingPainting.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>View Public Page</span>
                <ExternalLink size={13} />
              </Link>
              <button
                type="button"
                onClick={() => setInspectingPainting(null)}
                className="btn btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
