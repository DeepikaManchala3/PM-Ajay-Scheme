import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AdarshGram from './pages/AdarshGram';
import ContactUs from './pages/pm-contactUs/ContactUs';
import Login from './pages/Login';
import RegisterAgency from './pages/RegisterAgency';
import ChatAssistant from './pages/ChatAssistant';
import DashboardRouter from './pages/dashboards/DashboardRouter';

import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: 'var(--text-xl)'
            }}>
                Loading...
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App Layout
const AppLayout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Hide global header on dashboard for PUBLIC users, Ministry users, State users, District users, Department users, Implementing Agencies, and Executing Agencies (who have custom header)
    const shouldHideHeader = location.pathname === '/dashboard' && (
        user?.role === ROLES.PUBLIC ||
        user?.role === ROLES.MINISTRY ||
        user?.role === ROLES.STATE ||
        user?.role === ROLES.DISTRICT ||
        user?.role === ROLES.DEPARTMENT ||
        user?.role === ROLES.IMPLEMENTING_AGENCY ||
        user?.role === ROLES.EXECUTING_AGENCY
    );

    return (
        <>
            {!shouldHideHeader && <Header />}
            <main style={{ flex: 1 }}>
                {children}
            </main>
        </>
    );
};

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Router>
                    <ScrollToTop />
                    <AppLayout>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/adarsh-gram" element={<AdarshGram />} />
                            <Route path="/contact-us" element={<ContactUs />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register-agency" element={<RegisterAgency />} />
                            <Route path="/chat" element={<ChatAssistant />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardRouter />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Placeholder routes for future implementation */}

                            <Route path="/reports" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Reports (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/fund-allocation" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Fund Allocation (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/districts" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Districts Management (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/fund-release" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Fund Release (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/proposals" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Proposals (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/works" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Works Management (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/my-projects" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>My Projects (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/new-proposal" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>New Proposal (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/work-orders" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Work Orders (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/dpr-upload" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>DPR Upload (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/assigned-works" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Assigned Works (Coming Soon)</h1></div></ProtectedRoute>} />
                            <Route path="/progress-update" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Progress Update (Coming Soon)</h1></div></ProtectedRoute>} />

                            {/* 404 Route */}
                            <Route path="*" element={
                                <div className="page-wrapper">
                                    <div className="page-content">
                                        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                                            <h1 style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)' }}>404</h1>
                                            <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Page Not Found</p>
                                            <a href="/" className="btn btn-primary">Go to Homepage</a>
                                        </div>
                                    </div>
                                </div>
                            } />
                        </Routes>
                    </AppLayout>
                </Router>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
