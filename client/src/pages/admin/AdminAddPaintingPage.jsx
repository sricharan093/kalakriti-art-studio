import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { paintingApi } from '../../api/paintingApi.js';
import {
  ArrowLeft,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  UploadCloud,
  FileImage,
  Camera,
  X,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

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

export const AdminAddPaintingPage = () => {
  const [form, setForm] = useState({
    id: '',
    title: '',
    artist: '',
    price: '',
    category: 'Madhubani',
    dimensions: '',
    medium: '',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup object URL on unmount or file replacement
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndSetFile = (file) => {
    setError('');

    if (!file) return;

    // Validate extension
    const ext = `.${file.name.split('.').pop()}`.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());

    if (!isExtensionValid || !isMimeValid) {
      setError('Unsupported file type. Please choose a valid JPG, JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size limit (5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${sizeMb} MB) exceeds the 5 MB limit. Please select a compressed image.`);
      return;
    }

    // Revoke previous blob if replacing
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localUrl);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleTriggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTriggerCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field validations
    if (!form.title.trim()) {
      setError('Please provide a painting title.');
      return;
    }
    if (!form.artist.trim()) {
      setError('Please provide an artist name.');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Please specify a positive price in INR.');
      return;
    }
    if (!selectedFile) {
      setError('Please select a painting image from your computer before publishing.');
      return;
    }

    try {
      setSubmitting(true);

      // Build Multipart FormData payload
      const formData = new FormData();
      if (form.id.trim()) {
        formData.append('id', form.id.trim());
      }
      formData.append('title', form.title.trim());
      formData.append('artist', form.artist.trim());
      formData.append('price', Number(form.price));
      formData.append('category', form.category);
      formData.append('dimensions', form.dimensions.trim());
      formData.append('medium', form.medium.trim());
      formData.append('description', form.description.trim());
      formData.append('image', selectedFile);

      const res = await paintingApi.createPainting(formData);

      setSuccess(`Painting "${res.painting?.title || form.title}" published to catalogue successfully!`);

      setTimeout(() => {
        navigate('/admin/paintings');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to publish painting. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <Link
        to="/admin/paintings"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--color-text-muted)',
          marginBottom: '1.5rem',
          fontWeight: 500,
          textDecoration: 'none'
        }}
      >
        <ArrowLeft size={16} /> Back to Paintings Catalogue
      </Link>

      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={13} /> Original Studio Masterpiece
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
            Add New Painting to Catalogue
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.94rem' }}>
            Upload an authentic painting image directly from your computer. Once published, it will be immediately available for art collectors in the public store.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '0.9rem 1.2rem',
              backgroundColor: 'var(--color-rose-light)',
              border: '1px solid var(--color-rose-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-rose)',
              fontSize: '0.92rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              padding: '0.9rem 1.2rem',
              backgroundColor: 'var(--color-olive-light)',
              border: '1px solid var(--color-olive-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-olive)',
              fontSize: '0.92rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Prominent Image Upload Section */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileImage size={18} color="var(--color-terracotta)" />
              <span>Upload Painting Image *</span>
            </label>

            {/* Hidden native input for gallery / device file picker */}
            <input
              ref={fileInputRef}
              id="painting-image-file"
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              aria-label="Upload painting image file"
            />

            {/* Hidden native input for mobile camera capture */}
            <input
              ref={cameraInputRef}
              id="painting-camera-file"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              aria-label="Take photo with camera"
            />

            {!selectedFile ? (
              /* Dropzone with Choose Image and Camera Buttons */
              <div
                className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
                onClick={handleTriggerPicker}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTriggerPicker();
                  }
                }}
                aria-label="Drop painting image here or click to choose file"
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-terracotta-light)', color: 'var(--color-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <UploadCloud size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Drag & drop painting photo here
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                  Supports JPG, JPEG, PNG, or WebP up to 5 MB from desktop or mobile
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerPicker();
                    }}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                  >
                    <FileImage size={16} /> Choose Image / Gallery
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerCamera();
                    }}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                  >
                    <Camera size={16} /> Take Photo with Camera
                  </button>
                </div>
              </div>
            ) : (
              /* Live Preview Card */
              <div className="upload-preview-card">
                <div className="upload-thumbnail-box">
                  <img src={previewUrl} alt="Selected painting preview" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedFile.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                      Ready
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'image'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleTriggerPicker}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    >
                      <RefreshCw size={13} /> Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleTriggerCamera}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    >
                      <Camera size={13} /> Retake Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--color-rose)' }}
                    >
                      <X size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="title">Painting Title *</label>
              <input
                id="title"
                type="text"
                required
                className="form-input"
                placeholder="e.g. Madhubani Peacock Garden"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="artist">Artist Name *</label>
              <input
                id="artist"
                type="text"
                required
                className="form-input"
                placeholder="e.g. Meera Kumari"
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="price">Price (INR ₹) *</label>
              <input
                id="price"
                type="number"
                required
                min={1}
                className="form-input"
                placeholder="e.g. 12500"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="category">Art Style / School</label>
              <select
                id="category"
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {ART_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="dimensions">Dimensions</label>
              <input
                id="dimensions"
                type="text"
                className="form-input"
                placeholder="e.g. 45 x 60 cm"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="medium">Medium / Material</label>
              <input
                id="medium"
                type="text"
                className="form-input"
                placeholder="e.g. Natural pigments on handmade cotton paper"
                value={form.medium}
                onChange={(e) => setForm({ ...form, medium: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="id">Custom Identifier (Optional)</label>
            <input
              id="id"
              type="text"
              className="form-input"
              placeholder="e.g. p-013 (Auto-generated if left blank)"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
            />
            <span className="form-hint">Leave blank to auto-generate a unique catalogue ID.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Artwork Description & Curatorial Notes</label>
            <textarea
              id="description"
              rows={3}
              className="form-textarea"
              placeholder="Detailed description of motifs, folk symbolism, and technique used in this painting."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link
              to="/admin/paintings"
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.85rem', textAlign: 'center', justifyContent: 'center' }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ flex: 2, padding: '0.85rem', justifyContent: 'center' }}
            >
              <PlusCircle size={18} />
              {submitting ? 'Uploading & Publishing...' : 'Publish to Catalogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
