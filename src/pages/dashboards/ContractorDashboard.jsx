import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { t } from '../../utils/translations';
import ContractorDashboardPanel from './contractor/ContractorDashboardPanel';
import AssignedWorks from './contractor/AssignedWorks';
import WorkProgress from './contractor/WorkProgress';
import PaymentStatus from './contractor/PaymentStatus';
import ContractorHelp from './contractor/ContractorHelp';
import ExecutingAgencyNotifications from './contractor/ExecutingAgencyNotifications';
import {
    LayoutDashboard,
    ClipboardList,
    LineChart,
    Wallet,
    Bell,
    HelpCircle,
    LogOut
} from 'lucide-react';

const ContractorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { language } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // --- Lifted State ---
    const [works, setWorks] = useState([]);

    useEffect(() => {
        // Load work orders assigned to this executing agency only
        const fetchAssignedWorks = async () => {
            if (!user?.email || user?.role !== 'executing_agency') {
                setWorks([]);
                return;
            }

            try {
                const { supabase } = await import('../../lib/supabaseClient');


                // 1. Get executing agency ID using email-based matching
                const { data: allAgencies, error: agenciesError } = await supabase
                    .from('executing_agencies')
                    .select('id, agency_name, email, name');

                if (agenciesError) {
                    console.error('Error fetching agencies:', agenciesError);
                    return;
                }

                // Match by email
                const matchedAgency = allAgencies?.find(agency =>
                    agency.email && agency.email.toLowerCase() === user.email.toLowerCase()
                );

                if (!matchedAgency) {
                    console.warn('No agency matched for user:', user.email);
                    setWorks([]);
                    return;
                }

                console.log('✅ Matched agency:', matchedAgency.agency_name, matchedAgency.id);

                // Find all agencies with the same name
                const agencyName = matchedAgency.agency_name;
                const matchingAgencies = allAgencies.filter(agency =>
                    agency.agency_name === agencyName
                );
                const matchingIds = matchingAgencies.map(a => a.id);

                console.log(`✅ Found ${matchingAgencies.length} agencies with name "${agencyName}":`, matchingIds);

                // 2. Fetch work orders assigned to ANY of these executing agencies
                const { data: workOrdersData, error: workOrdersError } = await supabase
                    .from('work_orders')
                    .select('*')
                    .in('executing_agency_id', matchingIds)
                    .order('created_at', { ascending: false });

                if (workOrdersError) {
                    console.error('Error fetching work orders:', workOrdersError);
                    return;
                }

                console.log('✅ Fetched work orders:', workOrdersData?.length || 0);

                // 3. Get the latest progress for each work order
                if (workOrdersData && workOrdersData.length > 0) {
                    const workOrderIds = workOrdersData.map(w => w.id);

                    const { data: progressData, error: progressError } = await supabase
                        .from('work_progress')
                        .select('*')
                        .in('work_order_id', workOrderIds)
                        .order('created_at', { ascending: false });

                    if (progressError) {
                        console.error('Error fetching progress:', progressError);
                        setWorks(workOrdersData);
                        return;
                    }

                    // Merge with latest progress
                    const mergedWorks = workOrdersData.map(work => {
                        const latestUpdate = progressData?.find(p => p.work_order_id === work.id);

                        if (latestUpdate) {
                            return {
                                ...work,
                                progress: latestUpdate.progress_percentage,
                                fundsReleased: latestUpdate.funds_released,
                                fundsUsed: latestUpdate.funds_used,
                                fundsRemaining: latestUpdate.funds_remaining,
                                remarks: latestUpdate.remarks,
                                lastUpdated: new Date(latestUpdate.created_at).toISOString().split('T')[0],
                                officerName: latestUpdate.officer_name,
                                officerPhone: latestUpdate.officer_phone,
                                viewedByAgency: latestUpdate.viewed_by_agency,
                                viewedAt: latestUpdate.viewed_at
                            };
                        }
                        return {
                            ...work,
                            progress: work.progress || 0,
                            fundsReleased: work.funds_released || 0,
                            fundsUsed: work.funds_used || 0,
                            fundsRemaining: work.funds_remaining || 0,
                            remarks: work.remarks || '',
                            lastUpdated: null
                        };
                    });

                    setWorks(mergedWorks);
                } else {
                    setWorks([]);
                }
            } catch (error) {
                console.error('Error in fetchAssignedWorks:', error);
                setWorks([]);
            }
        };

        fetchAssignedWorks();
    }, [user?.email, user?.role]);


    // --- Handlers ---
    const handleUpdateProgress = (updatedWork, officerDetails) => {
        return import('../../services/WorkService').then(({ WorkService }) => {
            return WorkService.updateWork(updatedWork, officerDetails).then(newWorks => {
                setWorks(newWorks);
            });
        });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Calculate Stats
    const stats = {
        totalWorks: works.length,
        ongoing: works.filter(w => w.status === 'In Progress' || w.status === 'Work in Progress').length,
        completed: works.filter(w => w.status === 'Completed').length,
        pendingPayments: works.reduce((total, work) => {
            // Calculate pending payment as funds remaining for each work
            const remaining = work.fundsRemaining || 0;
            return total + remaining;
        }, 0)
    };

    const sidebarMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: <ClipboardList size={20} />, label: 'Assigned Works', action: () => setActiveTab('assigned-works'), active: activeTab === 'assigned-works' },
        { icon: <LineChart size={20} />, label: 'Update Progress', action: () => setActiveTab('work-progress'), active: activeTab === 'work-progress' },
        { icon: <Wallet size={20} />, label: 'Payment Status', action: () => setActiveTab('payment-status'), active: activeTab === 'payment-status' },
        { icon: <Bell size={20} />, label: 'Notifications', action: () => setActiveTab('notifications'), active: activeTab === 'notifications' },
        { icon: <HelpCircle size={20} />, label: 'Help/Support', action: () => setActiveTab('help'), active: activeTab === 'help' },
        { icon: <LogOut size={20} />, label: 'Logout', action: () => { logout(); navigate('/login'); }, isLogout: true }
    ];

    const formatCurrency = (amount) => {
        return `₹${(amount / 100000).toFixed(2)} Lakh`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <ContractorDashboardPanel
                    formatCurrency={formatCurrency}
                    stats={stats}
                    recentWorks={works.slice(0, 3)}
                    onNavigate={handleTabChange}
                />;
            case 'assigned-works':
                return <AssignedWorks />;
            case 'work-progress':
                return <WorkProgress works={works} onUpdateProgress={handleUpdateProgress} />;
            case 'payment-status':
                return <PaymentStatus />;
            case 'notifications':
                return <ExecutingAgencyNotifications />;
            case 'help':
                return <ContractorHelp />;
            default:
                return <ContractorDashboardPanel formatCurrency={formatCurrency} stats={stats} recentWorks={works.slice(0, 3)} onNavigate={handleTabChange} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'assigned-works': 'Assigned Works',
            'work-progress': 'Update Progress',
            'payment-status': 'Payment Status',
            'help': 'Help'
        };
        return `${t('home', language)} > ${labels[activeTab] || t('dashboard', language)}`;
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
                        <h3 style={{ margin: 0 }}>{user?.role === 'executing_agency' ? `${user?.full_name || user?.user_metadata?.full_name || 'Executing Agency'} Dashboard` : 'Contractor Dashboard'}</h3>
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

export default ContractorDashboard;
