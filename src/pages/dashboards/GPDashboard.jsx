import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../contexts/AuthContext';

// Import GP Sub-components
import GPDashboardPanel from './gp/GPDashboardPanel';
import ProposeWorks from './gp/ProposeWorks';
import UploadSurvey from './gp/UploadSurvey';
import MonitorProgress from './gp/MonitorProgress';
import ConfirmCompletion from './gp/ConfirmCompletion';
import Communication from './gp/Communication';
import GPNotifications from './gp/GPNotifications';

const GPDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '➕', label: 'Propose New Works', action: () => setActiveTab('propose'), active: activeTab === 'propose' },
        { icon: '📤', label: 'Upload Survey Data', action: () => setActiveTab('upload'), active: activeTab === 'upload' },
        { icon: '📈', label: 'Monitor Progress', action: () => setActiveTab('monitor'), active: activeTab === 'monitor' },
        { icon: '✅', label: 'Confirm Completion', action: () => setActiveTab('confirm'), active: activeTab === 'confirm' },
        { icon: '💬', label: 'Communication', action: () => setActiveTab('communication'), active: activeTab === 'communication' },
        { icon: '🔔', label: 'Notifications', action: () => setActiveTab('notifications'), active: activeTab === 'notifications' },
        { icon: '🚪', label: 'Logout', action: () => { logout(); navigate('/login'); } }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <GPDashboardPanel />;
            case 'propose':
                return <ProposeWorks />;
            case 'upload':
                return <UploadSurvey />;
            case 'monitor':
                return <MonitorProgress />;
            case 'confirm':
                return <ConfirmCompletion />;
            case 'communication':
                return <Communication />;
            case 'notifications':
                return <GPNotifications />;
            default:
                return <GPDashboardPanel />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'propose': 'Propose New Works',
            'upload': 'Upload Survey Data',
            'monitor': 'Monitor Progress',
            'confirm': 'Confirm Completion',
            'communication': 'Communication',
            'notifications': 'Notifications'
        };
        return `Home > ${labels[activeTab] || 'Dashboard'}`;
    };

    return (
        <div className="dashboard-layout">
            <DashboardSidebar menuItems={sidebarMenu} />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title-section">
                        <h1>Gram Panchayat Dashboard</h1>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                            {getBreadcrumb()}
                        </p>
                    </div>
                    <div className="dashboard-actions">
                        <NotificationBell />
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default GPDashboard;
