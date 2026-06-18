import React from 'react';
import { mockProjects, districtStats } from '../data/mockData';
import StatCard from './StatCard';

const DistrictDetailView = ({ state, district, onBack }) => {
    // Filter projects for this district
    const projects = mockProjects.filter(p => p.district === district && p.state === state);

    // Get stats from mock data or calculate
    const stats = districtStats[district] || {
        projects: projects.length,
        fundAllocated: projects.reduce((acc, p) => acc + p.fundAllocated, 0),
        projectsCompleted: projects.filter(p => p.status === 'COMPLETED').length,
        projectsOngoing: projects.filter(p => p.status === 'ONGOING').length
    };

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };

    return (
        <div className="district-detail-view">
            {/* Stats Row */}
            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    icon="📊"
                    value={stats.projects}
                    label="Total Projects"
                />
                <StatCard
                    icon="💰"
                    value={formatCurrency(stats.fundAllocated)}
                    label="Fund Allocated"
                />
                <StatCard
                    icon="✅"
                    value={stats.projectsCompleted}
                    label="Completed"
                />
                <StatCard
                    icon="🚧"
                    value={stats.projectsOngoing}
                    label="Ongoing"
                />
            </div>

            {/* Projects List */}
            <div className="card">
                <div className="card-header">
                    <h3>Projects in {district}</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Component</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Fund Allocated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length > 0 ? (
                                projects.map(project => (
                                    <tr key={project.id}>
                                        <td>
                                            <div style={{ fontWeight: '500' }}>{project.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{project.gp}</div>
                                        </td>
                                        <td>{project.component}</td>
                                        <td>{project.department}</td>
                                        <td>
                                            <span className={`badge badge-${project.status.toLowerCase()}`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="progress-bar" style={{ width: '80px', height: '6px' }}>
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span style={{ fontSize: '12px' }}>{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td>₹{(project.fundAllocated / 100000).toFixed(2)} L</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No projects found for {district} district.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DistrictDetailView;
