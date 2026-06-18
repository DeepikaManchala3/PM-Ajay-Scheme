import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import NotificationBell from '../../components/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import StateDashboardPanel from './state/StateDashboardPanel';
import ManageImplementingAgencies from './state/ManageImplementingAgencies';
import AssignProjectsState from './state/AssignProjectsState'; // New Component
import CentralProjectsAssignment from './state/CentralProjectsAssignment';
import FundRelease from './state/FundRelease';
import ApproveProposals from './state/ApproveProposals';
import VerifyUCs from './state/VerifyUCs';
import StateReports from './state/StateReports';
import StateNotifications from './state/StateNotifications';
import StateHelp from './state/StateHelp';
import FundsReceivedFromMinistry from './state/FundsReceivedFromMinistry';
import MonitorProgressState from './state/MonitorProgressState';
import ApproveAgencyRegistrations from './state/ApproveAgencyRegistrations';
import {
    LayoutDashboard,
    Wallet,
    Users,
    Send,
    FileCheck,
    Upload,
    FileBarChart,
    Bell,
    HelpCircle,
    LogOut,
    Activity,

    UserPlus,
    Briefcase
} from 'lucide-react';

const StateDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stateName, setStateName] = useState('Loading...');
    const [stateId, setStateId] = useState(null);
    const [stateCode, setStateCode] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Fetch state name from user profile
    React.useEffect(() => {
        const fetchStateName = async () => {
            if (user?.id) {
                console.log('Fetching state name for user:', user.email);
                try {
                    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

                    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=full_name`, {
                        headers: {
                            'apikey': SUPABASE_ANON_KEY
                        }
                    });
                    const data = await response.json();
                    console.log('State name data:', data);
                    if (data[0]?.full_name) {
                        // Extract state name (e.g., "Maharashtra State Admin" -> "Maharashtra")
                        let name = data[0].full_name
                            .replace(' State Admin', '')
                            .replace(' Admin', '')
                            .replace(' State', '')
                            .trim();
                        console.log('Setting state name to:', name);
                        setStateName(name);

                        // Fetch State ID and Code
                        const stateRes = await fetch(`${SUPABASE_URL}/rest/v1/states?name=eq.${name}&select=id,code`, {
                            headers: {
                                'apikey': SUPABASE_ANON_KEY
                            }
                        });
                        const stateData = await stateRes.json();
                        if (stateData && stateData.length > 0) {
                            setStateId(stateData[0].id);
                            setStateCode(stateData[0].code);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching state name:', error);
                    setStateName('State');
                }
            }
        };
        fetchStateName();
    }, [user?.id, user?.email]); // Refetch when user changes

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sidebarMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: <Activity size={20} />, label: 'Monitor Progress', action: () => setActiveTab('monitor'), active: activeTab === 'monitor' },
        { icon: <Wallet size={20} />, label: 'Funds Received from Ministry', action: () => setActiveTab('received'), active: activeTab === 'received' },
        { icon: <Briefcase size={20} />, label: 'Central Projects Assignment', action: () => setActiveTab('central-projects'), active: activeTab === 'central-projects' },
        { icon: <Users size={20} />, label: 'Manage Implementing Agencies', action: () => setActiveTab('admins'), active: activeTab === 'admins' },
        { icon: <Send size={20} />, label: 'Fund Release to Implementing Agencies', action: () => setActiveTab('funds'), active: activeTab === 'funds' },
        { icon: <FileCheck size={20} />, label: 'Approve Implementing Agency Proposals', action: () => setActiveTab('proposals'), active: activeTab === 'proposals' },
        { icon: <FileCheck size={20} />, label: 'Verify Utilisation Certificates', action: () => setActiveTab('ucs'), active: activeTab === 'ucs' },
        { icon: <UserPlus size={20} />, label: 'Approve Agency Registrations', action: () => setActiveTab('agency-approvals'), active: activeTab === 'agency-approvals' },
        { icon: <FileBarChart size={20} />, label: 'Reports', action: () => setActiveTab('reports'), active: activeTab === 'reports' },
        { icon: <Bell size={20} />, label: 'Notifications', action: () => setActiveTab('notifications'), active: activeTab === 'notifications' },
        { icon: <HelpCircle size={20} />, label: 'Help/Support', action: () => setActiveTab('help'), active: activeTab === 'help' },
        { icon: <LogOut size={20} />, label: 'Logout', action: () => { logout(); navigate('/login'); }, isLogout: true }
    ];

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <StateDashboardPanel formatCurrency={formatCurrency} stateName={stateName} />;
            case 'monitor':
                return <MonitorProgressState stateName={stateName} stateId={stateId} />;

            case 'received':
                return <FundsReceivedFromMinistry formatCurrency={formatCurrency} />;
            case 'central-projects':
                return <CentralProjectsAssignment stateName={stateName} stateId={stateId} />;
            case 'admins':
                return <ManageImplementingAgencies />;
            case 'funds':
                return <FundRelease formatCurrency={formatCurrency} stateId={stateId} stateCode={stateCode} />;
            case 'proposals':
                return <ApproveProposals />;
            case 'ucs':
                return <VerifyUCs />;
            case 'agency-approvals':
                return <ApproveAgencyRegistrations />;
            case 'reports':
                return <StateReports />;
            case 'notifications':
                return <StateNotifications />;
            case 'help':
                return <StateHelp />;
            default:
                return <StateDashboardPanel formatCurrency={formatCurrency} stateName={stateName} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'monitor': 'Monitor Progress',
            'received': 'Funds Received from Ministry',
            'central-projects': 'Central Projects Assignment',
            'admins': 'Manage Implementing Agencies',
            'funds': 'Fund Release to Implementing Agencies',
            'proposals': 'Approve Implementing Agency Proposals',
            'ucs': 'Verify UCs',
            'agency-approvals': 'Approve Agency Registrations',
            'reports': 'Reports',
            'notifications': 'Notifications',
            'help': 'Help'
        };
        return `Home > ${labels[activeTab] || 'Dashboard'}`;
    };

    return (
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <DashboardHeader
                toggleSidebar={toggleSidebar}
                breadcrumb={getBreadcrumb()}
                userRole="state"
                stateName={stateName}
                showNotificationBell={false}
            />
            <DashboardSidebar menuItems={sidebarMenu} user={user} isOpen={isSidebarOpen} />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title-section">
                        <h3 style={{ margin: 0 }}>Dashboard - {stateName}</h3>
                    </div>
                    <div className="dashboard-actions">
                        <NotificationBell userRole="state" stateName={stateName} />
                    </div>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default StateDashboard;
