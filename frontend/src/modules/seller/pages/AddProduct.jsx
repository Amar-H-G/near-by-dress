import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { addSellerProduct } from '../services/sellerApi';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await addSellerProduct(formData);
      toast.success('Product added successfully!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Add New Product</h2>
      <div className="card">
        <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default AddProduct;
