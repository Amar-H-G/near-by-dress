import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { updateSellerProduct, getSellerProducts } from '../services/sellerApi';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Technically we should have a getProductById, but since we have getSellerProducts
        // we can fetch by id or search, or just rely on a shared service.
        // For simplicity we will assume we have the data or fetch it from a public route if needed
        // But since this is a seller context, let's fetch from public route for now
        // Wait, best is to have getProductById. Let's just fetch from the public shared route:
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${id}`);
        const data = await response.json();
        setProduct(data.data);
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/seller/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await updateSellerProduct(id, formData);
      toast.success('Product updated successfully!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Loader2 className="animate-spin" size={40} /></div>;
  if (!product) return null;

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Edit Product</h2>
      <div className="card">
        <ProductForm initialData={product} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default EditProduct;
