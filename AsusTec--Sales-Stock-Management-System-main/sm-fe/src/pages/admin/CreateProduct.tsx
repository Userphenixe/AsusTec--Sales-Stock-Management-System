import React, { useState } from 'react';
import { Package, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    codepdt: '',
    nompdt: '',
    descpdt: '',
    prixpdt: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user types
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.codepdt || !formData.nompdt || !formData.prixpdt) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.prixpdt) <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/commercial/produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codepdt: formData.codepdt,
          nompdt: formData.nompdt,
          descpdt: formData.descpdt,
          prixpdt: parseFloat(formData.prixpdt)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create product' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`Product "${formData.nompdt}" created successfully!`);
      
      // Reset form
      setFormData({
        codepdt: '',
        nompdt: '',
        descpdt: '',
        prixpdt: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error connecting to Commercial Service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-2">Add a new product to the Commercial Service</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Package className="absolute left-3 top-11 text-gray-400" size={20} />
              <Input
                label="Product Code"
                name="codepdt"
                type="text"
                placeholder="e.g., PRD-001"
                value={formData.codepdt}
                onChange={handleChange}
                className="pl-10"
                required
              />
              <p className="text-gray-500 mt-1">Unique identifier for the product</p>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-11 text-gray-400" size={20} />
              <Input
                label="Price"
                name="prixpdt"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 99.99"
                value={formData.prixpdt}
                onChange={handleChange}
                className="pl-10"
                required
              />
              <p className="text-gray-500 mt-1">Unit price in dollars</p>
            </div>
          </div>

          <div className="relative">
            <FileText className="absolute left-3 top-11 text-gray-400" size={20} />
            <Input
              label="Product Name"
              name="nompdt"
              type="text"
              placeholder="e.g., Laptop ASUS VivoBook"
              value={formData.nompdt}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              name="descpdt"
              placeholder="Enter product description..."
              value={formData.descpdt}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-gray-900 mb-3">Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Product Code:</span>
                <span className="text-gray-900">{formData.codepdt || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product Name:</span>
                <span className="text-gray-900">{formData.nompdt || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="text-gray-900">
                  {formData.prixpdt ? `$${parseFloat(formData.prixpdt).toFixed(2)}` : '—'}
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
              {loading ? 'Creating Product...' : 'Create Product'}
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
              <strong>Note:</strong> This will create the product in the Commercial Service (Port 8081).
              You'll need to add stock separately using the "Add Stock" page.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
