import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const PublicSidebar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'projects', icon: '🏗️', label: 'Projects' },
        { id: 'complaint', icon: '📝', label: 'Complaint' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className="dashboard-sidebar"
            style={{
                backgroundColor: '#111827',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '260px',
                height: '100vh',
                overflowY: 'auto',
                zIndex: 1030,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: 0
            }}
        >
            <div style={{ padding: '20px', color: 'white', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>PM-AJAY</h2>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>Public Portal</p>
            </div>
            <nav style={{ marginTop: '20px', flex: 1 }}>
                <ul className="dashboard-sidebar-nav">
                    {menuItems.map((item) => (
                        <li key={item.id} className="dashboard-sidebar-item">
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`dashboard-sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                                style={{
                                    width: '100%',
                                    background: activeTab === item.id ? 'rgba(255, 153, 51, 0.2)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: 'white',
                                    borderLeft: activeTab === item.id ? '4px solid var(--color-primary)' : '4px solid transparent'
                                }}
                            >
                                <span className="dashboard-sidebar-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '0.9rem',
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span>🚪</span> Logout
                </button>
            </div>
        </aside>
    );
};

export default PublicSidebar;
