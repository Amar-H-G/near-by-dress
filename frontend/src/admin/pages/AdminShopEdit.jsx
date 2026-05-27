import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetShop, adminUpdateShop } from '../services/admin.service.js';
import ShopForm from '../../seller/components/ShopForm';
import ShopLocationPicker from '../../shared/location/components/ShopLocationPicker';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Store, MapPin } from 'lucide-react';

const AdminShopEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [discoveryForm, setDiscoveryForm] = useState({
    isFeatured: false,
    isTrending: false,
    rankingScore: 0,
    visibility: 'public'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminGetShop(id);
        setShop(data.data);
        setDiscoveryForm({
          isFeatured: !!data.data.isFeatured,
          isTrending: !!data.data.isTrending,
          rankingScore: Number(data.data.rankingScore || 0),
          visibility: data.data.visibility || 'public'
        });
      } catch {
        toast.error('Failed to load shop details');
        navigate('/admin/shops');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleUpdate = async (formData, logoFile) => {
    setSubmitting(true);
    const submitData = new FormData();

    // Fields to exclude from update payload (read-only or populated objects)
    const excludeFields = ['owner', '_id', '__v', 'createdAt', 'updatedAt', 'status', 'rejectionReason'];

    Object.entries(formData).forEach(([key, value]) => {
      if (!excludeFields.includes(key) && value !== undefined && value !== null) {
        submitData.append(key, value);
      }
    });

    if (logoFile) submitData.append('logo', logoFile);

    try {
      await adminUpdateShop(id, submitData);
      toast.success('Shop updated successfully');
      navigate('/admin/shops');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDiscovery = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('isFeatured', String(discoveryForm.isFeatured));
      submitData.append('isTrending', String(discoveryForm.isTrending));
      submitData.append('rankingScore', String(discoveryForm.rankingScore));
      submitData.append('visibility', String(discoveryForm.visibility));

      await adminUpdateShop(id, submitData);
      toast.success('Shop discovery options updated successfully');
      const { data } = await adminGetShop(id);
      setShop(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update discovery settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="admin-icon-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="admin-page-title">Edit Shop Details</h1>
            <p className="admin-page-subtitle">Update business information for {shop?.name}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800 }}>
        <div className="admin-section" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div className="admin-modal-icon admin-modal-icon-primary">
              <Store size={20} />
            </div>
            <h2 className="admin-section-title">Shop Information</h2>
          </div>
          
          <div style={{ height: 1, background: 'var(--border)', marginBottom: 32, opacity: 0.5 }} />

          <ShopForm 
            initialData={shop} 
            onSubmit={handleUpdate} 
            loading={submitting}
            showCancel={true}
            onCancel={() => navigate('/admin/shops')}
          />
        </div>

        {/* ── Admin Discovery Placement & Ranking Card ────────────────── */}
        {shop && (
          <div className="admin-section" style={{ padding: 32, marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div className="admin-modal-icon admin-modal-icon-primary" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                <Store size={20} />
              </div>
              <div>
                <h2 className="admin-section-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Discovery & Proximity Settings</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Manage the shop's featured status, search ranking priority, and platform visibility.
                </p>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 32, opacity: 0.5 }} />

            <form onSubmit={handleUpdateDiscovery} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Platform Visibility</label>
                  <select
                    className="input"
                    value={discoveryForm.visibility}
                    onChange={(e) => setDiscoveryForm(prev => ({ ...prev, visibility: e.target.value }))}
                    style={{ height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    <option value="public">Public (Visible in public listing/proximity feed)</option>
                    <option value="hidden">Hidden (Completely excluded from public searches/feeds)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Search Ranking Priority Score</label>
                  <input
                    type="number"
                    className="input"
                    value={discoveryForm.rankingScore}
                    onChange={(e) => setDiscoveryForm(prev => ({ ...prev, rankingScore: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    style={{ height: 42, padding: '0 12px', borderRadius: 8, fontSize: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.7 }}>
                    Higher value ranks the shop higher in public proximity discovery feeds.
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none', background: 'var(--surface-2)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={discoveryForm.isFeatured}
                    onChange={(e) => setDiscoveryForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, display: 'block', color: 'var(--text)' }}>Featured Shop</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Places shop inside featured carousel sliders.</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none', background: 'var(--surface-2)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={discoveryForm.isTrending}
                    onChange={(e) => setDiscoveryForm(prev => ({ ...prev, isTrending: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, display: 'block', color: 'var(--text)' }}>Trending Shop</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Flags the shop as trending on the discovery rail.</span>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
                >
                  Save Discovery Placement
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Admin Location Control & Map Placement Card ────────────────── */}
        {shop && (
          <div className="admin-section" style={{ padding: 32, marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div className="admin-modal-icon admin-modal-icon-primary" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="admin-section-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Geospatial Control & Validation</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Assign coordinates, verify map pin placement, and update pincode or delivery coverage boundaries.
                </p>
              </div>
            </div>
            
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 32, opacity: 0.5 }} />

            <ShopLocationPicker
              shop={shop}
              onSaved={async () => {
                // Refresh shop details from backend to ensure data remains perfectly in sync
                const { data } = await adminGetShop(id);
                setShop(data.data);
              }}
              readOnly={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShopEdit;
