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

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminGetShop(id);
        setShop(data.data);
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
