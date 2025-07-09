import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Topbar from './components/topbar';
import Home from './components/home';
import Admins from './components/admin';
import Batches from './components/batches';
import Payment from './components/payment';
import AnalyticsPage from './components/analyticspage';
import Courses from './components/courses';
import Student from './components/student';
import Certificate from './components/CertificatePage';
import SuperAdminChat from './components/superadminchat';
import PrivateRoute from './components/PrivateRoute';
import Settings from './components/settings';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const routeTitles = {
  '/superadmin': 'Dashboard',
  '/superadmin/admins': 'Admin Management',
  '/superadmin/salary': 'Salary Management',
  '/superadmin/batches': 'Batch Management',
  '/superadmin/courses': 'Course Management',
  '/superadmin/students': 'Student Management',
  '/superadmin/analytics': 'Analytics',
  '/superadmin/communication': 'Communication',
  '/superadmin/settings': 'Settings',
  '/superadmin/certificates':'Certificate'
};


const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar pageTitle={pageTitle} />
        <ToastContainer position="top-right" autoClose={3000} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* ✅ Private Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/admins"
              element={
                <PrivateRoute>
                  <Admins />
                </PrivateRoute>
              }
            />
            <Route
              path="/batches"
              element={
                <PrivateRoute>
                  <Batches />
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <Student />
                </PrivateRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <PrivateRoute>
                  <Courses />
                </PrivateRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AnalyticsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/communication"
              element={
                <PrivateRoute>
                  <SuperAdminChat />
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <PrivateRoute>
                  <Certificate />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const SuperAdminApp = () => (
    <AppContent />

);

export default SuperAdminApp;
