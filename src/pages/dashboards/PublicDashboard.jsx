import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicHome from './public/PublicHome';
import PublicAllProjects from './public/PublicAllProjects';
import PublicComplaint from './public/PublicComplaint';

const PublicDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <PublicHome />;
            case 'projects':
                return <PublicAllProjects />;
            case 'complaint':
                return <PublicComplaint />;
            default:
                return <PublicHome />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Top Navigation Bar */}
            <nav style={{
                backgroundColor: '#1e3a8a',
                color: 'white',
                padding: '0 20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '60px'
                }}>
                    {/* Navigation Items */}
                    <div style={{ display: 'flex', gap: '0' }}>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            style={{
                                background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none',
                                color: 'white',
                                padding: '20px 30px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
                                borderBottom: activeTab === 'dashboard' ? '3px solid #ff9933' : '3px solid transparent',
                                transition: 'all 0.3s'
                            }}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('projects')}
                            style={{
                                background: activeTab === 'projects' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none',
                                color: 'white',
                                padding: '20px 30px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: activeTab === 'projects' ? 'bold' : 'normal',
                                borderBottom: activeTab === 'projects' ? '3px solid #ff9933' : '3px solid transparent',
                                transition: 'all 0.3s'
                            }}
                        >
                            Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('complaint')}
                            style={{
                                background: activeTab === 'complaint' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none',
                                color: 'white',
                                padding: '20px 30px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: activeTab === 'complaint' ? 'bold' : 'normal',
                                borderBottom: activeTab === 'complaint' ? '3px solid #ff9933' : '3px solid transparent',
                                transition: 'all 0.3s'
                            }}
                        >
                            Complaint
                        </button>
                    </div>

                    {/* User Info & Logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '14px' }}>
                            {user?.name || 'Public User'} ({user?.role ? 'Public User' : 'Guest'})
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                color: 'white',
                                padding: '8px 20px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default PublicDashboard;
