import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Search, Filter, Download, Eye } from 'lucide-react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';

const MonitorProgressState = ({ stateName, stateId }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [districtFilter, setDistrictFilter] = useState('All');
    const [districts, setDistricts] = useState([]);

    // Modal State
    const [selectedProject, setSelectedProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [projectHistory, setProjectHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (stateName) {
            fetchProjects();
        }
    }, [stateName]);

    // Fetch all districts for the state
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!stateId) return;

            try {
                const { data, error } = await supabase
                    .from('districts')
                    .select('name')
                    .eq('state_id', stateId)
                    .order('name');

                if (error) throw error;

                if (data) {
                    setDistricts(data.map(d => d.name));
                }
            } catch (err) {
                console.error('Error fetching districts:', err);
            }
        };

        fetchDistricts();
    }, [stateId]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            console.log('Fetching projects for state:', stateName);

            // 1. Get all implementing agencies for this state
            const { data: agencies, error: agencyError } = await supabase
                .from('implementing_agencies')
                .select('id, district_name, agency_name') // Added agency_name
                .ilike('state_name', stateName);

            if (agencyError) throw agencyError;

            // Create lookup map for Implementing Agencies
            const iaMap = {};
            agencies.forEach(a => {
                iaMap[a.id] = a;
            });

            const agencyIds = agencies.map(a => a.id);

            if (agencyIds.length === 0) {
                setProjects([]);
                setLoading(false);
                return;
            }

            // 2. Get work orders for these agencies (No Joins)
            const { data: works, error: workError } = await supabase
                .from('work_orders')
                .select('*') // No joins here to avoid FK error
                .in('implementing_agency_id', agencyIds)
                .order('created_at', { ascending: false });

            if (workError) throw workError;

            // 3. Get Executing Agencies details
            const eaIds = [...new Set(works.map(w => w.executing_agency_id).filter(Boolean))];
            let eaMap = {};

            if (eaIds.length > 0) {
                const { data: eas, error: eaError } = await supabase
                    .from('executing_agencies')
                    .select('id, agency_name')
                    .in('id', eaIds);

                if (!eaError && eas) {
                    eas.forEach(ea => {
                        eaMap[ea.id] = ea;
                    });
                }
            }

            // 4. Merge Data
            const enrichedWorks = works.map(work => ({
                ...work,
                implementing_agencies: iaMap[work.implementing_agency_id] || {},
                executing_agencies: eaMap[work.executing_agency_id] || {}
            }));

            console.log('Fetched works:', enrichedWorks);
            setProjects(enrichedWorks || []);

        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (project) => {
        setSelectedProject(project);
        setShowModal(true);
        setLoadingHistory(true);

        try {
            const { data, error } = await supabase
                .from('work_progress')
                .select('*')
                .eq('work_order_id', project.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjectHistory(data || []);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProject(null);
        setProjectHistory([]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10B981'; // Green
            case 'In Progress': return '#3B82F6'; // Blue
            case 'Pending': return '#F59E0B'; // Amber
            case 'Not Started': return '#EF4444'; // Red
            default: return '#6B7280'; // Gray
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.id?.toString().includes(searchTerm) ||
            project.location?.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'All' || project.status === statusFilter;

        const projectDistrict = project.implementing_agencies?.district_name;

        // District Alias Map for common renames (especially Karnataka)
        const districtAliases = {
            'bengaluru': ['bangalore', 'bangalore urban', 'bangalore rural'],
            'bangalore': ['bengaluru'],
            'bangalore urban': ['bengaluru'],
            'bangalore rural': ['bengaluru'],
            'belagavi': ['belgaum'],
            'belgaum': ['belagavi'],
            'kalaburagi': ['gulbarga'],
            'gulbarga': ['kalaburagi'],
            'vijayapura': ['bijapur'],
            'bijapur': ['vijayapura'],
            'shivamogga': ['shimoga'],
            'shimoga': ['shivamogga'],
            'mysuru': ['mysore'],
            'mysore': ['mysuru'],
            'mangaluru': ['mangalore'],
            'mangalore': ['mangaluru'],
            'ballari': ['bellary'],
            'bellary': ['ballari']
        };

        let matchesDistrict = false;
        if (districtFilter === 'All') {
            matchesDistrict = true;
        } else if (projectDistrict) {
            const pDist = projectDistrict.trim().toLowerCase();
            const fDist = districtFilter.trim().toLowerCase();

            // 1. Exact match
            if (pDist === fDist) matchesDistrict = true;
            // 2. Contains match
            else if (pDist.includes(fDist) || fDist.includes(pDist)) matchesDistrict = true;
            // 3. Alias match
            else if (districtAliases[fDist]?.includes(pDist) || districtAliases[pDist]?.includes(fDist)) matchesDistrict = true;
        }

        return matchesSearch && matchesStatus && matchesDistrict;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleExport = () => {
        if (!filteredProjects.length) {
            alert('No projects to export');
            return;
        }

        const headers = ['Project Title', 'District', 'Location', 'Implementing Agency', 'Executing Agency', 'Amount', 'Funds Released', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredProjects.map(p => [
                `"${p.title?.replace(/"/g, '""') || ''}"`,
                `"${p.implementing_agencies?.district_name || ''}"`,
                `"${p.location?.replace(/"/g, '""') || ''}"`,
                `"${p.implementing_agencies?.agency_name || ''}"`,
                `"${p.executing_agencies?.agency_name || ''}"`,
                p.amount || 0,
                p.funds_released || 0,
                `"${p.status || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `monitor_progress_report_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="dashboard-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title">Monitor Progress - {stateName}</h2>
                <InteractiveButton
                    variant="secondary"
                    onClick={handleExport}
                    style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                    <Download size={18} />
                    Export Report
                </InteractiveButton>
            </div>

            {/* Filters */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Search projects by title, ID, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            outline: 'none',
                            appearance: 'none',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div style={{ position: 'relative' }}>
                    <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <select
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            outline: 'none',
                            appearance: 'none',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="All">All Districts</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#202076ff', color: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' }}>Project Title</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' }}>District / Location</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' }}>Agencies</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' }}>Financials</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                                        Loading projects...
                                    </td>
                                </tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                                        No projects found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '500', color: '#111827' }}>{project.title}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>ID: {project.id}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ color: '#111827' }}>{project.implementing_agencies?.district_name || 'N/A'}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{project.location}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontSize: '13px' }}>
                                                <span style={{ color: '#000080', fontWeight: '600' }}>IA: </span>
                                                <span style={{ fontWeight: '500' }}>{project.implementing_agencies?.agency_name || 'Unassigned'}</span>
                                            </div>
                                            <div style={{ fontSize: '13px', marginTop: '4px' }}>
                                                <span style={{ color: '#000080', fontWeight: '600' }}>EA: </span>
                                                <span style={{ fontWeight: '500' }}>{project.executing_agencies?.agency_name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '500', color: '#111827' }}>{formatCurrency(project.amount)}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                                Released: <span style={{ color: '#10B981', fontWeight: '600' }}>{formatCurrency(project.funds_released || 0)}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: `${getStatusColor(project.status)}20`,
                                                color: getStatusColor(project.status)
                                            }}>
                                                {project.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                                <InteractiveButton
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(project)}
                                                >
                                                    <Eye size={16} style={{ marginRight: '5px' }} /> View
                                                </InteractiveButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Project Details Modal */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title="Work Progress Details"
                footer={
                    <button
                        onClick={closeModal}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#F59E0B',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Close
                    </button>
                }
            >
                {selectedProject && (
                    <div>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>{selectedProject.title}</h3>
                            <p style={{ color: '#6B7280', margin: 0 }}>{selectedProject.location}</p>
                        </div>

                        {/* Financials Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '24px',
                            marginBottom: '32px'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Funds Released</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>
                                    {formatCurrency(selectedProject.funds_released || 0)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Funds Used</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                    {formatCurrency(selectedProject.funds_used || 0)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Funds Remaining</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                    {formatCurrency((selectedProject.funds_released || 0) - (selectedProject.funds_used || 0))}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Progress %</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                    {selectedProject.progress || 0}%
                                </div>
                            </div>
                        </div>

                        {/* Latest Remarks */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Latest Remarks</div>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                color: '#374151'
                            }}>
                                {selectedProject.remarks || 'No remarks available.'}
                            </div>
                        </div>

                        {/* Submission History */}
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Submission History</h4>
                            {loadingHistory ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>Loading history...</div>
                            ) : projectHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                    No progress reports submitted yet.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {projectHistory.map((report) => (
                                        <div key={report.id} style={{
                                            backgroundColor: '#F0F9FF',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            border: '1px solid #E0F2FE'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </div>
                                                <span style={{
                                                    backgroundColor: '#DBEAFE',
                                                    color: '#1E40AF',
                                                    padding: '2px 8px',
                                                    borderRadius: '9999px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {report.progress_percentage}%
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                                                Released: {formatCurrency(report.funds_released)} | Used: {formatCurrency(report.funds_used)}
                                            </div>

                                            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '12px', fontStyle: 'italic' }}>
                                                "{report.remarks}"
                                            </div>

                                            {/* Photos */}
                                            {report.photos && report.photos.length > 0 && (
                                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                                                    {report.photos.map((photo, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={photo}
                                                            alt={`Progress ${idx + 1}`}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                border: '1px solid #E5E7EB',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => window.open(photo, '_blank')}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MonitorProgressState;
