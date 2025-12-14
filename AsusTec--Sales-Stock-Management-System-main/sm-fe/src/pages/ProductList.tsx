import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';

interface Product {
  codepdt: string;
  nompdt: string;
  descpdt: string;
  prixpdt: number;
  qtepdt: number;
}

export default function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8083/api/ventes/produits');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      toast.success('Products loaded successfully');
    } catch (err: any) {
      const errorMsg = 'Unable to connect to Sale Service. Please ensure the backend is running.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.nompdt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codepdt.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') return a.prixpdt - b.prixpdt;
      if (sortBy === 'stock') return b.qtepdt - a.qtepdt;
      return a.nompdt.localeCompare(b.nompdt);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Product Catalog</h1>
        <Button variant="secondary" onClick={fetchProducts} disabled={loading}>
          <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
          <Button variant="secondary" onClick={fetchProducts}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Search by product name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600 mr-3" size={24} />
            <p className="text-gray-600">Loading products from Sale Service...</p>
          </div>
        ) : (
          <>
            <Table headers={['Product Code', 'Product Name', 'Description', 'Price', 'Stock Quantity', 'Action']}>
              {filteredProducts.map((product) => (
                <TableRow key={product.codepdt}>
                  <TableCell>{product.codepdt}</TableCell>
                  <TableCell>{product.nompdt}</TableCell>
                  <TableCell>{product.descpdt || '—'}</TableCell>
                  <TableCell>${product.prixpdt.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full ${
                      product.qtepdt > 100 ? 'bg-green-100 text-green-800' :
                      product.qtepdt > 50 ? 'bg-yellow-100 text-yellow-800' :
                      product.qtepdt > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.qtepdt} units
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => navigate('/order-creation', { 
                        state: { 
                          product: {
                            code: product.codepdt,
                            name: product.nompdt,
                            description: product.descpdt,
                            price: product.prixpdt,
                            stock: product.qtepdt
                          }
                        }
                      })}
                      className="flex items-center gap-2"
                      disabled={product.qtepdt === 0}
                    >
                      <ShoppingCart size={16} />
                      {product.qtepdt === 0 ? 'Out of Stock' : 'Order'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No products found matching your search criteria.
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}