import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';
import DepartmentDashboardPanel from './department/DepartmentDashboardPanel';
import WorkOrders from './department/WorkOrders';
import DPRUpload from './department/DPRUpload';
import DepartmentReports from './department/DepartmentReports';
import DepartmentNotifications from './department/DepartmentNotifications';
import DepartmentHelp from './department/DepartmentHelp';
import ManageExecutingAgencies from './department/ManageExecutingAgencies';
import AssignProjects from './department/AssignProjects';
import AgencyProjects from './department/AgencyProjects';

import ExecutingAgencyList from './department/ExecutingAgencyList';
import CreateProposalAgency from './department/CreateProposalAgency';
import FundsReceivedFromState from './department/FundsReceivedFromState';
import { mockProjects } from '../../data/mockData';
import {
    LayoutDashboard,
    Folder,
    Users,
    ClipboardList,
    Activity,
    Upload,
    FileBarChart,
    FileText,
    Bell,
    HelpCircle,
    LogOut,
    IndianRupee
} from 'lucide-react';

const DepartmentDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [districtName, setDistrictName] = useState('');
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch district name for implementing agencies
    useEffect(() => {
        const fetchDistrictName = async () => {
            if (!user) {
                console.log('⏳ No user yet');
                return;
            }

            console.log('👤 User role:', user.role);
            console.log('📧 User email:', user.email);

            if (user.role !== 'implementing_agency') {
                console.log('⚠️ Not an implementing agency, skipping district fetch');
                return;
            }

            try {
                console.log('🔍 Fetching district name for user ID:', user.id);
                const { supabase } = await import('../../lib/supabaseClient');

                // District code mapping from email pattern
                const districtCodeMap = {
                    'eg': 'East Godavari',
                    'wg': 'West Godavari',
                    'kr': 'Kurnool',
                    'vz': 'Vizianagaram',
                    'vs': 'Visakhapatnam',
                    'sk': 'Srikakulam',
                    'gn': 'Guntur',
                    'nl': 'Nellore',
                    'cd': 'Chittoor',
                    'ap': 'Anantapur',
                    'kd': 'Kadapa'
                };

                // First, try to parse district from email pattern
                // Email format: ap-eg.district@pmajay.gov.in
                if (user.email && user.email.includes('.district@pmajay.gov.in')) {
                    const emailPrefix = user.email.split('.district@')[0]; // e.g., "ap-eg"
                    const parts = emailPrefix.split('-');
                    if (parts.length >= 2) {
                        const districtCode = parts[1]; // e.g., "eg"
                        const districtFromCode = districtCodeMap[districtCode];
                        console.log('📧 Parsed district from email:', districtCode, '->', districtFromCode);

                        if (districtFromCode) {
                            // Look up exact name from DB
                            const { data: districtData } = await supabase
                                .from('districts')
                                .select('name')
                                .ilike('name', `%${districtFromCode}%`)
                                .limit(1);

                            if (districtData && districtData.length > 0) {
                                console.log('✅ District found from email:', districtData[0].name);
                                setDistrictName(districtData[0].name);
                                return;
                            } else {
                                // Use the mapped name if not found in DB
                                setDistrictName(districtFromCode);
                                return;
                            }
                        }
                    }
                }

                // Fallback: try by user_id
                let { data: agencies, error } = await supabase
                    .from('implementing_agencies')
                    .select(`
                        district_id,
                        agency_name,
                        districts (
                            name
                        )
                    `)
                    .eq('user_id', user.id)
                    .limit(1);

                if (error) {
                    console.error('❌ Error fetching district name:', error);
                    return;
                }

                if (agencies && agencies.length > 0 && agencies[0].districts) {
                    console.log('✅ District found:', agencies[0].districts.name);
                    setDistrictName(agencies[0].districts.name);
                } else {
                    console.warn('⚠️ No agency found for user');
                }
            } catch (err) {
                console.error('❌ Error loading district name:', err);
            }
        };

        fetchDistrictName();
    }, [user]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // --- Lifted State ---

    // Work Orders (Initialize with data from WorkService)
    const [workOrders, setWorkOrders] = useState([]);

    const loadWorkOrders = async () => {
        if (!user) return;

        console.log('Loading Work Orders for User:', user.id, 'Role:', user.role);

        const { WorkService } = await import('../../services/WorkService');
        const { supabase } = await import('../../lib/supabaseClient');

        if (user.role === 'implementing_agency') {
            // Fetch the Agency ID for this user
            try {
                const { data: agencies, error: agencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name')
                    .eq('user_id', user.id)
                    .limit(1);

                if (agencyError) {
                    console.error('Error fetching agency ID:', agencyError);
                    return;
                }

                console.log('Fetched Agencies:', agencies);

                if (agencies && agencies.length > 0) {
                    const agencyData = agencies[0];
                    console.log('Fetching works for Agency ID:', agencyData.id);
                    const data = await WorkService.getWorksByAgency(agencyData.id);
                    console.log('Fetched Work Orders:', data);
                    setWorkOrders(data);
                } else {
                    console.warn('No agency found for this user.');
                }
            } catch (err) {
                console.error('Error loading agency works:', err);
            }
        } else {
            // For Department/Admin, fetch all (or filter by department if needed later)
            WorkService.getAllWorks().then(data => {
                setWorkOrders(data);
            });
        }
    };

    useEffect(() => {
        loadWorkOrders();
        // Add event listener for storage changes to sync across tabs/windows
        window.addEventListener('storage', loadWorkOrders);
        return () => window.removeEventListener('storage', loadWorkOrders);
    }, [user]);

    // DPRs (Initialize with sample data from DPRUpload.jsx)
    const [dprs, setDprs] = useState([
        { id: 1, title: 'New Community Center', location: 'Shirur GP', estimatedCost: '0.50 Cr', date: '2025-11-20', status: 'Submitted', file: 'dpr_shirur_cc.pdf' },
        { id: 2, title: 'Village Road Phase 2', location: 'Khed GP', estimatedCost: '0.80 Cr', date: '2025-11-18', status: 'Draft', file: 'dpr_khed_road.pdf' },
    ]);

    // --- Handlers ---

    const handleAddDPR = (newDPR) => {
        setDprs([newDPR, ...dprs]);
    };

    const handleUpdateWorkOrder = (updatedOrder) => {
        import('../../services/WorkService').then(({ WorkService }) => {
            // Department updates status, not progress details, so pass empty officer details or handle differently
            // For now, we just update the status which is part of updatedOrder
            WorkService.updateWork(updatedOrder, {}).then(newWorks => {
                setWorkOrders(newWorks);
            });
        });
    };

    const handleViewProgress = (updatedWorks) => {
        setWorkOrders(updatedWorks);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    // Calculate Stats for Dashboard Panel
    const stats = {
        totalWorks: workOrders.length,
        ongoing: workOrders.filter(o => o.status === 'In Progress' || o.status === 'Work in Progress' || o.status === 'Assigned to EA').length,
        completed: workOrders.filter(o => o.status === 'Completed').length,
        pendingDPR: dprs.filter(d => d.status === 'Draft' || d.status === 'Submitted').length,
        fundsAllocated: workOrders.reduce((total, work) => total + (work.amount || 0), 0),
        fundsUtilized: workOrders.reduce((total, work) => total + (work.fundsUsed || 0), 0)
    };

    const sidebarMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: <IndianRupee size={20} />, label: 'Funds Received', action: () => setActiveTab('funds-received'), active: activeTab === 'funds-received' },
        { icon: <FileText size={20} />, label: 'Create Proposal', action: () => setActiveTab('create-proposal'), active: activeTab === 'create-proposal' },
        { icon: <Folder size={20} />, label: 'Projects', action: () => setActiveTab('projects'), active: activeTab === 'projects' },
        { icon: <Users size={20} />, label: 'Executing Agencies', action: () => setActiveTab('executing-agencies-list'), active: activeTab === 'executing-agencies-list' },
        { icon: <Users size={20} />, label: 'Manage Executing Agency', action: () => setActiveTab('executing-agencies'), active: activeTab === 'executing-agencies' },
        { icon: <ClipboardList size={20} />, label: 'Assign Projects', action: () => setActiveTab('assign-projects'), active: activeTab === 'assign-projects' },
        { icon: <Activity size={20} />, label: 'Work Progress', action: () => setActiveTab('work-orders'), active: activeTab === 'work-orders' },
        { icon: <Upload size={20} />, label: 'DPR Upload', action: () => setActiveTab('dpr-upload'), active: activeTab === 'dpr-upload' },
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
                return <DepartmentDashboardPanel
                    formatCurrency={formatCurrency}
                    stats={stats}
                    recentOrders={workOrders.slice(0, 3)}
                    projects={workOrders}
                    onNavigate={handleTabChange}
                />;
            case 'funds-received':
                return <FundsReceivedFromState />;
            case 'create-proposal':
                return <CreateProposalAgency />;
            case 'projects':
                return <AgencyProjects />;
            case 'executing-agencies-list':
                return <ExecutingAgencyList />;
            case 'executing-agencies':
                return <ManageExecutingAgencies />;
            case 'assign-projects':
                return <AssignProjects />;
            case 'work-orders':
                return <WorkOrders
                    orders={workOrders}
                    onUpdateOrder={handleUpdateWorkOrder}
                    onViewProgress={handleViewProgress}
                />;
            case 'dpr-upload':
                return <DPRUpload
                    dprs={dprs}
                    onAddDPR={handleAddDPR}
                />;
            case 'reports':
                return <DepartmentReports />;
            case 'notifications':
                return <DepartmentNotifications />;
            case 'help':
                return <DepartmentHelp />;
            default:
                return <DepartmentDashboardPanel formatCurrency={formatCurrency} stats={stats} recentOrders={workOrders.slice(0, 3)} projects={workOrders} onNavigate={handleTabChange} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'funds-received': 'Funds Received',
            'create-proposal': 'Create Proposal',
            'projects': 'Projects',
            'executing-agencies-list': 'Executing Agencies',
            'executing-agencies': 'Manage Executing Agencies',
            'assign-projects': 'Assign Projects',
            'work-orders': 'Work Progress',
            'dpr-upload': 'DPR Upload',
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
                showNotificationBell={false}
            />
            <DashboardSidebar menuItems={sidebarMenu} user={user} isOpen={isSidebarOpen} />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title-section">
                        <h3 style={{ margin: 0 }}>
                            {user?.role === 'implementing_agency'
                                ? districtName
                                    ? `Implementing Agency - ${districtName}`
                                    : 'Implementing Agency'
                                : user?.email?.toLowerCase().includes('nod') ? 'NOD Dashboard'
                                    : user?.email?.toLowerCase().includes('ngo') ? 'NGO Dashboard'
                                        : 'Department Dashboard'}
                        </h3>
                    </div>
                    <div className="dashboard-actions">
                        <NotificationBell userRole="department" />
                    </div>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default DepartmentDashboard;
