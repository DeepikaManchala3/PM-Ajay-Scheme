import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Check, Building2, MapPin, Calendar, IndianRupee, AlertCircle } from 'lucide-react';
import InteractiveButton from '../../../components/InteractiveButton';

const CentralProjectsAssignment = ({ stateName, stateId }) => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all'); // all, district_project, village_fund
    const [filterDistrict, setFilterDistrict] = useState('all');
    const [districts, setDistricts] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [availableOfficers, setAvailableOfficers] = useState([]);
    const [showOfficerModal, setShowOfficerModal] = useState(false);
    const [assigningOfficer, setAssigningOfficer] = useState(false);
    const [toast, setToast] = useState(null);

    const API_BASE_URL = 'http://localhost:5001/api';

    // Fetch central projects
    useEffect(() => {
        if (stateId) {
            fetchCentralProjects();
        }
    }, [stateId]);

    // Extract unique districts from projects
    useEffect(() => {
        if (projects.length > 0) {
            const uniqueDistricts = [...new Set(projects.map(p => p.district_name))].filter(Boolean).sort();
            setDistricts(uniqueDistricts);
        }
    }, [projects]);

    // Apply filters
    useEffect(() => {
        let filtered = [...projects];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.component?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.district_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.village_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter (District Level vs Village Level)
        if (filterType !== 'all') {
            filtered = filtered.filter(p => p.type === filterType);
        }

        // District filter
        if (filterDistrict !== 'all') {
            filtered = filtered.filter(p => p.district_name === filterDistrict);
        }

        // Status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'assigned') {
                filtered = filtered.filter(p => p.executing_agency_id);
            } else if (filterStatus === 'unassigned') {
                filtered = filtered.filter(p => !p.executing_agency_id);
            }
        }

        setFilteredProjects(filtered);
    }, [searchTerm, filterType, filterDistrict, filterStatus, projects]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCentralProjects = async () => {
        if (!stateId) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/state-admins/central-projects?stateId=${stateId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            
            const data = await response.json();
            setProjects(Array.isArray(data) ? data : []);
            setFilteredProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching central projects:', error);
            showToast('Failed to load central projects', 'error');
            setProjects([]);
            setFilteredProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableOfficers = async (districtName, projectId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/state-admins/available-eas?districtName=${encodeURIComponent(districtName)}&stateId=${stateId}`
            );
            
            if (!response.ok) throw new Error('Failed to fetch implementing agencies');
            
            const data = await response.json();
            const officers = data.officers || data || [];
            setAvailableOfficers(Array.isArray(officers) ? officers : []);
        } catch (error) {
            console.error('Error fetching available implementing agencies:', error);
            showToast('Failed to load implementing agencies', 'error');
            setAvailableOfficers([]);
        }
    };

    const handleAssignOfficer = async (project) => {
        setSelectedProject(project);
        await fetchAvailableOfficers(project.district_name, project.id);
        setShowOfficerModal(true);
    };

    const confirmAssignOfficer = async (officer) => {
        // Show confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to assign this project to ${officer.name}?\n\n` +
            `Project: ${selectedProject.project_name}\n` +
            `District: ${selectedProject.district_name}\n` +
            `Implementing Agency: ${officer.name}\n\n` +
            `Note: One implementing agency can have multiple projects assigned.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setAssigningOfficer(true);
            const response = await fetch(`${API_BASE_URL}/state-admins/assign-ea`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: selectedProject.id, // Will be "district-123" or "village-456"
                    projectType: selectedProject.type,
                    eaId: officer.id,
                    eaName: officer.name,
                    stateId: stateId
                })
            });

            if (!response.ok) throw new Error('Failed to assign implementing agency');

            const result = await response.json();
            showToast(`Successfully assigned ${officer.name} to ${selectedProject.project_name}`, 'success');
            
            // Refresh projects
            await fetchCentralProjects();
            closeModal();
        } catch (error) {
            console.error('Error assigning implementing agency:', error);
            showToast('Failed to assign implementing agency', 'error');
        } finally {
            setAssigningOfficer(false);
        }
    };

    const closeModal = () => {
        setShowOfficerModal(false);
        setSelectedProject(null);
        setAvailableOfficers([]);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f0f0f0',
                    borderTopColor: '#1976d2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666' }}>Loading central projects...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    background: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease'
                }}>
                    {toast.message}
                </div>
            )}

            {/* Stats Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #1976d2'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1976d2' }}>
                        {projects.length}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Total Projects
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #10b981'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                        {projects.filter(p => p.executing_agency_id).length}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Assigned
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                        {projects.filter(p => !p.executing_agency_id).length}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Pending Assignment
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
            }}>
                {/* Search Bar */}
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: '#999'
                        }} />
                        <input
                            type="text"
                            placeholder="Search by project name, component, district, or village..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '0.95rem'
                            }}
                        />
                        {searchTerm && (
                            <X 
                                size={18} 
                                onClick={() => setSearchTerm('')}
                                style={{ 
                                    position: 'absolute', 
                                    right: '12px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    color: '#999'
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Filter Buttons and Dropdowns */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {/* Level Filter */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.85rem', 
                            color: '#666', 
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                        }}>
                            Level
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: 'white',
                                minWidth: '150px'
                            }}
                        >
                            <option value="all">All Levels</option>
                            <option value="district_project">District Level</option>
                            <option value="village_fund">Village Level</option>
                        </select>
                    </div>

                    {/* District Filter */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.85rem', 
                            color: '#666', 
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                        }}>
                            District
                        </label>
                        <select
                            value={filterDistrict}
                            onChange={(e) => setFilterDistrict(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: 'white',
                                minWidth: '180px'
                            }}
                        >
                            <option value="all">All Districts</option>
                            {districts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Buttons */}
                    <div style={{ marginLeft: 'auto' }}>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '0.85rem', 
                            color: '#666', 
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                        }}>
                            Status
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['all', 'assigned', 'unassigned'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        border: '1px solid #ddd',
                                        background: filterStatus === status ? '#1976d2' : 'white',
                                        color: filterStatus === status ? 'white' : '#666',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {status === 'all' ? 'All' : status === 'assigned' ? 'Assigned' : 'Unassigned'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {(filterType !== 'all' || filterDistrict !== 'all' || searchTerm) && (
                    <div style={{ 
                        marginTop: '1rem', 
                        paddingTop: '1rem', 
                        borderTop: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                            Active Filters:
                        </span>
                        {filterType !== 'all' && (
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: '#e0e7ff',
                                color: '#4338ca',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                {filterType === 'district_project' ? '🏛 District Level' : '🏘 Village Level'}
                                <X size={14} onClick={() => setFilterType('all')} style={{ cursor: 'pointer' }} />
                            </span>
                        )}
                        {filterDistrict !== 'all' && (
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                📍 {filterDistrict}
                                <X size={14} onClick={() => setFilterDistrict('all')} style={{ cursor: 'pointer' }} />
                            </span>
                        )}
                        {searchTerm && (
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: '#dcfce7',
                                color: '#166534',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                🔍 "{searchTerm}"
                                <X size={14} onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }} />
                            </span>
                        )}
                    </div>
                )}
            </div>

            {filteredProjects.length === 0 ? (
                <div style={{
                    background: 'white',
                    padding: '4rem 2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <AlertCircle size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                    <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No Projects Found</h3>
                    <p style={{ color: '#999' }}>
                        {searchTerm || filterStatus !== 'all' 
                            ? 'No central projects match your current filters' 
                            : 'No central projects available for assignment'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredProjects.map((project) => (
                        <div key={project.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '1rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid #f0f0f0',
                                gap: '0.5rem'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ 
                                        margin: '0 0 0.5rem 0', 
                                        fontSize: '1.1rem',
                                        color: '#1e293b'
                                    }}>{project.project_name}</h3>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: project.type === 'village_fund' ? '#e0e7ff' : '#fef3c7',
                                        color: project.type === 'village_fund' ? '#4338ca' : '#92400e'
                                    }}>
                                        {project.type === 'village_fund' ? '🏘 Village Fund' : '🏛 District Project'}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    background: project.executing_agency_id ? '#dcfce7' : '#fef3c7',
                                    color: project.executing_agency_id ? '#166534' : '#92400e',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {project.executing_agency_id ? '✓ Assigned' : '⏱ Pending'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <Building2 size={16} style={{ color: '#64748b' }} />
                                    <span style={{ color: '#64748b', fontWeight: '500' }}>Component:</span>
                                    <span style={{ color: '#1e293b', fontWeight: '600' }}>{project.component}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <MapPin size={16} style={{ color: '#64748b' }} />
                                    <span style={{ color: '#64748b', fontWeight: '500' }}>District:</span>
                                    <span style={{ color: '#1e293b', fontWeight: '600' }}>{project.district_name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <IndianRupee size={16} style={{ color: '#64748b' }} />
                                    <span style={{ color: '#64748b', fontWeight: '500' }}>Estimated Cost:</span>
                                    <span style={{ color: '#1e293b', fontWeight: '600' }}>{formatCurrency(project.estimated_cost)}</span>
                                </div>
                                {project.allocated_amount > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <IndianRupee size={16} style={{ color: '#64748b' }} />
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Allocated:</span>
                                        <span style={{ color: '#1e293b', fontWeight: '600' }}>{formatCurrency(project.allocated_amount)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <Calendar size={16} style={{ color: '#64748b' }} />
                                    <span style={{ color: '#64748b', fontWeight: '500' }}>Created:</span>
                                    <span style={{ color: '#1e293b', fontWeight: '600' }}>{formatDate(project.created_at)}</span>
                                </div>
                            </div>

                            {project.description && (
                                <div style={{
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem',
                                    color: '#475569',
                                    lineHeight: '1.5'
                                }}>
                                    <p style={{ margin: 0 }}>{project.description}</p>
                                </div>
                            )}

                            {project.executing_agency_id ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: '#dcfce7',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '8px'
                                }}>
                                    <Check size={16} style={{ color: '#166534', marginTop: '2px' }} />
                                    <div>
                                        <strong style={{ display: 'block', color: '#166534', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                            Assigned Implementing Agency:
                                        </strong>
                                        <p style={{ margin: '0 0 0.25rem 0', color: '#15803d', fontWeight: '600' }}>
                                            {project.executing_agency_name}
                                        </p>
                                        <small style={{ color: '#16a34a', fontSize: '0.8rem' }}>
                                            Assigned on {formatDate(project.assigned_to_ea_at)}
                                        </small>
                                    </div>
                                </div>
                            ) : (
                                <InteractiveButton
                                    onClick={() => handleAssignOfficer(project)}
                                    style={{ width: '100%' }}
                                >
                                    <Building2 size={18} />
                                    Assign Implementing Agency
                                </InteractiveButton>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Implementing Agency Selection Modal */}
            {showOfficerModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={closeModal}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '85vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Select Implementing Agency</h3>
                            <button onClick={closeModal} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                transition: 'all 0.2s'
                            }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto' }}>
                            <div style={{
                                background: '#f0f9ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '8px',
                                padding: '1rem 1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '1.1rem' }}>
                                    {selectedProject?.project_name}
                                </h4>
                                <p style={{ 
                                    margin: 0, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    color: '#3b82f6', 
                                    fontSize: '0.9rem' 
                                }}>
                                    <MapPin size={14} />
                                    District: {selectedProject?.district_name}
                                </p>
                            </div>

                            {availableOfficers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#64748b' }}>
                                    <AlertCircle size={36} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                    <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '500' }}>No implementing agency available for this district</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Please add an implementing agency for this district in Manage Implementing Agencies.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {availableOfficers.map((officer) => (
                                        <div key={officer.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1.25rem',
                                            background: 'white',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1.05rem', fontWeight: '600' }}>
                                                    {officer.name}
                                                </h4>
                                                <p style={{ margin: '0 0 0.75rem 0', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                    {officer.role}
                                                </p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <MapPin size={14} /> {officer.district}
                                                    </span>
                                                    <span>📧 {officer.email}</span>
                                                    {officer.phone && <span>📞 {officer.phone}</span>}
                                                </div>
                                                {officer.status && (
                                                    <span style={{
                                                        display: 'inline-block',
                                                        marginTop: '0.5rem',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        background: officer.status === 'Activated' ? '#dcfce7' : '#fef3c7',
                                                        color: officer.status === 'Activated' ? '#166534' : '#92400e'
                                                    }}>
                                                        {officer.status === 'Activated' ? '✓ Active' : officer.status}
                                                    </span>
                                                )}
                                            </div>
                                            <InteractiveButton
                                                onClick={() => confirmAssignOfficer(officer)}
                                                disabled={assigningOfficer}
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                {assigningOfficer ? 'Assigning...' : 'Assign'}
                                            </InteractiveButton>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentralProjectsAssignment;
