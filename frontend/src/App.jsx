import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Public pages
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Customer pages
import MyAccount from './pages/Customer/MyAccount';
import PlaceOrder from './pages/Customer/PlaceOrder';
import BrowseSuits from './pages/Customer/BrowseSuits';
import MyOrders from './pages/Customer/MyOrders';
import MyRentals from './pages/Customer/MyRentals';
import MyPayments from './pages/Customer/MyPayments';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import RentalManagement from './pages/Admin/RentalManagement';
import InventoryManagement from './pages/Admin/InventoryManagement';
import PaymentManagement from './pages/Admin/PaymentManagement';
import ReportsPage from './pages/Admin/ReportsPage';
import SettingsPage from './pages/Admin/SettingsPage';

// Employee pages
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import AssignedOrders from './pages/Employee/AssignedOrders';
import ManageReturns from './pages/Employee/ManageReturns';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardRoute = () => {
    if (!isAuthenticated) return '/';
    
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'employee':
        return '/employee/dashboard';
      case 'customer':
        return '/';
      default:
        return '/';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <RegisterPage />} 
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Customer Routes */}
      <Route
        path="/customer/account"
        element={
          <ProtectedRoute roles={['customer']}>
            <MyAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/place-order"
        element={
          <ProtectedRoute roles={['customer']}>
            <PlaceOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/browse-suits"
        element={
          <ProtectedRoute roles={['customer']}>
            <BrowseSuits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/my-orders"
        element={
          <ProtectedRoute roles={['customer']}>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/my-rentals"
        element={
          <ProtectedRoute roles={['customer']}>
            <MyRentals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/my-payments"
        element={
          <ProtectedRoute roles={['customer']}>
            <MyPayments />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute roles={['admin']}>
            <OrderManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rentals"
        element={
          <ProtectedRoute roles={['admin']}>
            <RentalManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute roles={['admin']}>
            <InventoryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute roles={['admin']}>
            <PaymentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={['admin']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute roles={['admin']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/assigned-orders"
        element={
          <ProtectedRoute roles={['employee']}>
            <AssignedOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/manage-returns"
        element={
          <ProtectedRoute roles={['employee']}>
            <ManageReturns />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
