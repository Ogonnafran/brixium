
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import UserApp from './app/UserApp';
import AdminApp from './admin/AdminApp';

// This component will decide which app (UserApp or AdminApp) to render based on the hash path.
const AppNavigator: React.FC = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    // Slice off '/admin' part for AdminApp's internal routing
    const adminPath = location.pathname.substring('/admin'.length) || '/';
    return (
        <Routes>
            <Route path={`${adminPath}*`} element={<AdminApp />} />
        </Routes>
    );
  } else if (location.pathname.startsWith('/app')) {
     const userPath = location.pathname.substring('/app'.length) || '/';
    return (
        <Routes>
            <Route path={`${userPath}*`} element={<UserApp />} />
        </Routes>
    );
  }
  // Default redirect if hash is not #/app or #/admin
  return <Navigate to="/app/login" replace />;
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        {/* 
          The HashRouter strategy for SPA on GitHub pages might lead to URLs like:
          your-page.github.io/<repo-name>/#/app/dashboard
          your-page.github.io/<repo-name>/#/admin/dashboard

          The AppNavigator will look at location.pathname from useLocation(), 
          which for HashRouter gives the path *after* the hash.
          So, if URL is #/admin/dashboard, location.pathname will be /admin/dashboard.
        */}
        <Routes>
            <Route path="/app/*" element={<UserApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<Navigate to="/app/login" replace />} /> {/* Default route */}
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
    