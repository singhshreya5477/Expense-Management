import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import CreateExpense from './pages/CreateExpense';
import Approvals from './pages/Approvals';
import Users from './pages/Users';
import ApprovalRules from './pages/ApprovalRules';
import Companies from './pages/Companies';
import Profile from './pages/Profile';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected Routes */}
      <Route element={<Layout />}>
        {/* All roles can access dashboard and expenses */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/create" element={<CreateExpense />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin and Manager only */}
        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <Approvals />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin only */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/approval-rules" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ApprovalRules />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Companies />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all - redirect to home or dashboard */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  );
}

export default App;
