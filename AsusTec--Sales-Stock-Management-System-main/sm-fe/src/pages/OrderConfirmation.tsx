import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FileText, Calendar, User, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { toast } from 'sonner';

interface Order {
  codecmd: string;
  client: string;
  codepdt: string;
  qtecmd: number;
  datecmd: string;
}

export default function OrderConfirmation() {
  const location = useLocation();
  const newOrder = location.state?.newOrder;
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(newOrder || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // If there's a new order from navigation state, add it to the top
    if (newOrder) {
      setOrders(prev => [newOrder, ...prev]);
      setSelectedOrder(newOrder);
      toast.success('Order created successfully!');
    }
  }, [newOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8083/api/ventes/commandes');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      
      const data: Order[] = await response.json();
      
      // Transform backend data to match our UI format
      const transformedOrders = data.map(order => ({
        orderId: order.codecmd,
        client: order.client,
        productCode: order.codepdt,
        product: order.codepdt, // Backend might not include full product name
        quantity: order.qtecmd,
        unitPrice: 0, // Backend doesn't provide this in the order list
        total: 0, // We'll calculate or get from invoice if available
        date: order.datecmd
      }));
      
      setOrders(transformedOrders);
    } catch (err: any) {
      const errorMsg = 'Unable to connect to Sale Service. Please ensure the backend is running.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (order: any) => {
    // Mock PDF download - in real app, would generate actual PDF
    toast.success(`Downloading invoice for ${order.orderId}...`);
    
    // Create a simple text representation of the invoice
    const invoiceText = `
INVOICE
=======

Order ID: ${order.orderId}
Client: ${order.client}
Date: ${new Date(order.date).toLocaleDateString()}

Product Code: ${order.productCode}
Product: ${order.product}
Quantity: ${order.quantity} units
Unit Price: $${order.unitPrice?.toFixed(2) || '0.00'}
Total: $${order.total?.toFixed(2) || '0.00'}
    `;
    
    // Download as text file (in real app, would be PDF)
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Orders & Invoices</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedOrder && (
            <Button onClick={() => handleDownloadPDF(selectedOrder)}>
              <Download size={20} className="mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
            <p className="text-red-700 mt-1">
              Make sure the Sale Service is running on port 8083
            </p>
          </div>
          <Button variant="secondary" onClick={fetchOrders}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-gray-900 mb-4">All Orders</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600 mr-3" size={24} />
                <p className="text-gray-600">Loading orders from Sale Service...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No orders found</p>
                <p className="text-gray-400">Create your first order to see it here</p>
              </div>
            ) : (
              <Table headers={['Order ID', 'Client', 'Product Code', 'Quantity', 'Total', 'Date', 'Action']}>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.client}</TableCell>
                    <TableCell>{order.productCode}</TableCell>
                    <TableCell>{order.quantity} units</TableCell>
                    <TableCell>
                      {order.total ? `$${order.total.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="secondary" 
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <FileText size={16} />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            )}
          </Card>
        </div>

        <div>
          {selectedOrder ? (
            <Card className="sticky top-24">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-blue-600" size={24} />
                  <h2 className="text-gray-900">Invoice</h2>
                </div>
                <p className="text-gray-600">#{selectedOrder.orderId}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-gray-600" />
                    <span className="text-gray-600">Client</span>
                  </div>
                  <p className="text-gray-900">{selectedOrder.client}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-gray-600" />
                    <span className="text-gray-600">Date</span>
                  </div>
                  <p className="text-gray-900">
                    {new Date(selectedOrder.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-gray-900 mb-3">Order Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Code:</span>
                      <span className="text-gray-900">{selectedOrder.productCode}</span>
                    </div>
                    {selectedOrder.product && selectedOrder.product !== selectedOrder.productCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="text-gray-900">{selectedOrder.product}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="text-gray-900">{selectedOrder.quantity} units</span>
                    </div>
                    {selectedOrder.unitPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="text-gray-900">${selectedOrder.unitPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.total > 0 && (
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-900">Total Amount</h3>
                      <h2 className="text-blue-600">${selectedOrder.total.toFixed(2)}</h2>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleDownloadPDF(selectedOrder)}
                  className="w-full"
                >
                  <Download size={20} className="mr-2" />
                  Download Invoice PDF
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an order to view invoice details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}