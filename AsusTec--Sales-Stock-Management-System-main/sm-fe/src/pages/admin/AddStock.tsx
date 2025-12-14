import React, { useState, useEffect } from 'react';
import { Archive, Package, Hash, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface Product {
  codepdt: string;
  nompdt: string;
  prixpdt: number;
}

export default function AddStock() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    codestock: '',
    codepdt: '',
    qtepdt: ''
  });

  // Fetch products from Commercial Service
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('http://localhost:8081/api/commercial/produits');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError('Unable to load products from Commercial Service');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.codestock || !formData.codepdt || !formData.qtepdt) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (parseInt(formData.qtepdt) <= 0) {
      setError('Quantity must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8082/api/stock/produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codestock: formData.codestock,
          codepdt: formData.codepdt,
          qtepdt: parseInt(formData.qtepdt)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add stock' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const selectedProduct = products.find(p => p.codepdt === formData.codepdt);
      setSuccess(`Stock added successfully! ${formData.qtepdt} units of "${selectedProduct?.nompdt}" added.`);
      
      // Reset form
      setFormData({
        codestock: '',
        codepdt: '',
        qtepdt: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error connecting to Stock Service');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.codepdt === formData.codepdt);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-gray-900">Add Stock</h1>
        <p className="text-gray-600 mt-2">Add stock quantity for existing products</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-green-800">{success}</p>
            <p className="text-green-700 mt-1">Redirecting to products list...</p>
          </div>
        </div>
      )}

      <Card>
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600 mr-3" size={24} />
            <p className="text-gray-600">Loading products from Commercial Service...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-600 mb-4">No products available. Please create a product first.</p>
            <Button onClick={() => navigate('/admin/products/create')}>
              Create Product
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Archive className="absolute left-3 top-11 text-gray-400" size={20} />
                <Input
                  label="Stock Code"
                  name="codestock"
                  type="text"
                  placeholder="e.g., STK-001"
                  value={formData.codestock}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
                <p className="text-gray-500 mt-1">Unique identifier for this stock entry</p>
              </div>

              <div className="relative">
                <Hash className="absolute left-3 top-11 text-gray-400" size={20} />
                <Input
                  label="Quantity"
                  name="qtepdt"
                  type="number"
                  min="1"
                  placeholder="e.g., 100"
                  value={formData.qtepdt}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
                <p className="text-gray-500 mt-1">Number of units to add</p>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Select Product <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={20} />
                <select
                  name="codepdt"
                  value={formData.codepdt}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">-- Select a product --</option>
                  {products.map((product) => (
                    <option key={product.codepdt} value={product.codepdt}>
                      {product.codepdt} - {product.nompdt} (${product.prixpdt.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-gray-500 mt-1">Choose the product to add stock for</p>
            </div>

            {selectedProduct && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-900 mb-2">Selected Product Details</h3>
                <div className="space-y-1">
                  <p className="text-blue-800">
                    <strong>Code:</strong> {selectedProduct.codepdt}
                  </p>
                  <p className="text-blue-800">
                    <strong>Name:</strong> {selectedProduct.nompdt}
                  </p>
                  <p className="text-blue-800">
                    <strong>Price:</strong> ${selectedProduct.prixpdt.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-gray-900 mb-3">Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock Code:</span>
                  <span className="text-gray-900">{formData.codestock || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Code:</span>
                  <span className="text-gray-900">{formData.codepdt || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity to Add:</span>
                  <span className="text-gray-900">
                    {formData.qtepdt ? `${formData.qtepdt} units` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 py-3"
              >
                {loading ? 'Adding Stock...' : 'Add Stock'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/products')}
                className="px-8 py-3"
              >
                Cancel
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Note:</strong> This will add stock to the Stock Service (Port 8082).
                The product must already exist in the Commercial Service.
              </p>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
