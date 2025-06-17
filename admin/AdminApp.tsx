
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminTransactionManagementPage from './pages/AdminTransactionManagementPage';
import AdminSystemSettingsPage from './pages/AdminSystemSettingsPage';
import AdminKycManagementPage from './pages/AdminKycManagementPage';
import AdminWithdrawalManagementPage from './pages/AdminWithdrawalManagementPage';
import AdminNotificationsLogPage from './pages/AdminNotificationsLogPage';
import ProtectedRoute from '../components/common/ProtectedRoute';


const AdminApp: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route path="/" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUserManagementPage />} />
        <Route path="transactions" element={<AdminTransactionManagementPage />} />
        <Route path="settings" element={<AdminSystemSettingsPage />} />
        <Route path="kyc" element={<AdminKycManagementPage />} />
        <Route path="withdrawals" element={<AdminWithdrawalManagementPage />} />
        <Route path="notifications" element={<AdminNotificationsLogPage />} />
        {/* Add other admin routes here */}
        <Route path="*" element={<Navigate to="dashboard" replace />} /> {/* Fallback for /admin/* */}
      </Route>
    </Routes>
  );
};

export default AdminApp;
    