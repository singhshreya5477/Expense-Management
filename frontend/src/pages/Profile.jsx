import React from 'react';
import useAuthStore from '../store/authStore';
import AdminProfile from './profiles/AdminProfile';
import ManagerProfile from './profiles/ManagerProfile';
import EmployeeProfile from './profiles/EmployeeProfile';

const Profile = () => {
  const { user } = useAuthStore();

  // Route to role-specific profile page
  switch (user?.role) {
    case 'Admin':
      return <AdminProfile />;
    case 'Manager':
      return <ManagerProfile />;
    case 'Employee':
      return <EmployeeProfile />;
    default:
      return <EmployeeProfile />;
  }
};

export default Profile;
