import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const PublicNavbar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'var(--color-accent)',
            padding: 'var(--space-4) 0',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>PM-AJAY Public Portal</div>
                <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
                            borderBottom: activeTab === 'dashboard' ? '2px solid white' : '2px solid transparent',
                            paddingBottom: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'projects' ? 'bold' : 'normal',
                            borderBottom: activeTab === 'projects' ? '2px solid white' : '2px solid transparent',
                            paddingBottom: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('complaint')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'complaint' ? 'bold' : 'normal',
                            borderBottom: activeTab === 'complaint' ? '2px solid white' : '2px solid transparent',
                            paddingBottom: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Complaint
                    </button>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)', margin: '0 var(--space-2)' }}></div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 'normal',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
