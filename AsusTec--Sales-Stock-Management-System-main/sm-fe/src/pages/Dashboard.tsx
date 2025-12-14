import React from 'react';
import { Package, Archive, ShoppingCart, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const chartData = [
  { month: 'Jan', orders: 65, revenue: 12000 },
  { month: 'Feb', orders: 78, revenue: 15000 },
  { month: 'Mar', orders: 90, revenue: 18000 },
  { month: 'Apr', orders: 81, revenue: 16500 },
  { month: 'May', orders: 95, revenue: 19500 },
  { month: 'Jun', orders: 110, revenue: 22000 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const kpis = [
    { 
      title: 'Total Products', 
      value: '1,247', 
      icon: Package, 
      color: 'bg-blue-500',
      trend: '+12%'
    },
    { 
      title: 'Total Stock Quantity', 
      value: '15,432', 
      icon: Archive, 
      color: 'bg-green-500',
      trend: '+8%'
    },
    { 
      title: 'Number of Commands', 
      value: '342', 
      icon: ShoppingCart, 
      color: 'bg-purple-500',
      trend: '+23%'
    },
    { 
      title: 'Revenue This Month', 
      value: '$22,000', 
      icon: TrendingUp, 
      color: 'bg-orange-500',
      trend: '+15%'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Dashboard Overview</h1>
        <div className="text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 mb-1">{kpi.title}</p>
                  <h2 className="text-gray-900 mb-1">{kpi.value}</h2>
                  <span className="text-green-600">{kpi.trend} from last month</span>
                </div>
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="text-gray-900 mb-6">Sales Overview</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px' 
              }}
            />
            <Legend />
            <Bar dataKey="orders" fill="#2563eb" name="Orders" radius={[8, 8, 0, 0]} />
            <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => navigate('/products')} className="py-4">
            View All Products
          </Button>
          <Button onClick={() => navigate('/order-creation')} className="py-4">
            Create New Order
          </Button>
          <Button onClick={() => navigate('/orders')} variant="secondary" className="py-4">
            View All Orders
          </Button>
        </div>
      </Card>
    </div>
  );
}
