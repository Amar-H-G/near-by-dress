import { Link } from 'react-router-dom';
import { useSellerProducts } from '../hooks/useSellerProducts';
import { deleteSellerProduct } from '../services/sellerApi';
import Pagination from '../../../shared/components/Pagination';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const { products, loading, pagination, setParams, refresh } = useSellerProducts();

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteSellerProduct(id);
      toast.success('Product deleted');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>My Products</h2>
        <Link to="/seller/add-product" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: 14 }}>
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
        ) : products.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            No products found. Start by adding your first product.
          </div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img 
                            src={(typeof product.images?.[0] === 'object' ? product.images[0]?.url : product.images?.[0]) || 'https://placehold.co/40x40'} 
                            alt={product.name} 
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} 
                          />
                          <span style={{ fontWeight: 500, color: 'var(--text)' }}>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                      <td>
                        {product.discountPrice ? (
                          <span>₹{product.discountPrice} <span style={{ textDecoration: 'line-through', color: 'var(--text-faint)', fontSize: 12 }}>₹{product.price}</span></span>
                        ) : (
                          <span>₹{product.price}</span>
                        )}
                      </td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`badge badge-${product.isActive ? 'approved' : 'pending'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/seller/products/edit/${product._id}`} className="btn btn-ghost" style={{ padding: 6, display: 'inline-flex', marginRight: 8 }}>
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="btn btn-ghost" style={{ padding: 6, color: '#EF4444' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination.totalPages > 1 && (
              <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
