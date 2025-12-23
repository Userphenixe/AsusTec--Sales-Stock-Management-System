import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import OrderCreation from './pages/OrderCreation';
import OrderConfirmation from './pages/OrderConfirmation';
import UserManagement from './pages/UserManagement';
import CreateProduct from './pages/admin/CreateProduct';
import AddStock from './pages/admin/AddStock';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } 
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/order-creation" element={<OrderCreation />} />
                  <Route path="/orders" element={<OrderConfirmation />} />
                  <Route path="/admin/products/create" element={<CreateProduct />} />
                  <Route path="/admin/stock/add" element={<AddStock />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;