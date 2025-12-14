import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, User, Hash, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from 'sonner';

export default function OrderCreation() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProduct = location.state?.product;

  const [productCode, setProductCode] = useState(selectedProduct?.code || '');
  const [productName, setProductName] = useState(selectedProduct?.name || '');
  const [price, setPrice] = useState(selectedProduct?.price || 0);
  const [availableStock, setAvailableStock] = useState(selectedProduct?.stock || 0);
  const [quantity, setQuantity] = useState(1);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = price * quantity;

  const handleCreateOrder = async () => {
    // Frontend validation
    if (!clientName.trim()) {
      setError('Please enter client name');
      toast.error('Please enter client name');
      return;
    }

    if (!productCode) {
      setError('Please select a product');
      toast.error('Please select a product');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (quantity > availableStock) {
      setError(`Quantity exceeds available stock (${availableStock} units)`);
      toast.error(`Insufficient stock! Available: ${availableStock}, Requested: ${quantity}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8083/api/ventes/commande', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: clientName,
          codepdt: productCode,
          qtecmd: quantity,
          datecmd: new Date().toISOString()
        })
      });

      if (!response.ok) {
        // Handle different error scenarios
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({ message: 'Insufficient stock' }));
          throw new Error(errorData.message || 'Insufficient stock for this order');
        } else if (response.status === 404) {
          throw new Error('Product not found in the system');
        } else if (response.status === 500) {
          throw new Error('Error communicating between microservices');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const invoiceData = await response.json();
      
      toast.success('Order placed successfully!');
      
      // Navigate to orders page with the invoice data
      navigate('/orders', { 
        state: { 
          newOrder: {
            orderId: invoiceData.codecmd || `ORD-${Date.now()}`,
            client: clientName,
            productCode: productCode,
            product: productName,
            quantity: quantity,
            unitPrice: price,
            total: totalAmount,
            date: invoiceData.datecmd || new Date().toISOString(),
            invoice: invoiceData
          }
        } 
      });

    } catch (err: any) {
      const errorMsg = err.message || 'Error connecting to Sale Service';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-gray-900">Create New Order</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-gray-900 mb-4">Product Details</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Package className="text-blue-600 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-gray-900">{productName || 'Select a product'}</h3>
                  <p className="text-gray-600 mt-1">Code: {productCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Unit Price</p>
                <p className="text-gray-900">${price.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-1">Available Stock</p>
                <p className={`${availableStock > 50 ? 'text-green-600' : availableStock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {availableStock} units
                </p>
              </div>
            </div>

            {!selectedProduct && (
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-gray-900 mb-4">Order Information</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-11 text-gray-400" size={20} />
              <Input
                label="Client Name"
                type="text"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  setError('');
                }}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Hash className="absolute left-3 top-11 text-gray-400" size={20} />
              <Input
                label="Quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                  setError('');
                }}
                className="pl-10"
                min="1"
                max={availableStock}
                required
              />
            </div>

            {quantity > availableStock && availableStock > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-red-700">
                  Quantity exceeds available stock! Available: {availableStock} units
                </p>
              </div>
            )}

            {availableStock === 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-red-700">
                  This product is out of stock. Please select another product.
                </p>
              </div>
            )}

            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-blue-600" size={24} />
                  <span className="text-gray-700">Total Amount</span>
                </div>
                <h2 className="text-blue-600">${totalAmount.toFixed(2)}</h2>
              </div>
            </div>

            <Button 
              onClick={handleCreateOrder}
              className="w-full py-3"
              disabled={!productCode || !clientName || quantity > availableStock || availableStock === 0 || loading}
            >
              {loading ? 'Creating Order...' : 'Create Order'}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800">
                <strong>Note:</strong> This will place an order through the Sale Service, 
                which will automatically update stock and create an invoice.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}