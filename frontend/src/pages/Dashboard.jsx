import React from 'react';
import useAuthStore from '../store/authStore';
import AdminDashboard from './dashboards/AdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Route to role-specific dashboard
  switch (user?.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Manager':
      return <ManagerDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    default:
      return <EmployeeDashboard />;
  }
};

export default Dashboard;
