import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';

const DashboardHeader = ({ toggleSidebar, breadcrumb, dashboardTitle, showNotificationBell = true }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNotificationRole = (role) => {
        switch (role) {
            case 'centre_admin': return 'ministry';
            case 'state_admin': return 'state';
            case 'district_admin': return 'district';
            case 'department_admin': return 'department';
            default: return role;
        }
    };

    return (
        <header
            className="dashboard-header-component"
            style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1030 }}
        >
            {/* Top Bar */}
            <div
                className="header-top"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-white)',
                    padding: 'var(--space-2) 0',
                    fontSize: 'var(--text-sm)'
                }}
            >
                <div className="container-fluid" style={{ padding: '0 var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <img
                                src="/logos/emblem.png"
                                alt="Government of India"
                                className="logo-emblem"
                                style={{ height: '30px', width: 'auto' }}
                            />
                            <span>भारत सरकार | Government of India</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                            <a href="#" style={{ color: 'var(--text-inverse)' }}>हिंदी</a>
                            <a href="#" style={{ color: 'var(--text-inverse)' }}>Accessibility</a>
                            <a href="#" style={{ color: 'var(--text-inverse)' }}>Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header – logo + title/subtitle */}
            <div className="header-main" style={{ padding: 'var(--space-3) 0', backgroundColor: 'var(--bg-primary)' }}>
                <div className="container-fluid" style={{ padding: '0 var(--space-4)' }}>
                    <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Left side: logo + title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <div className="header-logos">
                                <img
                                    src="/logos/adarsh-gram.png"
                                    alt="Ministry of Social Justice & Empowerment"
                                    className="logo-emblem"
                                    style={{ height: '60px', width: 'auto' }}
                                />
                            </div>
                            <div className="header-title" style={{ textAlign: 'left' }}>
                                <h4 style={{
                                    color: 'var(--color-navy)',
                                    marginBottom: 'var(--space-1)',
                                    fontWeight: 'var(--font-bold)',
                                    fontSize: 'var(--text-lg)',
                                    margin: 0
                                }}>
                                    Pradhan Mantri Anusuchit Jaati Abhyuday Yojna (PM-AJAY)
                                </h4>
                                <p style={{
                                    color: 'var(--color-navy)',
                                    fontSize: 'var(--text-sm)',
                                    marginBottom: 0,
                                    margin: 0
                                }}>
                                    Department of Social Justice & Empowerment, Ministry of Social Justice & Empowerment, Government of India
                                </p>
                            </div>
                        </div>
                        {/* Right side logo */}
                        <div className="header-logos">
                            <img
                                src="/logos/logo-amrit.png"
                                alt="PM-AJAY"
                                className="logo-emblem"
                                style={{ height: '60px', width: 'auto' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar (green) */}
            <div className="header-nav" style={{ backgroundColor: '#5cba5c', padding: 0 }}>
                <div className="container-fluid" style={{ padding: '0 var(--space-4)' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Left Nav Items */}
                        <ul className="nav-menu" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
                            <li className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <button
                                    onClick={toggleSidebar}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-white)',
                                        cursor: 'pointer',
                                        padding: 'var(--space-3) var(--space-2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'relative',
                                        zIndex: 2000
                                    }}
                                    title="Toggle Sidebar"
                                >
                                    <Menu size={24} />
                                </button>
                                <span style={{
                                    color: 'var(--color-white)',
                                    fontWeight: 'bold',
                                    fontSize: 'var(--text-base)'
                                }}>
                                    {dashboardTitle && <span>{dashboardTitle} </span>}
                                    {breadcrumb && <span style={{ fontWeight: 'normal', opacity: 0.9 }}>
                                        {dashboardTitle ? `(${breadcrumb})` : breadcrumb}
                                    </span>}
                                </span>
                            </li>
                        </ul>
                        {/* Right Nav Items */}
                        <ul className="nav-menu" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
                            {showNotificationBell && (
                                <li className="nav-item">
                                    <NotificationBell
                                        userRole={getNotificationRole(user?.role)}
                                        stateName={user?.state_name}
                                        districtName={user?.district_name}
                                    />
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </header >
    );
};

export default DashboardHeader;
