import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';
import DistrictDashboardPanel from './district/DistrictDashboardPanel';
import ManageGPAdmins from './district/ManageGPAdmins';
import ExecutingAgencyList from './district/ExecutingAgencyList';
import FundsReceivedFromState from './district/FundsReceivedFromState';
import UploadUCs from './district/UploadUCs';
import DistrictReports from './district/DistrictReports';
import DistrictNotifications from './district/DistrictNotifications';
import DistrictHelp from './district/DistrictHelp';
import CreateProposal from './district/CreateProposal';
import AssignProjectsDistrict from './district/AssignProjectsDistrict';
import FundReleaseToAgencies from './district/FundReleaseToAgencies';
import {
    LayoutDashboard,
    FilePlus,
    ClipboardList,
    Users,
    Wallet,
    Upload,
    FileBarChart,
    Bell,
    HelpCircle,
    LogOut,
    Send
} from 'lucide-react';

const DistrictDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [districtName, setDistrictName] = useState('Loading...');
    const [districtId, setDistrictId] = useState(null);
    const [stateId, setStateId] = useState(null);
    const [stateName, setStateName] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Fetch district name from user profile
    React.useEffect(() => {
        const fetchDistrictName = async () => {
            if (user?.id) {
                try {
                    console.log('Fetching profile for user:', user.id);
                    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=full_name`, {
                        headers: {
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                        }
                    });
                    const data = await response.json();
                    console.log('Profile Data:', data);

                    if (data[0]?.full_name) {
                        // Extract district name (e.g., "Pune District Admin" -> "Pune")
                        const name = data[0].full_name.replace(' District Admin', '').replace(' Admin', '').trim();
                        console.log('Extracted District Name:', name);
                        setDistrictName(name);

                        // Fetch District ID and State ID
                        const districtRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/districts?name=eq.${name}&select=id,state_id`, {
                            headers: {
                                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                            }
                        });
                        const districtData = await districtRes.json();
                        console.log('District Data:', districtData);

                        if (districtData && districtData.length > 0) {
                            setDistrictId(districtData[0].id);
                            setStateId(districtData[0].state_id);
                            console.log('Set District ID:', districtData[0].id, 'State ID:', districtData[0].state_id);

                            // Fetch State Name
                            if (districtData[0].state_id) {
                                try {
                                    const stateRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/states?id=eq.${districtData[0].state_id}&select=name`, {
                                        headers: {
                                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                                        }
                                    });
                                    const stateData = await stateRes.json();
                                    if (stateData && stateData.length > 0) {
                                        console.log('Fetched State Name:', stateData[0].name);
                                        setStateName(stateData[0].name);
                                    }
                                } catch (err) {
                                    console.error('Error fetching state name:', err);
                                }
                            }
                        } else {
                            console.error('District not found for name:', name);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching district name:', error);
                    setDistrictName('District');
                }
            }
        };
        fetchDistrictName();
    }, [user?.id, user?.email]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sidebarMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: <FilePlus size={20} />, label: 'Create Proposal', action: () => setActiveTab('create-proposal'), active: activeTab === 'create-proposal' },
        { icon: <ClipboardList size={20} />, label: 'Assign Projects', action: () => setActiveTab('assign-projects'), active: activeTab === 'assign-projects' },
        { icon: <Users size={20} />, label: 'Manage Implementing Agencies', action: () => setActiveTab('gp-admins'), active: activeTab === 'gp-admins' },
        { icon: <Users size={20} />, label: 'Executing Agency List', action: () => setActiveTab('executing-agencies'), active: activeTab === 'executing-agencies' },
        { icon: <Wallet size={20} />, label: 'Funds Received from State', action: () => setActiveTab('funds-received'), active: activeTab === 'funds-received' },
        { icon: <Send size={20} />, label: 'Fund Release to Agencies', action: () => setActiveTab('fund-release'), active: activeTab === 'fund-release' },
        { icon: <Upload size={20} />, label: 'Upload UCs', action: () => setActiveTab('ucs'), active: activeTab === 'ucs' },
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
                return <DistrictDashboardPanel formatCurrency={formatCurrency} districtId={districtId} stateId={stateId} />;
            case 'create-proposal':
                return <CreateProposal districtId={districtId} />;
            case 'assign-projects':
                return <AssignProjectsDistrict districtId={districtId} stateId={stateId} stateName={stateName} />;
            case 'gp-admins':
                return <ManageGPAdmins />;
            case 'executing-agencies':
                return <ExecutingAgencyList />;
            case 'funds-received':
                return <FundsReceivedFromState formatCurrency={formatCurrency} districtId={districtId} />;
            case 'fund-release':
                return <FundReleaseToAgencies formatCurrency={formatCurrency} />;
            case 'ucs':
                return <UploadUCs />;
            case 'reports':
                return <DistrictReports />;
            case 'notifications':
                return <DistrictNotifications />;
            case 'help':
                return <DistrictHelp />;
            default:
                return <DistrictDashboardPanel formatCurrency={formatCurrency} districtId={districtId} stateId={stateId} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'create-proposal': 'Create Proposal',
            'assign-projects': 'Assign Projects',
            'gp-admins': 'Manage Implementing Agencies',
            'funds-received': 'Funds Received from State',
            'fund-release': 'Fund Release to Agencies',
            'ucs': 'Upload UCs',
            'reports': 'Reports',
            'notifications': 'Notifications',
            'help': 'Help'
        };
        return `Home > ${labels[activeTab] || 'Dashboard'}`;
    };

    return (
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <DashboardHeader toggleSidebar={toggleSidebar} breadcrumb={getBreadcrumb()} showNotificationBell={false} />
            <DashboardSidebar menuItems={sidebarMenu} user={user} isOpen={isSidebarOpen} />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title-section">
                        <h3 style={{ margin: 0 }}>District Dashboard - {districtName}</h3>
                    </div>
                    <div className="dashboard-actions">
                        <NotificationBell userRole="district" districtName={districtName} />
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default DistrictDashboard;
